namespace Stocker.SharedKernel.DTOs.SystemMonitoring;

public record SystemAlertDto(
    string Id,
    string Type,
    string Severity,
    string Title,
    string Message,
    string Source,
    DateTime Timestamp,
    bool IsActive,
    string? AcknowledgedBy,
    DateTime? AcknowledgedAt
);
