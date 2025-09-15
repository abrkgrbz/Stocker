using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace Stocker.API.Filters;

/// <summary>
/// Global model validation filter that automatically validates model state
/// </summary>
public class ModelValidationFilter : IActionFilter
{
    private readonly ILogger<ModelValidationFilter> _logger;

    public ModelValidationFilter(ILogger<ModelValidationFilter> logger)
    {
        _logger = logger;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (!context.ModelState.IsValid)
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value!.Errors.Select(e => e.ErrorMessage).ToArray()
                );

            _logger.LogWarning("Model validation failed for {Controller}.{Action}: {@Errors}",
                context.Controller.GetType().Name,
                context.ActionDescriptor.DisplayName,
                errors);

            var response = new
            {
                success = false,
                message = "Validation failed",
                errors = errors,
                timestamp = DateTime.UtcNow
            };

            context.Result = new BadRequestObjectResult(response);
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No implementation needed
    }
}