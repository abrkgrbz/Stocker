using Microsoft.AspNetCore.Localization;

namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for configuring localization
/// </summary>
public static class LocalizationExtensions
{
    /// <summary>
    /// Adds request localization with supported cultures (Turkish and English)
    /// </summary>
    public static IServiceCollection AddRequestLocalizationOptions(this IServiceCollection services)
    {
        services.Configure<RequestLocalizationOptions>(options =>
        {
            var supportedCultures = new[] { "tr-TR", "en-US" };
            options.SetDefaultCulture("tr-TR");
            options.AddSupportedCultures(supportedCultures);
            options.AddSupportedUICultures(supportedCultures);
            options.ApplyCurrentCultureToResponseHeaders = true;
        });

        return services;
    }
}
