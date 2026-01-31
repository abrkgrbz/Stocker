using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using Stocker.API.Filters;

namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for configuring API controllers
/// </summary>
public static class ControllersExtensions
{
    /// <summary>
    /// Adds controllers with filters, JSON options, and module assemblies
    /// </summary>
    public static IServiceCollection AddApiControllers(this IServiceCollection services)
    {
        services.AddControllers(options =>
        {
            // Add custom filters
            options.Filters.Add<ModelValidationFilter>();
            options.Filters.Add<FluentValidationFilter>();
            options.Filters.Add<InputSanitizationFilter>();
            options.Filters.Add<RequestSizeLimitFilter>();
            options.Filters.Add<AuditActionFilter>();

            // Set collection size limit
            options.MaxModelBindingCollectionSize = 1000;
        })
        .AddApplicationPart(typeof(Stocker.Modules.CRM.CRMModule).Assembly)
        .AddApplicationPart(typeof(Stocker.Modules.Inventory.InventoryModule).Assembly)
        .AddApplicationPart(typeof(Stocker.Modules.Sales.SalesModule).Assembly)
        .AddApplicationPart(typeof(Stocker.Modules.Purchase.PurchaseModule).Assembly)
        .AddApplicationPart(typeof(Stocker.Modules.Finance.FinanceModule).Assembly)
        .AddApplicationPart(typeof(Stocker.Modules.HR.HRModule).Assembly)
        .AddJsonOptions(options =>
        {
            // Add enum converter
            options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());

            // Case insensitive property matching
            options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;

            // Use relaxed JSON escaping for Turkish characters
            options.JsonSerializerOptions.Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping;

            // Default null handling
            options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;

            // Property naming policy - use camelCase for frontend compatibility
            options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;

            // Handle reference loops
            options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;

            // Maximum depth for circular references
            options.JsonSerializerOptions.MaxDepth = 32;
        });

        return services;
    }
}
