using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using Xunit;
using Moq;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Interfaces;
using Stocker.Application.Common.Interfaces;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using Microsoft.AspNetCore.Authentication;

namespace Stocker.TestUtilities;

public abstract class IntegrationTestBase : IDisposable
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    protected readonly IServiceScope Scope;
    protected readonly IServiceProvider Services;

    protected IntegrationTestBase(WebApplicationFactory<Program> factory)
    {
        Factory = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.UseStartup<TestStartup>();
            
            // Override configuration for Testing environment
            builder.ConfigureAppConfiguration((context, config) =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["ConnectionStrings:MasterConnection"] = "DataSource=:memory:",
                    ["ConnectionStrings:HangfireConnection"] = "DataSource=:memory:",
                    ["Hangfire:Enabled"] = "false",
                    ["TenantRateLimiting:Enabled"] = "false",
                    ["SecurityHeaders:Enabled"] = "false"
                });
            });
            
            // TestStartup already configures everything we need
        });

        Client = Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        Scope = Factory.Services.CreateScope();
        Services = Scope.ServiceProvider;
    }

    protected void AuthenticateAsAdmin()
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJwtToken("admin@test.com", "Admin"));
    }

    protected void AuthenticateAsUser(string email = "user@test.com")
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJwtToken(email, "User"));
    }

    protected void AuthenticateAsSystemAdmin()
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", GenerateTestJwtToken("sysadmin@system.com", "SystemAdmin"));
    }

    private string GenerateTestJwtToken(string email, string role)
    {
        // For testing purposes, return a mock token
        // In real scenario, you'd generate a valid JWT token
        return $"test-token-{email}-{role}";
    }

    protected async Task<T> GetService<T>() where T : notnull
    {
        return Services.GetRequiredService<T>();
    }

    protected MasterDbContext GetMasterDbContext()
    {
        return Services.GetRequiredService<MasterDbContext>();
    }

    protected TenantDbContext GetTenantDbContext(Guid tenantId)
    {
        var factory = Services.GetRequiredService<ITenantDbContextFactory>();
        return (TenantDbContext)factory.CreateDbContext(tenantId);
    }

    public virtual void Dispose()
    {
        Scope?.Dispose();
        Client?.Dispose();
    }
}