using Hangfire;
using Hangfire.SqlServer;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Data;

namespace Stocker.Infrastructure.BackgroundJobs;

public class HangfireInitializationService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<HangfireInitializationService> _logger;

    public HangfireInitializationService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<HangfireInitializationService> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Initializing Hangfire database schema...");

            var connectionString = _configuration.GetConnectionString("HangfireConnection") 
                ?? _configuration.GetConnectionString("MasterConnection");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                _logger.LogError("HangfireConnection connection string is not configured");
                return;
            }

            using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync(cancellationToken);

            // Check if Hangfire schema exists
            var schemaExists = await CheckSchemaExists(connection, "Hangfire");
            
            if (!schemaExists)
            {
                _logger.LogInformation("Creating Hangfire schema and tables...");
                
                // Create schema
                using var schemaCommand = connection.CreateCommand();
                schemaCommand.CommandText = "IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'Hangfire') EXEC('CREATE SCHEMA [Hangfire]')";
                await schemaCommand.ExecuteNonQueryAsync(cancellationToken);

                // Install Hangfire schema
                var options = new SqlServerStorageOptions
                {
                    SchemaName = "Hangfire",
                    PrepareSchemaIfNecessary = true
                };

                // Install Hangfire tables by creating storage and forcing initialization
                var storage = new SqlServerStorage(connectionString, options);

                // Force schema and tables creation by getting monitoring API
                var monitoringApi = storage.GetMonitoringApi();
                _ = monitoringApi.Servers(); // This forces table creation

                _logger.LogInformation("Hangfire schema and tables created successfully");
            }
            else
            {
                _logger.LogInformation("Hangfire schema already exists");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing Hangfire database schema");
            // Don't throw - allow the application to start even if Hangfire initialization fails
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private async Task<bool> CheckSchemaExists(SqlConnection connection, string schemaName)
    {
        using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM sys.schemas WHERE name = @schemaName";
        command.Parameters.Add(new SqlParameter("@schemaName", schemaName));
        
        var count = (int)await command.ExecuteScalarAsync();
        return count > 0;
    }
}