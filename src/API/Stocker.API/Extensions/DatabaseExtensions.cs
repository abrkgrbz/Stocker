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
            app.Logger.LogInformation("=== Starting Database Migration ===");
            var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();

            // Create Hangfire database first
            app.Logger.LogInformation("Step 1/3: Creating Hangfire database...");
            await migrationService.CreateHangfireDatabaseAsync();
            app.Logger.LogInformation("Step 1/3: Hangfire database ready");

            // Then migrate master database
            app.Logger.LogInformation("Step 2/3: Migrating Master database...");
            await migrationService.MigrateMasterDatabaseAsync();
            app.Logger.LogInformation("Step 2/3: Master database migrated");

            app.Logger.LogInformation("Step 3/3: Seeding Master data...");
            await migrationService.SeedMasterDataAsync();
            app.Logger.LogInformation("Step 3/3: Master data seeded");

            app.Logger.LogInformation("=== Database migration completed successfully ===");
            app.Logger.LogInformation("Stocker API started successfully");

            if (app.Environment.IsDevelopment())
            {
                app.Logger.LogDebug("Running in Development mode");
            }
        }
        catch (DatabaseException ex)
        {
            app.Logger.LogError(ex, "❌ Database error occurred while migrating: {Code} - Message: {Message}", ex.Code, ex.Message);
            app.Logger.LogError("⚠️ Application will continue but database may not be initialized!");
            if (app.Environment.IsDevelopment())
            {
                throw;
            }
        }
        catch (InfrastructureException ex)
        {
            app.Logger.LogError(ex, "❌ Infrastructure error occurred while migrating: {Code} - Message: {Message}", ex.Code, ex.Message);
            app.Logger.LogError("⚠️ Application will continue but database may not be initialized!");
            if (app.Environment.IsDevelopment())
            {
                throw;
            }
        }
        catch (Exception ex)
        {
            app.Logger.LogError(ex, "❌ Unexpected error during database migration: {Message}", ex.Message);
            app.Logger.LogError("Stack Trace: {StackTrace}", ex.StackTrace);
            app.Logger.LogError("⚠️ Application will continue but database may not be initialized!");
            if (app.Environment.IsDevelopment())
            {
                throw;
            }
        }

        return app;
    }
}
