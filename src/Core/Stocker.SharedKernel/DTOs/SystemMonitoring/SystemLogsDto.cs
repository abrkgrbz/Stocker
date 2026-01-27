namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record SystemLogEntryDto(
    string Id,
    DateTime Timestamp,
    string Level,
    string Source,
    string Message,
    string? CorrelationId,
    string? Exception,
    Dictionary<string, object> Properties
);

public record LogSummaryDto(
    int ErrorCount,
    int WarningCount,
    int InfoCount,
    int DebugCount
);

public record SystemLogsResponseDto(
    List<SystemLogEntryDto> Logs,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages,
    LogSummaryDto Summary
);
