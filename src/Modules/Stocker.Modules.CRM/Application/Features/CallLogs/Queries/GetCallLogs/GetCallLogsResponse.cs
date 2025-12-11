namespace Stocker.Modules.CRM.Application.Features.CallLogs.Queries.GetCallLogs;

public record GetCallLogsResponse(
    List<CallLogDto> CallLogs,
    int TotalCount);
