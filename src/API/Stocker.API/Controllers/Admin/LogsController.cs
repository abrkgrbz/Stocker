using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Contexts;

namespace Stocker.API.Controllers.Admin;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "SistemYoneticisi,Admin")]
public class LogsController : ControllerBase
{
    private readonly MasterDbContext _context;
    private readonly ILogger<LogsController> _logger;
    private readonly string _logPath;

    public LogsController(
        MasterDbContext context,
        ILogger<LogsController> logger,
        IWebHostEnvironment env)
    {
        _context = context;
        _logger = logger;
        _logPath = Path.Combine(env.ContentRootPath, "logs");
    }

    /// <summary>
    /// Get recent logs from database
    /// </summary>
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentLogs(
        [FromQuery] int pageSize = 100,
        [FromQuery] int page = 1,
        [FromQuery] string? level = null,
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        try
        {
            var query = "SELECT TOP (@PageSize) * FROM Logs WHERE 1=1";
            var parameters = new List<object>();

            if (!string.IsNullOrEmpty(level))
            {
                query += " AND Level = @Level";
                parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@Level", level));
            }

            if (from.HasValue)
            {
                query += " AND TimeStamp >= @From";
                parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@From", from.Value));
            }

            if (to.HasValue)
            {
                query += " AND TimeStamp <= @To";
                parameters.Add(new Microsoft.Data.SqlClient.SqlParameter("@To", to.Value));
            }

            query += " ORDER BY TimeStamp DESC";
            parameters.Insert(0, new Microsoft.Data.SqlClient.SqlParameter("@PageSize", pageSize));

            var logs = await _context.Database
                .SqlQueryRaw<LogEntry>(query, parameters.ToArray())
                .ToListAsync();

            return Ok(new
            {
                logs,
                total = logs.Count,
                page,
                pageSize
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching logs");
            return StatusCode(500, "Log sorgulama sırasında hata oluştu");
        }
    }

    /// <summary>
    /// Get log files list
    /// </summary>
    [HttpGet("files")]
    public IActionResult GetLogFiles()
    {
        try
        {
            if (!Directory.Exists(_logPath))
            {
                return Ok(new { files = Array.Empty<object>() });
            }

            var files = Directory.GetFiles(_logPath)
                .Select(f => new FileInfo(f))
                .OrderByDescending(f => f.LastWriteTime)
                .Select(f => new
                {
                    name = f.Name,
                    size = f.Length,
                    sizeFormatted = FormatFileSize(f.Length),
                    lastModified = f.LastWriteTime,
                    type = f.Extension
                })
                .ToList();

            return Ok(new { files });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing log files");
            return StatusCode(500, "Log dosyaları listelenirken hata oluştu");
        }
    }

    /// <summary>
    /// Download specific log file
    /// </summary>
    [HttpGet("files/{fileName}")]
    public IActionResult DownloadLogFile(string fileName)
    {
        try
        {
            var filePath = Path.Combine(_logPath, fileName);
            
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Log dosyası bulunamadı");
            }

            // Security check - prevent directory traversal
            var fullPath = Path.GetFullPath(filePath);
            if (!fullPath.StartsWith(_logPath))
            {
                return Forbid();
            }

            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "application/octet-stream", fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading log file: {FileName}", fileName);
            return StatusCode(500, "Log dosyası indirilirken hata oluştu");
        }
    }

    /// <summary>
    /// View log file content
    /// </summary>
    [HttpGet("files/{fileName}/content")]
    public async Task<IActionResult> ViewLogFile(string fileName, [FromQuery] int? lines = 1000)
    {
        try
        {
            var filePath = Path.Combine(_logPath, fileName);
            
            if (!System.IO.File.Exists(filePath))
            {
                return NotFound("Log dosyası bulunamadı");
            }

            // Security check
            var fullPath = Path.GetFullPath(filePath);
            if (!fullPath.StartsWith(_logPath))
            {
                return Forbid();
            }

            string content;
            if (lines.HasValue && lines.Value > 0)
            {
                // Read last N lines
                var allLines = await System.IO.File.ReadAllLinesAsync(filePath);
                var lastLines = allLines.TakeLast(lines.Value).ToArray();
                content = string.Join("\n", lastLines);
            }
            else
            {
                // Read entire file (be careful with large files)
                content = await System.IO.File.ReadAllTextAsync(filePath);
            }

            return Ok(new
            {
                fileName,
                content,
                lines = content.Split('\n').Length,
                size = new FileInfo(filePath).Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reading log file: {FileName}", fileName);
            return StatusCode(500, "Log dosyası okunurken hata oluştu");
        }
    }

    /// <summary>
    /// Get log statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetLogStats()
    {
        try
        {
            var query = @"
                SELECT 
                    Level,
                    COUNT(*) as Count,
                    MAX(TimeStamp) as LastOccurrence
                FROM Logs
                WHERE TimeStamp >= DATEADD(day, -7, GETDATE())
                GROUP BY Level";

            var stats = await _context.Database
                .SqlQueryRaw<LogLevelStats>(query)
                .ToListAsync();

            var totalLogs = stats.Sum(s => s.Count);
            
            return Ok(new
            {
                stats,
                totalLogs,
                period = "Last 7 days"
            });
        }
        catch
        {
            // If Logs table doesn't exist yet
            return Ok(new
            {
                stats = Array.Empty<LogLevelStats>(),
                totalLogs = 0,
                period = "Last 7 days"
            });
        }
    }

    /// <summary>
    /// Clear old logs
    /// </summary>
    [HttpDelete("clear")]
    [Authorize(Policy = "RequireMasterAccess")]
    public async Task<IActionResult> ClearOldLogs([FromQuery] int daysToKeep = 30)
    {
        try
        {
            // Clear database logs
            var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);
            var deleteQuery = "DELETE FROM Logs WHERE TimeStamp < @CutoffDate";
            var deletedRows = await _context.Database.ExecuteSqlRawAsync(
                deleteQuery, 
                new Microsoft.Data.SqlClient.SqlParameter("@CutoffDate", cutoffDate));

            // Clear old log files
            var deletedFiles = 0;
            if (Directory.Exists(_logPath))
            {
                var files = Directory.GetFiles(_logPath)
                    .Select(f => new FileInfo(f))
                    .Where(f => f.LastWriteTime < cutoffDate);

                foreach (var file in files)
                {
                    file.Delete();
                    deletedFiles++;
                }
            }

            _logger.LogInformation("Cleared {DeletedRows} log entries and {DeletedFiles} log files older than {Days} days",
                deletedRows, deletedFiles, daysToKeep);

            return Ok(new
            {
                message = $"{deletedRows} log kaydı ve {deletedFiles} log dosyası silindi",
                deletedRows,
                deletedFiles
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing old logs");
            return StatusCode(500, "Log temizleme sırasında hata oluştu");
        }
    }

    private string FormatFileSize(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}

public class LogEntry
{
    public int Id { get; set; }
    public string? Message { get; set; }
    public string? MessageTemplate { get; set; }
    public string? Level { get; set; }
    public DateTime TimeStamp { get; set; }
    public string? Exception { get; set; }
    public string? Properties { get; set; }
}

public class LogLevelStats
{
    public string Level { get; set; } = string.Empty;
    public int Count { get; set; }
    public DateTime LastOccurrence { get; set; }
}