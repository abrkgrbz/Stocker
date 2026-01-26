using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Infrastructure.Alerts.Interfaces;
using Stocker.Infrastructure.Alerts.Persistence;
using Stocker.Infrastructure.Alerts.Services;

namespace Stocker.Infrastructure.Alerts.Extensions;

/// <summary>
/// Extension methods for registering alert services.
/// </summary>
public static class AlertServiceCollectionExtensions
{
    /// <summary>
    /// Adds central alert services to the service collection.
    /// </summary>
    public static IServiceCollection AddAlertServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection connection string not found");

        services.AddDbContext<AlertDbContext>(options =>
        {
            options.UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.MigrationsHistoryTable("__EFMigrationsHistory", "alerts");
                npgsqlOptions.EnableRetryOnFailure(3);
            });
        });

        // Register services
        services.AddScoped<IAlertService, AlertService>();
        services.AddScoped<IAlertBuilderFactory, AlertBuilderFactory>();

        return services;
    }
}
