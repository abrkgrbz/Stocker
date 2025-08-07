using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Interfaces;
using System.Diagnostics;

namespace Stocker.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;
    private readonly ICurrentUserService _currentUserService;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger, ICurrentUserService currentUserService)
    {
        _logger = logger;
        _currentUserService = currentUserService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _currentUserService.UserId ?? Guid.Empty;
        var userName = _currentUserService.UserName ?? "Anonymous";

        _logger.LogInformation("Handling {RequestName} for User {UserId} ({UserName})", 
            requestName, userId, userName);

        var stopwatch = Stopwatch.StartNew();

        try
        {
            var response = await next();

            stopwatch.Stop();

            if (stopwatch.ElapsedMilliseconds > 500)
            {
                _logger.LogWarning("Long Running Request: {RequestName} ({ElapsedMilliseconds} ms) for User {UserId} ({UserName})",
                    requestName, stopwatch.ElapsedMilliseconds, userId, userName);
            }

            _logger.LogInformation("Handled {RequestName} in {ElapsedMilliseconds} ms",
                requestName, stopwatch.ElapsedMilliseconds);

            return response;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            
            _logger.LogError(ex, "Request {RequestName} failed after {ElapsedMilliseconds} ms for User {UserId} ({UserName})",
                requestName, stopwatch.ElapsedMilliseconds, userId, userName);
            
            throw;
        }
    }
}