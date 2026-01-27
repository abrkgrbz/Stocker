using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Master;
using Stocker.Application.Features.Reports.Commands.DeleteScheduledReport;
using Stocker.Application.Features.Reports.Commands.DownloadReport;
using Stocker.Application.Features.Reports.Commands.GenerateReport;
using Stocker.Application.Features.Reports.Commands.ScheduleReport;
using Stocker.Application.Features.Reports.Commands.ToggleScheduledReport;
using Stocker.Application.Features.Reports.Queries.GetReportHistory;
using Stocker.Application.Features.Reports.Queries.GetReportTypes;
using Stocker.Application.Features.Reports.Queries.GetReportTypesGrouped;
using Stocker.Application.Features.Reports.Queries.GetScheduledReports;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Reports")]
public class ReportsController : MasterControllerBase
{
    public ReportsController(
        IMediator mediator,
        ILogger<ReportsController> logger)
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
        _logger.LogInformation("Getting available report types");

        var query = new GetReportTypesQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Get report types grouped by category
    /// </summary>
    [HttpGet("types/grouped")]
    [ProducesResponseType(typeof(ApiResponse<Dictionary<string, List<ReportTypeDto>>>), 200)]
    public async Task<IActionResult> GetReportTypesGrouped()
    {
        _logger.LogInformation("Getting report types grouped by category");

        var query = new GetReportTypesGroupedQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Generate a report
    /// </summary>
    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiResponse<ReportResultDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GenerateReport([FromBody] GenerateReportRequest request)
    {
        _logger.LogInformation("Report generation requested: {ReportType} for period {StartDate} to {EndDate}",
            request.ReportType, request.StartDate, request.EndDate);

        var command = new GenerateReportCommand(request, CurrentUserEmail);
        var result = await _mediator.Send(command);

        return HandleResult(result);
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
        _logger.LogInformation("Getting report history: page {Page}, pageSize {PageSize}", page, pageSize);

        var query = new GetReportHistoryQuery(page, pageSize);
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Download a report as CSV
    /// </summary>
    [HttpGet("download/{reportId}")]
    [ProducesResponseType(typeof(FileResult), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DownloadReport(Guid reportId, [FromQuery] string format = "csv")
    {
        _logger.LogInformation("Report download requested: {ReportId} in {Format} format", reportId, format);

        var command = new DownloadReportCommand(reportId, format);
        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return NotFound(new ApiResponse<object>
            {
                Success = false,
                Message = result.Error.Description
            });
        }

        return File(result.Value.Content, "text/csv", result.Value.FileName);
    }

    /// <summary>
    /// Schedule a recurring report
    /// </summary>
    [HttpPost("schedule")]
    [ProducesResponseType(typeof(ApiResponse<ScheduledReportDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> ScheduleReport([FromBody] ScheduleReportRequest request)
    {
        _logger.LogInformation("Report scheduling requested: {ReportType} with frequency {Frequency}",
            request.ReportType, request.Frequency);

        var command = new ScheduleReportCommand(request, CurrentUserEmail);
        var result = await _mediator.Send(command);

        return HandleResult(result);
    }

    /// <summary>
    /// Get scheduled reports
    /// </summary>
    [HttpGet("scheduled")]
    [ProducesResponseType(typeof(ApiResponse<List<ScheduledReportDto>>), 200)]
    public async Task<IActionResult> GetScheduledReports()
    {
        _logger.LogInformation("Getting scheduled reports");

        var query = new GetScheduledReportsQuery();
        var result = await _mediator.Send(query);

        return HandleResult(result);
    }

    /// <summary>
    /// Toggle scheduled report status
    /// </summary>
    [HttpPost("scheduled/{id}/toggle")]
    [ProducesResponseType(typeof(ApiResponse<ScheduledReportDto>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ToggleScheduledReport(Guid id)
    {
        _logger.LogInformation("Toggle scheduled report: {ReportId}", id);

        var command = new ToggleScheduledReportCommand(id);
        var result = await _mediator.Send(command);

        return HandleResult(result);
    }

    /// <summary>
    /// Delete a scheduled report
    /// </summary>
    [HttpDelete("scheduled/{id}")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteScheduledReport(Guid id)
    {
        _logger.LogWarning("Scheduled report deletion requested: {ReportId} by user {UserEmail}",
            id, CurrentUserEmail);

        var command = new DeleteScheduledReportCommand(id);
        var result = await _mediator.Send(command);

        return HandleResult(result);
    }
}
