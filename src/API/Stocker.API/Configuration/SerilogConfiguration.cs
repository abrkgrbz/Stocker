using Serilog;
using Serilog.Events;
using Serilog.Formatting.Json;
using Serilog.Sinks.SystemConsole.Themes;

namespace Stocker.API.Configuration;

public static class SerilogConfiguration
{
    public static void ConfigureLogging(IConfiguration configuration, IHostBuilder hostBuilder)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        var seqUrl = configuration["Logging:Seq:ServerUrl"] ?? "http://localhost:5341";
        
        // Production'da direkt IP kullan
        if (environment == "Production")
        {
            seqUrl = "http://95.217.219.4:5341";
        }
        
        var seqApiKey = configuration["Logging:Seq:ApiKey"];
        
        Console.WriteLine($"[SERILOG] Environment: {environment}");
        Console.WriteLine($"[SERILOG] Seq URL: {seqUrl}");
        
        var loggerConfig = new LoggerConfiguration()
            .MinimumLevel.Debug()
            .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
            .MinimumLevel.Override("Microsoft.EntityFrameworkCore", LogEventLevel.Information)
            .Enrich.FromLogContext()
            .Enrich.WithEnvironmentUserName()
            .Enrich.WithMachineName()
            .Enrich.WithProperty("Application", "Stocker.API")
            // Console output
            .WriteTo.Console(
                outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}",
                theme: AnsiConsoleTheme.Literate)
            // File output - Structured JSON logs
            .WriteTo.File(
                new JsonFormatter(),
                "logs/stocker-.json",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,
                fileSizeLimitBytes: 10_485_760, // 10MB
                rollOnFileSizeLimit: true)
            // File output - Human readable
            .WriteTo.File(
                "logs/stocker-.log",
                rollingInterval: RollingInterval.Day,
                retainedFileCountLimit: 30,
                outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
            // Seq - Merkezi log server
            .WriteTo.Seq(seqUrl, apiKey: seqApiKey);
        
        // Database sink only in non-production environments
        if (environment != "Production")
        {
            loggerConfig = loggerConfig.WriteTo.MSSqlServer(
                connectionString: configuration.GetConnectionString("MasterConnection"),
                tableName: "Logs",
                autoCreateSqlTable: true,
                restrictedToMinimumLevel: LogEventLevel.Warning);
        }
        
        Log.Logger = loggerConfig.CreateLogger();

        hostBuilder.UseSerilog();
    }
    
    public static void ConfigureRequestLogging(WebApplication app)
    {
        app.UseSerilogRequestLogging(options =>
        {
            options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
            options.GetLevel = (httpContext, elapsed, ex) => LogEventLevel.Information;
            options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
            {
                diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
                diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
                diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
                
                var user = httpContext.User;
                if (user?.Identity?.IsAuthenticated ?? false)
                {
                    diagnosticContext.Set("UserName", user.Identity.Name);
                    diagnosticContext.Set("UserId", user.FindFirst("UserId")?.Value);
                }
            };
        });
    }
}