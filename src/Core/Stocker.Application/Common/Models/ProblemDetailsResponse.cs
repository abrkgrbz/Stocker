using Stocker.SharedKernel.Results;
using System.Text.Json.Serialization;

namespace Stocker.Application.Common.Models;

/// <summary>
/// RFC 7807 compliant problem details response
/// </summary>
public class ProblemDetailsResponse
{
    [JsonPropertyName("type")]
    public string Type { get; set; } = "https://tools.ietf.org/html/rfc7231#section-6.5.1";

    [JsonPropertyName("title")]
    public string Title { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public int Status { get; set; }

    [JsonPropertyName("detail")]
    public string Detail { get; set; } = string.Empty;

    [JsonPropertyName("instance")]
    public string? Instance { get; set; }

    [JsonPropertyName("traceId")]
    public string? TraceId { get; set; }

    [JsonPropertyName("errors")]
    public Dictionary<string, string[]>? Errors { get; set; }

    [JsonExtensionData]
    public Dictionary<string, object>? Extensions { get; set; }

    public static ProblemDetailsResponse Create(Error error, string? instance = null, string? traceId = null)
    {
        var (status, type) = GetStatusAndType(error.Type);

        return new ProblemDetailsResponse
        {
            Type = type,
            Title = GetTitle(error.Type),
            Status = status,
            Detail = error.Description,
            Instance = instance,
            TraceId = traceId,
            Extensions = new Dictionary<string, object>
            {
                ["errorCode"] = error.Code
            }
        };
    }

    public static ProblemDetailsResponse ValidationError(Dictionary<string, string[]> errors, string? instance = null, string? traceId = null)
    {
        return new ProblemDetailsResponse
        {
            Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
            Title = "One or more validation errors occurred.",
            Status = 400,
            Detail = "The request contains invalid data. Please check the errors and try again.",
            Instance = instance,
            TraceId = traceId,
            Errors = errors
        };
    }

    private static (int status, string type) GetStatusAndType(ErrorType errorType)
    {
        return errorType switch
        {
            ErrorType.Validation => (400, "https://tools.ietf.org/html/rfc7231#section-6.5.1"),
            ErrorType.Unauthorized => (401, "https://tools.ietf.org/html/rfc7235#section-3.1"),
            ErrorType.Forbidden => (403, "https://tools.ietf.org/html/rfc7231#section-6.5.3"),
            ErrorType.NotFound => (404, "https://tools.ietf.org/html/rfc7231#section-6.5.4"),
            ErrorType.Conflict => (409, "https://tools.ietf.org/html/rfc7231#section-6.5.8"),
            ErrorType.Business => (422, "https://tools.ietf.org/html/rfc4918#section-11.2"),
            ErrorType.Infrastructure => (503, "https://tools.ietf.org/html/rfc7231#section-6.6.4"),
            _ => (500, "https://tools.ietf.org/html/rfc7231#section-6.6.1")
        };
    }

    private static string GetTitle(ErrorType errorType)
    {
        return errorType switch
        {
            ErrorType.Validation => "Bad Request",
            ErrorType.Unauthorized => "Unauthorized",
            ErrorType.Forbidden => "Forbidden",
            ErrorType.NotFound => "Not Found",
            ErrorType.Conflict => "Conflict",
            ErrorType.Business => "Unprocessable Entity",
            ErrorType.Infrastructure => "Service Unavailable",
            _ => "Internal Server Error"
        };
    }
}