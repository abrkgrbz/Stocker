using FluentValidation;
using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : Result
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);
        
        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
        {
            var errors = string.Join("; ", failures.Select(f => f.ErrorMessage));
            return CreateValidationResult<TResponse>(errors);
        }

        return await next();
    }

    private static TResult CreateValidationResult<TResult>(string errors)
        where TResult : Result
    {
        if (typeof(TResult) == typeof(Result))
        {
            return (TResult)Result.Failure(Error.Validation("ValidationError", errors));
        }

        var genericType = typeof(TResult).GetGenericArguments()[0];
        var resultType = typeof(Result<>).MakeGenericType(genericType);
        var failureMethod = resultType.GetMethod("Failure", new[] { typeof(Error) });
        
        return (TResult)failureMethod!.Invoke(null, new object[] { Error.Validation("ValidationError", errors) })!;
    }
}