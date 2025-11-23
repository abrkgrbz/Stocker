using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Persistence.Contexts;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;
using Npgsql;

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
        var query = "SELECT * FROM \"Logs\" WHERE 1=1";
        var parameters = new List<object>();

        if (!string.IsNullOrEmpty(level))
        {
            query += " AND \"Level\" = @Level";
            parameters.Add(new NpgsqlParameter("@Level", level));
        }

        if (from.HasValue)
        {
            query += " AND \"TimeStamp\" >= @From";
            parameters.Add(new NpgsqlParameter("@From", from.Value));
        }

        if (to.HasValue)
        {
            query += " AND \"TimeStamp\" <= @To";
            parameters.Add(new NpgsqlParameter("@To", to.Value));
        }

        query += " ORDER BY \"TimeStamp\" DESC LIMIT @PageSize";
        parameters.Add(new NpgsqlParameter("@PageSize", pageSize));

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

    /// <summary>
    /// Get log files list
    /// </summary>
    [HttpGet("files")]
    public IActionResult GetLogFiles()
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

    /// <summary>
    /// Download specific log file
    /// </summary>
    [HttpGet("files/{fileName}")]
    public IActionResult DownloadLogFile(string fileName)
    {
        var filePath = Path.Combine(_logPath, fileName);
        
        if (!System.IO.File.Exists(filePath))
            throw new Stocker.Application.Common.Exceptions.NotFoundException("LogFile", fileName);

        // Security check - prevent directory traversal
        var fullPath = Path.GetFullPath(filePath);
        if (!fullPath.StartsWith(_logPath))
            throw new ForbiddenException("Access denied to this file");

        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        return File(fileBytes, "application/octet-stream", fileName);
    }

    /// <summary>
    /// View log file content
    /// </summary>
    [HttpGet("files/{fileName}/content")]
    public async Task<IActionResult> ViewLogFile(string fileName, [FromQuery] int? lines = 1000)
    {
        var filePath = Path.Combine(_logPath, fileName);
        
        if (!System.IO.File.Exists(filePath))
            throw new Stocker.Application.Common.Exceptions.NotFoundException("LogFile", fileName);

        // Security check
        var fullPath = Path.GetFullPath(filePath);
        if (!fullPath.StartsWith(_logPath))
            throw new ForbiddenException("Access denied to this file");

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
        // Clear database logs
        var cutoffDate = DateTime.UtcNow.AddDays(-daysToKeep);
        var deleteQuery = "DELETE FROM \"Logs\" WHERE \"TimeStamp\" < @CutoffDate";
        var deletedRows = await _context.Database.ExecuteSqlRawAsync(
            deleteQuery,
            new NpgsqlParameter("@CutoffDate", cutoffDate));

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