using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Stocker.SignalR.Constants;

namespace Stocker.SignalR.Hubs;

/// <summary>
/// Base hub class providing common exception handling and logging patterns.
/// All SignalR hubs should inherit from this class for consistent error handling.
/// </summary>
public abstract class BaseHub : Hub
{
    protected readonly ILogger Logger;

    protected BaseHub(ILogger logger)
    {
        Logger = logger;
    }

    /// <summary>
    /// Executes a hub method with consistent error handling and logging.
    /// Catches exceptions, logs them, and sends error notifications to the caller.
    /// </summary>
    /// <typeparam name="T">The return type of the operation</typeparam>
    /// <param name="operation">The async operation to execute</param>
    /// <param name="operationName">Name of the operation for logging purposes</param>
    /// <param name="errorMessage">User-friendly error message to send on failure</param>
    /// <returns>The result of the operation, or default if an error occurs</returns>
    protected async Task<T?> SafeExecuteAsync<T>(
        Func<Task<T>> operation,
        string operationName,
        string? errorMessage = null)
    {
        try
        {
            return await operation();
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(ex, operationName, errorMessage);
            return default;
        }
    }

    /// <summary>
    /// Executes a hub method with consistent error handling and logging.
    /// Catches exceptions, logs them, and sends error notifications to the caller.
    /// </summary>
    /// <param name="operation">The async operation to execute</param>
    /// <param name="operationName">Name of the operation for logging purposes</param>
    /// <param name="errorMessage">User-friendly error message to send on failure</param>
    protected async Task SafeExecuteAsync(
        Func<Task> operation,
        string operationName,
        string? errorMessage = null)
    {
        try
        {
            await operation();
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(ex, operationName, errorMessage);
        }
    }

    /// <summary>
    /// Handles exceptions by logging and notifying the caller.
    /// </summary>
    /// <param name="ex">The exception that occurred</param>
    /// <param name="operationName">Name of the operation that failed</param>
    /// <param name="errorMessage">User-friendly error message to send</param>
    protected virtual async Task HandleExceptionAsync(
        Exception ex,
        string operationName,
        string? errorMessage = null)
    {
        Logger.LogError(ex,
            "Hub operation failed: Operation={OperationName}, ConnectionId={ConnectionId}",
            operationName, Context.ConnectionId);

        var message = errorMessage ?? "İşlem sırasında bir hata oluştu";

        try
        {
            await Clients.Caller.SendAsync(SignalREvents.Error, new
            {
                operation = operationName,
                message,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception notifyEx)
        {
            Logger.LogError(notifyEx,
                "Failed to notify client of error: ConnectionId={ConnectionId}",
                Context.ConnectionId);
        }
    }

    /// <summary>
    /// Logs connection events in a consistent format.
    /// </summary>
    protected void LogConnection(string action)
    {
        Logger.LogInformation(
            "{HubName} client {Action}: ConnectionId={ConnectionId}",
            GetType().Name, action, Context.ConnectionId);
    }

    /// <summary>
    /// Gets the user ID from the connection context.
    /// </summary>
    protected string? GetUserId()
    {
        return Context.UserIdentifier;
    }

    /// <summary>
    /// Gets a claim value from the authenticated user.
    /// </summary>
    protected string? GetClaim(string claimType)
    {
        return Context.User?.FindFirst(claimType)?.Value;
    }

    public override async Task OnConnectedAsync()
    {
        LogConnection("connected");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception != null)
        {
            Logger.LogError(exception,
                "{HubName} client disconnected with error: ConnectionId={ConnectionId}",
                GetType().Name, Context.ConnectionId);
        }
        else
        {
            LogConnection("disconnected");
        }
        await base.OnDisconnectedAsync(exception);
    }
}

/// <summary>
/// Base hub class with typed client support for strongly-typed hub methods.
/// </summary>
/// <typeparam name="T">The strongly-typed client interface</typeparam>
public abstract class BaseHub<T> : Hub<T> where T : class
{
    protected readonly ILogger Logger;

    protected BaseHub(ILogger logger)
    {
        Logger = logger;
    }

    /// <summary>
    /// Executes a hub method with consistent error handling and logging.
    /// </summary>
    protected async Task<TResult?> SafeExecuteAsync<TResult>(
        Func<Task<TResult>> operation,
        string operationName,
        Func<Exception, Task>? onError = null)
    {
        try
        {
            return await operation();
        }
        catch (Exception ex)
        {
            Logger.LogError(ex,
                "Hub operation failed: Operation={OperationName}, ConnectionId={ConnectionId}",
                operationName, Context.ConnectionId);

            if (onError != null)
            {
                await onError(ex);
            }

            return default;
        }
    }

    /// <summary>
    /// Executes a hub method with consistent error handling and logging.
    /// </summary>
    protected async Task SafeExecuteAsync(
        Func<Task> operation,
        string operationName,
        Func<Exception, Task>? onError = null)
    {
        try
        {
            await operation();
        }
        catch (Exception ex)
        {
            Logger.LogError(ex,
                "Hub operation failed: Operation={OperationName}, ConnectionId={ConnectionId}",
                operationName, Context.ConnectionId);

            if (onError != null)
            {
                await onError(ex);
            }
        }
    }

    /// <summary>
    /// Logs connection events in a consistent format.
    /// </summary>
    protected void LogConnection(string action)
    {
        Logger.LogInformation(
            "{HubName} client {Action}: ConnectionId={ConnectionId}",
            GetType().Name, action, Context.ConnectionId);
    }

    /// <summary>
    /// Gets the user ID from the connection context.
    /// </summary>
    protected string? GetUserId()
    {
        return Context.UserIdentifier;
    }

    /// <summary>
    /// Gets a claim value from the authenticated user.
    /// </summary>
    protected string? GetClaim(string claimType)
    {
        return Context.User?.FindFirst(claimType)?.Value;
    }

    public override async Task OnConnectedAsync()
    {
        LogConnection("connected");
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception != null)
        {
            Logger.LogError(exception,
                "{HubName} client disconnected with error: ConnectionId={ConnectionId}",
                GetType().Name, Context.ConnectionId);
        }
        else
        {
            LogConnection("disconnected");
        }
        await base.OnDisconnectedAsync(exception);
    }
}
