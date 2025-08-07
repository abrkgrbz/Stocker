using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using System.Data.Common;
using System.Diagnostics;

namespace Stocker.Persistence.Interceptors;

public class PerformanceInterceptor : DbCommandInterceptor
{
    private readonly ILogger<PerformanceInterceptor> _logger;
    private readonly int _slowQueryThresholdMs;

    public PerformanceInterceptor(ILogger<PerformanceInterceptor> logger, int slowQueryThresholdMs = 1000)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _slowQueryThresholdMs = slowQueryThresholdMs;
    }

    public override DbCommand CommandCreated(CommandEndEventData eventData, DbCommand result)
    {
        return base.CommandCreated(eventData, result);
    }

    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        LogIfSlow(command, eventData);
        return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override DbDataReader ReaderExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result)
    {
        LogIfSlow(command, eventData);
        return base.ReaderExecuted(command, eventData, result);
    }

    public override ValueTask<object?> ScalarExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        object? result,
        CancellationToken cancellationToken = default)
    {
        LogIfSlow(command, eventData);
        return base.ScalarExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override object? ScalarExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        object? result)
    {
        LogIfSlow(command, eventData);
        return base.ScalarExecuted(command, eventData, result);
    }

    public override ValueTask<int> NonQueryExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        LogIfSlow(command, eventData);
        return base.NonQueryExecutedAsync(command, eventData, result, cancellationToken);
    }

    public override int NonQueryExecuted(
        DbCommand command,
        CommandExecutedEventData eventData,
        int result)
    {
        LogIfSlow(command, eventData);
        return base.NonQueryExecuted(command, eventData, result);
    }

    private void LogIfSlow(DbCommand command, CommandExecutedEventData eventData)
    {
        if (eventData.Duration.TotalMilliseconds > _slowQueryThresholdMs)
        {
            var parameters = command.Parameters.Cast<DbParameter>()
                .Select(p => $"{p.ParameterName}={p.Value}")
                .ToList();

            _logger.LogWarning(
                "Slow query detected. Duration: {Duration}ms, Command: {CommandText}, Parameters: {Parameters}",
                eventData.Duration.TotalMilliseconds,
                command.CommandText,
                string.Join(", ", parameters));
        }
    }
}