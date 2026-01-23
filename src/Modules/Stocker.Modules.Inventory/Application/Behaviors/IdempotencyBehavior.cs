using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Behaviors;

/// <summary>
/// MediatR pipeline behavior that ensures idempotent command processing.
/// If a command with the same RequestId has already been processed,
/// returns a failure result instead of processing it again.
/// </summary>
public class IdempotencyBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IIdempotentCommand
    where TResponse : class
{
    private readonly IInventoryUnitOfWork _unitOfWork;
    private readonly ILogger<IdempotencyBehavior<TRequest, TResponse>> _logger;

    public IdempotencyBehavior(
        IInventoryUnitOfWork unitOfWork,
        ILogger<IdempotencyBehavior<TRequest, TResponse>> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestId = request.RequestId;

        // If no RequestId provided, skip idempotency check
        if (requestId == Guid.Empty)
        {
            return await next();
        }

        var commandName = typeof(TRequest).Name;

        // Check if this request was already processed
        var alreadyProcessed = await _unitOfWork.ProcessedRequests
            .ExistsAsync(requestId, cancellationToken);

        if (alreadyProcessed)
        {
            _logger.LogWarning(
                "Duplicate request detected. RequestId: {RequestId}, Command: {CommandName}. Skipping processing.",
                requestId, commandName);

            // Return a validation error for duplicate requests
            var errorResult = CreateDuplicateError(requestId, commandName);
            if (errorResult != null)
                return errorResult;

            // Fallback: if we can't create a typed error, still skip processing
            return await next();
        }

        // Process the request
        var response = await next();

        // Record the processed request (only if successful)
        if (IsSuccessResult(response))
        {
            await _unitOfWork.ProcessedRequests.AddAsync(
                new Domain.Entities.ProcessedRequest(requestId, commandName),
                cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return response;
    }

    private static TResponse? CreateDuplicateError(Guid requestId, string commandName)
    {
        // Handle Result<T> types
        var responseType = typeof(TResponse);
        if (responseType.IsGenericType && responseType.GetGenericTypeDefinition() == typeof(Result<>))
        {
            var error = new Error(
                "Idempotency.DuplicateRequest",
                $"Bu istek daha önce işlenmiş. RequestId: {requestId}, Command: {commandName}",
                ErrorType.Conflict);

            var failureMethod = responseType.GetMethod("Failure", new[] { typeof(Error) });
            if (failureMethod != null)
            {
                return (TResponse)failureMethod.Invoke(null, new object[] { error })!;
            }
        }

        return null;
    }

    private static bool IsSuccessResult(TResponse response)
    {
        // Check if the response is a Result type and if it's successful
        var responseType = typeof(TResponse);
        if (responseType.IsGenericType && responseType.GetGenericTypeDefinition() == typeof(Result<>))
        {
            var isSuccessProperty = responseType.GetProperty("IsSuccess");
            if (isSuccessProperty != null)
            {
                return (bool)isSuccessProperty.GetValue(response)!;
            }
        }

        return response != null;
    }
}
