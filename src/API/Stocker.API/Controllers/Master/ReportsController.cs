using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Master;
using Swashbuckle.AspNetCore.Annotations;
using System.Text;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Reports - Generate and manage system reports")]
public class ReportsController : MasterControllerBase
{
    public ReportsController(IMediator mediator, ILogger<ReportsController> logger) 
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Get available report types
    /// </summary>
    [HttpGet("types")]
    [ProducesResponseType(typeof(ApiResponse<List<ReportTypeDto>>), 200)]
    public async Task<IActionResult> GetReportTypes()
    {
        var reportTypes = new List<ReportTypeDto>
        {
            new ReportTypeDto
            {
                Id = "revenue",
                Name = "Gelir Raporu",
                Description = "Aylık ve yıllık gelir analizleri",
                Category = "Financial",
                Icon = "DollarOutlined",
                IsAvailable = true
            },
            new ReportTypeDto
            {
                Id = "tenant-usage",
                Name = "Kiracı Kullanım Raporu",
                Description = "Kiracı bazlı kullanım istatistikleri",
                Category = "Usage",
                Icon = "TeamOutlined",
                IsAvailable = true
            },
            new ReportTypeDto
            {
                Id = "system-performance",
                Name = "Sistem Performans Raporu",
                Description = "Sistem performans metrikleri",
                Category = "Technical",
                Icon = "ThunderboltOutlined",
                IsAvailable = true
            },
            new ReportTypeDto
            {
                Id = "user-activity",
                Name = "Kullanıcı Aktivite Raporu",
                Description = "Kullanıcı giriş ve aktivite logları",
                Category = "Activity",
                Icon = "UserOutlined",
                IsAvailable = true
            },
            new ReportTypeDto
            {
                Id = "subscription-analytics",
                Name = "Abonelik Analiz Raporu",
                Description = "Abonelik durumları ve trendler",
                Category = "Business",
                Icon = "CrownOutlined",
                IsAvailable = true
            },
            new ReportTypeDto
            {
                Id = "error-logs",
                Name = "Hata Log Raporu",
                Description = "Sistem hataları ve exception'lar",
                Category = "Technical",
                Icon = "WarningOutlined",
                IsAvailable = true
            }
        };

        return Ok(new ApiResponse<List<ReportTypeDto>>
        {
            Success = true,
            Data = reportTypes,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Generate a report
    /// </summary>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiResponse<ReportResultDto>), 200)]
    public async Task<IActionResult> GenerateReport([FromBody] GenerateReportRequest request)
    {
        _logger.LogInformation("Generating report: {ReportType} for period {StartDate} to {EndDate}", 
            request.ReportType, request.StartDate, request.EndDate);

        // Simulate report generation
        await Task.Delay(1000); // Simulate processing time

        var result = new ReportResultDto
        {
            ReportId = Guid.NewGuid(),
            ReportType = request.ReportType,
            Title = GetReportTitle(request.ReportType),
            GeneratedAt = DateTime.UtcNow,
            GeneratedBy = CurrentUserEmail,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Format = request.Format ?? "json",
            Status = "Completed",
            Data = GenerateReportData(request.ReportType, request.StartDate, request.EndDate),
            Summary = GenerateReportSummary(request.ReportType)
        };

        return Ok(new ApiResponse<ReportResultDto>
        {
            Success = true,
            Data = result,
            Message = "Rapor başarıyla oluşturuldu",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get report history
    /// </summary>
    [HttpGet("history")]
    [ProducesResponseType(typeof(ApiResponse<List<ReportHistoryDto>>), 200)]
    public async Task<IActionResult> GetReportHistory(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        var history = new List<ReportHistoryDto>();
        var reportTypes = new[] { "revenue", "tenant-usage", "system-performance", "user-activity" };

        for (int i = 0; i < 15; i++)
        {
            history.Add(new ReportHistoryDto
            {
                Id = Guid.NewGuid(),
                ReportType = reportTypes[i % reportTypes.Length],
                Title = GetReportTitle(reportTypes[i % reportTypes.Length]),
                GeneratedAt = DateTime.UtcNow.AddDays(-i),
                GeneratedBy = i % 2 == 0 ? "admin@stocker.com" : "system@stocker.com",
                Format = i % 3 == 0 ? "pdf" : i % 3 == 1 ? "excel" : "json",
                FileSize = Random.Shared.Next(100, 5000), // KB
                Status = "Completed"
            });
        }

        var paginatedHistory = history
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        return Ok(new ApiResponse<List<ReportHistoryDto>>
        {
            Success = true,
            Data = paginatedHistory,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Download a report
    /// </summary>
    [HttpGet("download/{reportId}")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DownloadReport(Guid reportId, [FromQuery] string format = "pdf")
    {
        _logger.LogInformation("Downloading report {ReportId} in {Format} format", reportId, format);

        // In a real implementation, this would fetch the actual report
        byte[] fileContent;
        string contentType;
        string fileName;

        switch (format.ToLower())
        {
            case "pdf":
                fileContent = Encoding.UTF8.GetBytes("Mock PDF content");
                contentType = "application/pdf";
                fileName = $"report_{reportId}.pdf";
                break;
            case "excel":
                fileContent = Encoding.UTF8.GetBytes("Mock Excel content");
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                fileName = $"report_{reportId}.xlsx";
                break;
            case "csv":
                fileContent = Encoding.UTF8.GetBytes("Mock CSV content");
                contentType = "text/csv";
                fileName = $"report_{reportId}.csv";
                break;
            default:
                fileContent = Encoding.UTF8.GetBytes("{ \"mock\": \"json content\" }");
                contentType = "application/json";
                fileName = $"report_{reportId}.json";
                break;
        }

        return File(fileContent, contentType, fileName);
    }

    /// <summary>
    /// Schedule a recurring report
    /// </summary>
    [HttpPost("schedule")]
    [ProducesResponseType(typeof(ApiResponse<ScheduledReportDto>), 200)]
    public async Task<IActionResult> ScheduleReport([FromBody] ScheduleReportRequest request)
    {
        _logger.LogInformation("Scheduling report: {ReportType} with frequency {Frequency}", 
            request.ReportType, request.Frequency);

        var scheduledReport = new ScheduledReportDto
        {
            Id = Guid.NewGuid(),
            ReportType = request.ReportType,
            Title = GetReportTitle(request.ReportType),
            Frequency = request.Frequency,
            Recipients = request.Recipients,
            Format = request.Format,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = CurrentUserEmail,
            NextRunTime = CalculateNextRunTime(request.Frequency),
            LastRunTime = null
        };

        return Ok(new ApiResponse<ScheduledReportDto>
        {
            Success = true,
            Data = scheduledReport,
            Message = "Rapor zamanlaması başarıyla oluşturuldu",
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Get scheduled reports
    /// </summary>
    [HttpGet("scheduled")]
    [ProducesResponseType(typeof(ApiResponse<List<ScheduledReportDto>>), 200)]
    public async Task<IActionResult> GetScheduledReports()
    {
        var scheduledReports = new List<ScheduledReportDto>
        {
            new ScheduledReportDto
            {
                Id = Guid.NewGuid(),
                ReportType = "revenue",
                Title = "Aylık Gelir Raporu",
                Frequency = "monthly",
                Recipients = new[] { "admin@stocker.com", "finance@stocker.com" },
                Format = "pdf",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-2),
                CreatedBy = "admin@stocker.com",
                NextRunTime = DateTime.UtcNow.AddDays(5),
                LastRunTime = DateTime.UtcNow.AddMonths(-1)
            },
            new ScheduledReportDto
            {
                Id = Guid.NewGuid(),
                ReportType = "tenant-usage",
                Title = "Haftalık Kullanım Raporu",
                Frequency = "weekly",
                Recipients = new[] { "admin@stocker.com" },
                Format = "excel",
                IsActive = true,
                CreatedAt = DateTime.UtcNow.AddMonths(-1),
                CreatedBy = "system@stocker.com",
                NextRunTime = DateTime.UtcNow.AddDays(2),
                LastRunTime = DateTime.UtcNow.AddDays(-5)
            }
        };

        return Ok(new ApiResponse<List<ScheduledReportDto>>
        {
            Success = true,
            Data = scheduledReports,
            Timestamp = DateTime.UtcNow
        });
    }

    /// <summary>
    /// Delete a scheduled report
    /// </summary>
    [HttpDelete("scheduled/{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    public async Task<IActionResult> DeleteScheduledReport(Guid id)
    {
        _logger.LogWarning("Deleting scheduled report {ReportId} by user {UserEmail}", 
            id, CurrentUserEmail);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Zamanlanmış rapor başarıyla silindi",
            Timestamp = DateTime.UtcNow
        });
    }

    #region Helper Methods

    private string GetReportTitle(string reportType)
    {
        return reportType switch
        {
            "revenue" => "Gelir Raporu",
            "tenant-usage" => "Kiracı Kullanım Raporu",
            "system-performance" => "Sistem Performans Raporu",
            "user-activity" => "Kullanıcı Aktivite Raporu",
            "subscription-analytics" => "Abonelik Analiz Raporu",
            "error-logs" => "Hata Log Raporu",
            _ => "Genel Rapor"
        };
    }

    private object GenerateReportData(string reportType, DateTime startDate, DateTime endDate)
    {
        // Generate mock data based on report type
        return reportType switch
        {
            "revenue" => new
            {
                totalRevenue = 524350,
                monthlyRevenue = new[]
                {
                    new { month = "Ocak", revenue = 42000 },
                    new { month = "Şubat", revenue = 45000 },
                    new { month = "Mart", revenue = 48000 }
                },
                topPackages = new[]
                {
                    new { package = "Enterprise", revenue = 250000 },
                    new { package = "Professional", revenue = 180000 },
                    new { package = "Starter", revenue = 94350 }
                }
            },
            "tenant-usage" => new
            {
                totalTenants = 386,
                activeTenants = 342,
                averageUsers = 12.5,
                storageUsage = new
                {
                    total = 2456, // GB
                    average = 6.4 // GB per tenant
                }
            },
            _ => new { message = "Report data generated successfully" }
        };
    }

    private ReportSummaryDto GenerateReportSummary(string reportType)
    {
        return new ReportSummaryDto
        {
            TotalRecords = Random.Shared.Next(100, 10000),
            ProcessingTime = Random.Shared.Next(100, 5000), // ms
            KeyMetrics = new Dictionary<string, object>
            {
                { "Total", Random.Shared.Next(1000, 100000) },
                { "Average", Random.Shared.Next(10, 1000) },
                { "Growth", $"{Random.Shared.Next(5, 25)}%" }
            }
        };
    }

    private DateTime CalculateNextRunTime(string frequency)
    {
        return frequency.ToLower() switch
        {
            "daily" => DateTime.UtcNow.AddDays(1),
            "weekly" => DateTime.UtcNow.AddDays(7),
            "monthly" => DateTime.UtcNow.AddMonths(1),
            "quarterly" => DateTime.UtcNow.AddMonths(3),
            "yearly" => DateTime.UtcNow.AddYears(1),
            _ => DateTime.UtcNow.AddDays(1)
        };
    }

    #endregion
}