using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; 
using StackExchange.Redis;
using Stocker.Persistence.Contexts;

namespace Stocker.API.Controllers;

[ApiController]
[Route("[controller]")]
[AllowAnonymous]
public class HealthController : ControllerBase
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<HealthController> _logger;

    public HealthController(
        IServiceProvider serviceProvider, 
        IConfiguration configuration,
        ILogger<HealthController> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var health = new
        {
            Status = "Healthy",
            Timestamp = DateTime.UtcNow,
            Environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
            Version = GetType().Assembly.GetName().Version?.ToString() ?? "Unknown"
        };

        return Ok(health);
    }

    [HttpGet("detailed")]
    [Authorize(Policy = "SystemAdminPolicy")]
    public async Task<IActionResult> GetDetailed()
    {
        var healthChecks = new Dictionary<string, object>();

        // Check Database
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var masterContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
            await masterContext.Database.ExecuteSqlRawAsync("SELECT 1");
            healthChecks["Database"] = new { Status = "Healthy", ResponseTime = "< 1s" };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            healthChecks["Database"] = new { Status = "Unhealthy", Error = ex.Message };
        }

        // Check Redis
        try
        {
            var redisConnection = _configuration.GetConnectionString("Redis");
            if (!string.IsNullOrEmpty(redisConnection))
            {
                var redis = await ConnectionMultiplexer.ConnectAsync(redisConnection);
                var db = redis.GetDatabase();
                await db.PingAsync();
                healthChecks["Redis"] = new { Status = "Healthy", ResponseTime = "< 1s" };
                redis.Close();
            }
            else
            {
                healthChecks["Redis"] = new { Status = "Not Configured" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Redis health check failed");
            healthChecks["Redis"] = new { Status = "Unhealthy", Error = ex.Message };
        }

        // Check Email Service
        try
        {
            var emailEnabled = _configuration.GetValue<bool>("EmailSettings:EnableEmail");
            if (emailEnabled)
            {
                var smtpHost = _configuration["EmailSettings:SmtpHost"];
                healthChecks["Email"] = new 
                { 
                    Status = "Configured", 
                    SmtpHost = smtpHost,
                    Enabled = emailEnabled
                };
            }
            else
            {
                healthChecks["Email"] = new { Status = "Disabled" };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Email health check failed");
            healthChecks["Email"] = new { Status = "Error", Error = ex.Message };
        }

        // System Info
        var systemInfo = new
        {
            MachineName = Environment.MachineName,
            OSVersion = Environment.OSVersion.ToString(),
            ProcessorCount = Environment.ProcessorCount,
            WorkingSet = Environment.WorkingSet / (1024 * 1024) + " MB",
            DotNetVersion = Environment.Version.ToString()
        };

        var response = new
        {
            Status = healthChecks.All(h => h.Value is IDictionary<string, object> dict && 
                                           dict.ContainsKey("Status") && 
                                           dict["Status"].ToString() != "Unhealthy") ? "Healthy" : "Degraded",
            Timestamp = DateTime.UtcNow,
            Checks = healthChecks,
            SystemInfo = systemInfo
        };

        return Ok(response);
    }

    [HttpGet("ready")]
    public async Task<IActionResult> Ready()
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var masterContext = scope.ServiceProvider.GetRequiredService<MasterDbContext>();
            await masterContext.Database.ExecuteSqlRawAsync("SELECT 1");
            return Ok(new { Ready = true });
        }
        catch
        {
            return StatusCode(503, new { Ready = false });
        }
    }

    [HttpGet("live")]
    public IActionResult Live()
    {
        return Ok(new { Alive = true });
    }
}