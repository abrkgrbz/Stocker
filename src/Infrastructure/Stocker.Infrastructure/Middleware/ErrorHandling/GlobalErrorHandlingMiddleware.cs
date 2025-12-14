using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Models;
using Stocker.Application.Common.Exceptions;
using System.Diagnostics;
using System.Net;
using System.Text.Json;
using FluentValidation;

namespace Stocker.Infrastructure.Middleware.ErrorHandling;

public class GlobalErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalErrorHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;
    private readonly ErrorHandlingOptions _options;

    public GlobalErrorHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalErrorHandlingMiddleware> logger,
        IHostEnvironment environment,
        ErrorHandlingOptions? options = null)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
        _options = options ?? new ErrorHandlingOptions();
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;

        // Log the exception
        _logger.LogError(exception, "An unhandled exception occurred. TraceId: {TraceId}", traceId);

        // Check if response has already started
        if (context.Response.HasStarted)
        {
            _logger.LogWarning("Response has already started. Cannot set status code or write error response. TraceId: {TraceId}", traceId);
            return;
        }

        var (statusCode, errorResponse) = CreateErrorResponse(exception, traceId);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse, jsonOptions));
    }

    private (int statusCode, ApiErrorResponse response) CreateErrorResponse(Exception exception, string traceId)
    {
        var response = new ApiErrorResponse
        {
            TraceId = traceId,
            Instance = Activity.Current?.Id,
            Timestamp = DateTime.UtcNow
        };

        switch (exception)
        {
            case ValidationException validationException:
                response.Status = (int)HttpStatusCode.BadRequest;
                response.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
                response.Title = "Validation Error";
                response.Detail = "One or more validation errors occurred.";
                response.Errors = validationException.Errors.Select(e => new ApiError
                {
                    Code = e.ErrorCode,
                    Message = e.ErrorMessage,
                    Field = e.PropertyName
                }).ToList();
                break;

            case UnauthorizedAccessException:
                response.Status = (int)HttpStatusCode.Unauthorized;
                response.Type = "https://tools.ietf.org/html/rfc7235#section-3.1";
                response.Title = "Unauthorized";
                response.Detail = "Authentication is required to access this resource.";
                response.Errors.Add(new ApiError
                {
                    Code = "UNAUTHORIZED",
                    Message = exception.Message
                });
                break;

            case KeyNotFoundException or FileNotFoundException:
                response.Status = (int)HttpStatusCode.NotFound;
                response.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4";
                response.Title = "Resource Not Found";
                response.Detail = exception.Message;
                response.Errors.Add(new ApiError
                {
                    Code = "NOT_FOUND",
                    Message = exception.Message
                });
                break;

            case TimeoutException:
                response.Status = (int)HttpStatusCode.RequestTimeout;
                response.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.7";
                response.Title = "Request Timeout";
                response.Detail = "The request took too long to process.";
                response.Errors.Add(new ApiError
                {
                    Code = "TIMEOUT",
                    Message = exception.Message
                });
                break;

            case InvalidOperationException:
                response.Status = (int)HttpStatusCode.BadRequest;
                response.Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1";
                response.Title = "Invalid Operation";
                response.Detail = exception.Message;
                response.Errors.Add(new ApiError
                {
                    Code = "INVALID_OPERATION",
                    Message = exception.Message
                });
                break;

            // Handle Application layer BusinessException (includes BusinessRuleException)
            case Stocker.Application.Common.Exceptions.BusinessException appBusinessException:
                response.Status = (int)HttpStatusCode.BadRequest;
                response.Type = $"https://stoocker.app/errors/{appBusinessException.Code}";
                response.Title = "Business Rule Violation";
                response.Detail = appBusinessException.Message;
                response.Errors.Add(new ApiError
                {
                    Code = appBusinessException.Code,
                    Message = appBusinessException.Message
                });
                break;

            case BusinessException businessException:
                response.Status = (int)businessException.StatusCode;
                response.Type = $"https://stoocker.app/errors/{businessException.ErrorCode}";
                response.Title = businessException.Title;
                response.Detail = businessException.Message;
                response.HelpUrl = businessException.HelpUrl;
                response.Errors.Add(new ApiError
                {
                    Code = businessException.ErrorCode,
                    Message = businessException.Message,
                    Details = businessException.Details
                });
                break;

            default:
                response.Status = (int)HttpStatusCode.InternalServerError;
                response.Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1";
                response.Title = "Internal Server Error";
                
                if (_environment.IsDevelopment())
                {
                    response.Detail = exception.Message;
                    response.Extensions = new Dictionary<string, object>
                    {
                        ["stackTrace"] = exception.StackTrace ?? string.Empty,
                        ["innerException"] = exception.InnerException?.Message ?? string.Empty
                    };
                }
                else
                {
                    response.Detail = "An error occurred while processing your request.";
                }
                
                response.Errors.Add(new ApiError
                {
                    Code = "INTERNAL_SERVER_ERROR",
                    Message = _environment.IsDevelopment() ? exception.Message : "An unexpected error occurred."
                });
                break;
        }

        // Add help URL if configured
        if (!string.IsNullOrEmpty(response.HelpUrl))
        {
            response.HelpUrl = $"{_options.HelpUrlBase}/{response.Errors.FirstOrDefault()?.Code ?? "UNKNOWN"}";
        }

        return (response.Status, response);
    }
}

public class BusinessException : Exception
{
    public string ErrorCode { get; }
    public string Title { get; }
    public HttpStatusCode StatusCode { get; }
    public string? HelpUrl { get; }
    public Dictionary<string, object>? Details { get; }

    public BusinessException(
        string errorCode,
        string message,
        string title = "Business Rule Violation",
        HttpStatusCode statusCode = HttpStatusCode.BadRequest,
        Dictionary<string, object>? details = null) 
        : base(message)
    {
        ErrorCode = errorCode;
        Title = title;
        StatusCode = statusCode;
        Details = details;
    }
}

public class ErrorHandlingOptions
{
    public string HelpUrlBase { get; set; } = "https://api.stoocker.app/help/errors";
    public bool IncludeStackTrace { get; set; } = false;
    public bool IncludeInnerException { get; set; } = false;
    public Dictionary<string, string> CustomErrorMessages { get; set; } = new();
}

public static class ErrorHandlingExtensions
{
    public static IApplicationBuilder UseGlobalErrorHandling(
        this IApplicationBuilder app,
        ErrorHandlingOptions? options = null)
    {
        return app.UseMiddleware<GlobalErrorHandlingMiddleware>(options ?? new ErrorHandlingOptions());
    }
}