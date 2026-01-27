using Stocker.Application.DTOs.Master;

namespace Stocker.Application.Common.Interfaces;

public interface IReportsService
{
    Task<List<ReportTypeDto>> GetReportTypesAsync(CancellationToken cancellationToken = default);

    Task<Dictionary<string, List<ReportTypeDto>>> GetReportTypesGroupedAsync(CancellationToken cancellationToken = default);

    Task<ReportResultDto?> GenerateReportAsync(
        GenerateReportRequest request,
        string currentUserEmail,
        CancellationToken cancellationToken = default);

    Task<List<ReportHistoryDto>> GetReportHistoryAsync(
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default);

    Task<(byte[] Content, string FileName)?> DownloadReportAsync(
        Guid reportId,
        string format = "csv",
        CancellationToken cancellationToken = default);

    Task<ScheduledReportDto?> ScheduleReportAsync(
        ScheduleReportRequest request,
        string currentUserEmail,
        CancellationToken cancellationToken = default);

    Task<List<ScheduledReportDto>> GetScheduledReportsAsync(CancellationToken cancellationToken = default);

    Task<ScheduledReportDto?> ToggleScheduledReportAsync(
        Guid id,
        CancellationToken cancellationToken = default);

    Task<bool> DeleteScheduledReportAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}
