using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Text.Json;
using FluentValidation;
using Stocker.Application.Common.Exceptions;

namespace Stocker.API.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
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
        _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);

        var response = CreateErrorResponse(exception);
        
        context.Response.StatusCode = response.StatusCode;
        context.Response.ContentType = "application/json";

        var jsonResponse = JsonSerializer.Serialize(response.ProblemDetails, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }

    private (int StatusCode, ProblemDetails ProblemDetails) CreateErrorResponse(Exception exception)
    {
        var problemDetails = new ProblemDetails
        {
            Instance = Guid.NewGuid().ToString(),
            Extensions = { ["timestamp"] = DateTime.UtcNow }
        };

        switch (exception)
        {
            case FluentValidation.ValidationException validationException:
                problemDetails.Title = "Validation failed";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1";
                problemDetails.Detail = "One or more validation errors occurred.";
                
                var errors = validationException.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );
                
                problemDetails.Extensions["errors"] = errors;
                return (StatusCodes.Status400BadRequest, problemDetails);

            case NotFoundException notFoundException:
                problemDetails.Title = "Resource not found";
                problemDetails.Status = StatusCodes.Status404NotFound;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.4";
                problemDetails.Detail = notFoundException.Message;
                return (StatusCodes.Status404NotFound, problemDetails);

            case UnauthorizedException unauthorizedException:
                problemDetails.Title = "Unauthorized";
                problemDetails.Status = StatusCodes.Status401Unauthorized;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1";
                problemDetails.Detail = unauthorizedException.Message;
                return (StatusCodes.Status401Unauthorized, problemDetails);

            case ForbiddenException forbiddenException:
                problemDetails.Title = "Forbidden";
                problemDetails.Status = StatusCodes.Status403Forbidden;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.3";
                problemDetails.Detail = forbiddenException.Message;
                return (StatusCodes.Status403Forbidden, problemDetails);

            case ConflictException conflictException:
                problemDetails.Title = "Conflict";
                problemDetails.Status = StatusCodes.Status409Conflict;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.8";
                problemDetails.Detail = conflictException.Message;
                return (StatusCodes.Status409Conflict, problemDetails);

            case BusinessRuleException businessException:
                problemDetails.Title = "Business rule violation";
                problemDetails.Status = StatusCodes.Status422UnprocessableEntity;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc4918#section-11.2";
                problemDetails.Detail = businessException.Message;
                if (!string.IsNullOrEmpty(businessException.Code))
                {
                    problemDetails.Extensions["code"] = businessException.Code;
                }
                return (StatusCodes.Status422UnprocessableEntity, problemDetails);

            case InvalidOperationException invalidOperationException:
                problemDetails.Title = "Invalid operation";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1";
                problemDetails.Detail = invalidOperationException.Message;
                return (StatusCodes.Status400BadRequest, problemDetails);

            case ArgumentException argumentException:
                problemDetails.Title = "Invalid argument";
                problemDetails.Status = StatusCodes.Status400BadRequest;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1";
                problemDetails.Detail = argumentException.Message;
                if (!string.IsNullOrEmpty(argumentException.ParamName))
                {
                    problemDetails.Extensions["parameter"] = argumentException.ParamName;
                }
                return (StatusCodes.Status400BadRequest, problemDetails);

            case TimeoutException timeoutException:
                problemDetails.Title = "Request timeout";
                problemDetails.Status = StatusCodes.Status408RequestTimeout;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.7";
                problemDetails.Detail = "The request took too long to process.";
                return (StatusCodes.Status408RequestTimeout, problemDetails);

            case NotImplementedException:
                problemDetails.Title = "Not implemented";
                problemDetails.Status = StatusCodes.Status501NotImplemented;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.2";
                problemDetails.Detail = "This functionality is not yet implemented.";
                return (StatusCodes.Status501NotImplemented, problemDetails);

            default:
                problemDetails.Title = "An error occurred";
                problemDetails.Status = StatusCodes.Status500InternalServerError;
                problemDetails.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1";
                
                if (_environment.IsDevelopment())
                {
                    problemDetails.Detail = exception.Message;
                    problemDetails.Extensions["stackTrace"] = exception.StackTrace;
                    problemDetails.Extensions["exceptionType"] = exception.GetType().Name;
                }
                else
                {
                    problemDetails.Detail = "An unexpected error occurred. Please try again later.";
                    problemDetails.Extensions["traceId"] = Guid.NewGuid().ToString();
                }
                
                return (StatusCodes.Status500InternalServerError, problemDetails);
        }
    }
}