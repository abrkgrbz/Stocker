using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Linq;

namespace Stocker.API.Filters;

/// <summary>
/// Action filter that performs FluentValidation on action arguments
/// </summary>
public class FluentValidationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<FluentValidationFilter> _logger;

    public FluentValidationFilter(
        IServiceProvider serviceProvider,
        ILogger<FluentValidationFilter> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var hasValidationErrors = false;
        var allErrors = new Dictionary<string, List<string>>();

        foreach (var argument in context.ActionArguments)
        {
            if (argument.Value == null)
                continue;

            var argumentType = argument.Value.GetType();
            var validatorType = typeof(IValidator<>).MakeGenericType(argumentType);
            
            // Try to get validator from DI container
            var validator = _serviceProvider.GetService(validatorType) as IValidator;
            
            if (validator != null)
            {
                var validationContext = new ValidationContext<object>(argument.Value);
                var validationResult = await validator.ValidateAsync(validationContext);
                
                if (!validationResult.IsValid)
                {
                    hasValidationErrors = true;
                    
                    foreach (var error in validationResult.Errors)
                    {
                        var key = $"{argument.Key}.{error.PropertyName}";
                        
                        if (!allErrors.ContainsKey(key))
                            allErrors[key] = new List<string>();
                        
                        allErrors[key].Add(error.ErrorMessage);
                        
                        // Also add to ModelState for consistency
                        context.ModelState.AddModelError(key, error.ErrorMessage);
                    }
                }
            }
        }

        if (hasValidationErrors)
        {
            _logger.LogWarning("FluentValidation failed for {Controller}.{Action}: {@Errors}",
                context.Controller.GetType().Name,
                context.ActionDescriptor.DisplayName,
                allErrors);

            var response = new
            {
                success = false,
                message = "Validation failed",
                errors = allErrors.ToDictionary(
                    kvp => kvp.Key,
                    kvp => kvp.Value.ToArray()
                ),
                timestamp = DateTime.UtcNow
            };

            context.Result = new BadRequestObjectResult(response);
            return;
        }

        await next();
    }
}