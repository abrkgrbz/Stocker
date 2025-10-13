using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Models;

/// <summary>
/// Standard error response model
/// </summary>
public class ErrorResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? TraceId { get; set; }
    public string ErrorCode { get; set; } = string.Empty;
    public ErrorType ErrorType { get; set; }
    public Dictionary<string, string[]>? Errors { get; set; }

    public static ErrorResponse Create(Error error, string? traceId = null)
    {
        return new ErrorResponse
        {
            Success = false,
            Message = error.Description,
            ErrorCode = error.Code,
            ErrorType = error.Type,
            TraceId = traceId
        };
    }

    public static ErrorResponse Create(string code, string message, ErrorType type = ErrorType.Failure, string? traceId = null)
    {
        return new ErrorResponse
        {
            Success = false,
            Message = message,
            ErrorCode = code,
            ErrorType = type,
            TraceId = traceId
        };
    }

    public static ErrorResponse ValidationError(Dictionary<string, string[]> errors, string? traceId = null)
    {
        return new ErrorResponse
        {
            Success = false,
            Message = "One or more validation errors occurred.",
            ErrorCode = "ValidationError",
            ErrorType = ErrorType.Validation,
            Errors = errors,
            TraceId = traceId
        };
    }
}