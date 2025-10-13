
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Models;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Extensions;

/// <summary>
/// Extension methods for Result pattern
/// </summary>
public static class ResultExtensions
{
    /// <summary>
    /// Converts Result to ActionResult
    /// </summary>
    public static ActionResult ToActionResult<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(ApiResponse<T>.CreateSuccess(result.Value!));
        }

        return CreateErrorResult(result.Error);
    }

    /// <summary>
    /// Converts Result to ActionResult with custom success message
    /// </summary>
    public static ActionResult ToActionResult<T>(this Result<T> result, string successMessage)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(ApiResponse<T>.CreateSuccess(result.Value!, successMessage));
        }

        return CreateErrorResult(result.Error);
    }

    /// <summary>
    /// Converts Result to ActionResult for commands with no return value
    /// </summary>
    public static ActionResult ToActionResult(this Result result)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(new { success = true, message = "Operation completed successfully" });
        }

        return CreateErrorResult(result.Error);
    }

    /// <summary>
    /// Converts Result to ActionResult with custom success response
    /// </summary>
    public static ActionResult ToActionResult(this Result result, object successResponse)
    {
        if (result.IsSuccess)
        {
            return new OkObjectResult(successResponse);
        }

        return CreateErrorResult(result.Error);
    }

    /// <summary>
    /// Maps Result value to another type
    /// </summary>
    public static Result<TOut> Map<TIn, TOut>(this Result<TIn> result, Func<TIn, TOut> mapper)
    {
        return result.IsSuccess 
            ? Result<TOut>.Success(mapper(result.Value!)) 
            : Result<TOut>.Failure(result.Error);
    }

    /// <summary>
    /// Executes action if Result is successful
    /// </summary>
    public static Result<T> OnSuccess<T>(this Result<T> result, Action<T> action)
    {
        if (result.IsSuccess)
        {
            action(result.Value!);
        }

        return result;
    }

    /// <summary>
    /// Executes action if Result is failure
    /// </summary>
    public static Result<T> OnFailure<T>(this Result<T> result, Action<Error> action)
    {
        if (result.IsFailure)
        {
            action(result.Error);
        }

        return result;
    }

    /// <summary>
    /// Throws exception if Result is failure
    /// </summary>
    public static T ThrowIfFailure<T>(this Result<T> result)
    {
        if (result.IsFailure)
        {
            throw CreateExceptionFromError(result.Error);
        }

        return result.Value!;
    }

    private static ActionResult CreateErrorResult(Error error)
    {
        var problemDetails = ProblemDetailsResponse.Create(error);

        return error.Type switch
        {
            ErrorType.Validation => new BadRequestObjectResult(problemDetails),
            ErrorType.NotFound => new NotFoundObjectResult(problemDetails),
            ErrorType.Unauthorized => new ObjectResult(problemDetails) { StatusCode = 401 },
            ErrorType.Forbidden => new ObjectResult(problemDetails) { StatusCode = 403 },
            ErrorType.Conflict => new ConflictObjectResult(problemDetails),
            ErrorType.Business => new UnprocessableEntityObjectResult(problemDetails),
            _ => new ObjectResult(problemDetails) { StatusCode = 500 }
        };
    }

    private static Exception CreateExceptionFromError(Error error)
    {
        return error.Type switch
        {
            ErrorType.Validation => new Application.Common.Exceptions.ValidationException("Validation", error.Description),
            ErrorType.NotFound => new Application.Common.Exceptions.NotFoundException(error.Code, error.Description),
            ErrorType.Unauthorized => new Application.Common.Exceptions.UnauthorizedException(error.Code, error.Description),
            ErrorType.Forbidden => new Application.Common.Exceptions.ForbiddenAccessException(error.Code, error.Description),
            ErrorType.Business => new Application.Common.Exceptions.BusinessException(error.Code, error.Description),
            ErrorType.Infrastructure => new Application.Common.Exceptions.InfrastructureException(error.Code, error.Description),
            _ => new InvalidOperationException(error.Description)
        };
    }
}