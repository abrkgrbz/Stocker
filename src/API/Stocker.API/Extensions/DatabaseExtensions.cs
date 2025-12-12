using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Exceptions;
using Stocker.Application.Common.Exceptions;
using Stocker.Modules.CMS.Infrastructure.Persistence;

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
            app.Logger.LogInformation("Step 1/4: Creating Hangfire database...");
            await migrationService.CreateHangfireDatabaseAsync();
            app.Logger.LogInformation("Step 1/4: Hangfire database ready");

            // Then migrate master database
            app.Logger.LogInformation("Step 2/4: Migrating Master database...");
            await migrationService.MigrateMasterDatabaseAsync();
            app.Logger.LogInformation("Step 2/4: Master database migrated");

            app.Logger.LogInformation("Step 3/4: Seeding Master data...");
            await migrationService.SeedMasterDataAsync();
            app.Logger.LogInformation("Step 3/4: Master data seeded");

            // Migrate CMS database (uses Master connection with separate schema)
            app.Logger.LogInformation("Step 4/4: Migrating CMS database...");
            var cmsDbContext = scope.ServiceProvider.GetService<CMSDbContext>();
            if (cmsDbContext != null)
            {
                await cmsDbContext.Database.MigrateAsync();
                app.Logger.LogInformation("Step 4/4: CMS database migrated");
            }
            else
            {
                app.Logger.LogWarning("Step 4/4: CMS module not registered, skipping CMS migration");
            }

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
