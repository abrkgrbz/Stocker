using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Exceptions;
using Stocker.Application.Common.Exceptions;

namespace Stocker.API.Extensions;

/// <summary>
/// Extension methods for database migration and seeding
/// </summary>
public static class DatabaseExtensions
{
    /// <summary>
    /// Applies database migrations and seeds master data on startup (skipped in Testing environment)
    /// </summary>
    public static async Task<WebApplication> MigrateDatabaseAsync(this WebApplication app)
    {
        if (app.Environment.EnvironmentName.Equals("Testing", StringComparison.OrdinalIgnoreCase))
        {
            app.Logger.LogInformation("Database migration skipped in Testing environment");
            return app;
        }

        using var scope = app.Services.CreateScope();
        try
        {
            var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();

            // Create Hangfire database first
            await migrationService.CreateHangfireDatabaseAsync();

            // Then migrate master database
            await migrationService.MigrateMasterDatabaseAsync();
            await migrationService.SeedMasterDataAsync();

            app.Logger.LogInformation("Database migration completed successfully");
            app.Logger.LogInformation("Stocker API started successfully");

            if (app.Environment.IsDevelopment())
            {
                app.Logger.LogDebug("Running in Development mode");
            }
        }
        catch (DatabaseException ex)
        {
            app.Logger.LogError(ex, "Database error occurred while migrating: {Code}", ex.Code);
            if (app.Environment.IsDevelopment())
            {
                throw;
            }
        }
        catch (InfrastructureException ex)
        {
            app.Logger.LogError(ex, "Infrastructure error occurred while migrating: {Code}", ex.Code);
            if (app.Environment.IsDevelopment())
            {
                throw;
            }
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "An unexpected error occurred while migrating the database");
            if (app.Environment.IsDevelopment())
            {
                throw;
            }
        }

        return app;
    }
}
