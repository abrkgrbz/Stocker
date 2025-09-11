using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;
using Stocker.Application.Common.Models;
using Stocker.SharedKernel.Results;
using System.Net;
using System.Text.Json;

namespace Stocker.Infrastructure.Middleware;

/// <summary>
/// Global exception handling middleware
/// </summary>
public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;
    private readonly JsonSerializerOptions _jsonOptions;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
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
        var traceId = context.TraceIdentifier;
        var path = context.Request.Path;

        _logger.LogError(exception, 
            "An unhandled exception occurred. TraceId: {TraceId}, Path: {Path}", 
            traceId, path);

        context.Response.ContentType = "application/problem+json";

        var response = CreateProblemDetails(exception, path, traceId);
        context.Response.StatusCode = response.Status;

        var json = JsonSerializer.Serialize(response, _jsonOptions);
        await context.Response.WriteAsync(json);
    }

    private ProblemDetailsResponse CreateProblemDetails(Exception exception, string path, string traceId)
    {
        return exception switch
        {
            Stocker.Application.Common.Exceptions.ValidationException validationEx => ProblemDetailsResponse.ValidationError(
                validationEx.Errors,
                path,
                traceId),

            Stocker.Application.Common.Exceptions.NotFoundException notFoundEx => ProblemDetailsResponse.Create(
                Error.NotFound(notFoundEx.Code, notFoundEx.Message),
                path,
                traceId),

            UnauthorizedException unauthorizedEx => ProblemDetailsResponse.Create(
                Error.Unauthorized(unauthorizedEx.Code, unauthorizedEx.Message),
                path,
                traceId),

            ForbiddenAccessException forbiddenEx => ProblemDetailsResponse.Create(
                Error.Forbidden(forbiddenEx.Code, forbiddenEx.Message),
                path,
                traceId),

            BusinessException businessEx => ProblemDetailsResponse.Create(
                new Error(businessEx.Code, businessEx.Message, ErrorType.Business),
                path,
                traceId),

            InfrastructureException infraEx => ProblemDetailsResponse.Create(
                new Error(infraEx.Code, infraEx.Message, ErrorType.Infrastructure),
                path,
                traceId),

            Stocker.SharedKernel.Exceptions.DatabaseException dbEx => ProblemDetailsResponse.Create(
                new Error(dbEx.Code, dbEx.Message, ErrorType.Infrastructure),
                path,
                traceId),

            Stocker.SharedKernel.Exceptions.ConfigurationException configEx => ProblemDetailsResponse.Create(
                new Error(configEx.Code, configEx.Message, ErrorType.Business),
                path,
                traceId),

            Stocker.SharedKernel.Exceptions.ExternalServiceException externalEx => ProblemDetailsResponse.Create(
                new Error(externalEx.Code, $"[{externalEx.ServiceName}] {externalEx.Message}", ErrorType.Infrastructure),
                path,
                traceId),

            _ => CreateGenericErrorResponse(exception, path, traceId)
        };
    }

    private ProblemDetailsResponse CreateGenericErrorResponse(Exception exception, string path, string traceId)
    {
        var error = _environment.IsDevelopment()
            ? new Error("InternalServerError", exception.Message, ErrorType.Failure)
            : new Error("InternalServerError", "An error occurred while processing your request.", ErrorType.Failure);

        var response = ProblemDetailsResponse.Create(error, path, traceId);

        if (_environment.IsDevelopment() && response.Extensions != null)
        {
            response.Extensions["exception"] = exception.GetType().Name;
            response.Extensions["stackTrace"] = exception.StackTrace;
        }

        return response;
    }
}