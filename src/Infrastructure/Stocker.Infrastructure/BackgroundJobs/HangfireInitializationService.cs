using Hangfire;
using Hangfire.PostgreSql;
using Npgsql;
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

            using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(cancellationToken);

            // Check if hangfire schema exists
            var schemaExists = await CheckSchemaExists(connection, "hangfire");

            if (!schemaExists)
            {
                _logger.LogInformation("Creating hangfire schema and tables...");

                // Create schema
                using var schemaCommand = connection.CreateCommand();
                schemaCommand.CommandText = "CREATE SCHEMA IF NOT EXISTS hangfire";
                await schemaCommand.ExecuteNonQueryAsync(cancellationToken);

                // Install Hangfire schema
                var options = new PostgreSqlStorageOptions
                {
                    SchemaName = "hangfire",
                    PrepareSchemaIfNecessary = true
                };

                // Install Hangfire tables by creating storage and forcing initialization
                var storage = new PostgreSqlStorage(connectionString, options);

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

    private async Task<bool> CheckSchemaExists(NpgsqlConnection connection, string schemaName)
    {
        using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = @schemaName";
        command.Parameters.Add(new NpgsqlParameter("@schemaName", schemaName));

        var count = Convert.ToInt32(await command.ExecuteScalarAsync());
        return count > 0;
    }
}