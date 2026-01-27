using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

/// <summary>
/// Report execution history record
/// </summary>
public sealed class ReportExecution : Entity
{
    public Guid? ScheduleId { get; private set; }
    public string ReportType { get; private set; }
    public string ReportName { get; private set; }
    public ReportExecutionStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public int? DurationMs { get; private set; }
    public string? OutputPath { get; private set; }
    public long? FileSizeBytes { get; private set; }
    public string? Parameters { get; private set; } // JSON
    public string? ErrorMessage { get; private set; }
    public string ExecutedBy { get; private set; }
    public int? RecordCount { get; private set; }

    private ReportExecution() : base() { } // EF Core

    private ReportExecution(
        Guid? scheduleId,
        string reportType,
        string reportName,
        string executedBy) : base(Guid.NewGuid())
    {
        ScheduleId = scheduleId;
        ReportType = reportType;
        ReportName = reportName;
        ExecutedBy = executedBy;
        Status = ReportExecutionStatus.Running;
        StartedAt = DateTime.UtcNow;
    }

    public static ReportExecution Start(
        string reportType,
        string reportName,
        string executedBy,
        Guid? scheduleId = null,
        string? parameters = null)
    {
        if (string.IsNullOrWhiteSpace(reportType))
            throw new ArgumentException("Report type cannot be empty", nameof(reportType));

        if (string.IsNullOrWhiteSpace(reportName))
            throw new ArgumentException("Report name cannot be empty", nameof(reportName));

        if (string.IsNullOrWhiteSpace(executedBy))
            throw new ArgumentException("ExecutedBy cannot be empty", nameof(executedBy));

        var execution = new ReportExecution(scheduleId, reportType, reportName, executedBy)
        {
            Parameters = parameters
        };

        return execution;
    }

    /// <summary>
    /// Mark as completed successfully
    /// </summary>
    public void Complete(string? outputPath = null, long? fileSizeBytes = null, int? recordCount = null)
    {
        if (Status != ReportExecutionStatus.Running)
            throw new InvalidOperationException("Can only complete a running execution");

        Status = ReportExecutionStatus.Completed;
        CompletedAt = DateTime.UtcNow;
        DurationMs = (int)(CompletedAt.Value - StartedAt).TotalMilliseconds;
        OutputPath = outputPath;
        FileSizeBytes = fileSizeBytes;
        RecordCount = recordCount;
    }

    /// <summary>
    /// Mark as failed
    /// </summary>
    public void Fail(string errorMessage)
    {
        if (Status != ReportExecutionStatus.Running)
            throw new InvalidOperationException("Can only fail a running execution");

        if (string.IsNullOrWhiteSpace(errorMessage))
            throw new ArgumentException("Error message cannot be empty", nameof(errorMessage));

        Status = ReportExecutionStatus.Failed;
        CompletedAt = DateTime.UtcNow;
        DurationMs = (int)(CompletedAt.Value - StartedAt).TotalMilliseconds;
        ErrorMessage = errorMessage;
    }

    /// <summary>
    /// Cancel the execution
    /// </summary>
    public void Cancel()
    {
        if (Status != ReportExecutionStatus.Running)
            throw new InvalidOperationException("Can only cancel a running execution");

        Status = ReportExecutionStatus.Cancelled;
        CompletedAt = DateTime.UtcNow;
        DurationMs = (int)(CompletedAt.Value - StartedAt).TotalMilliseconds;
    }
}
