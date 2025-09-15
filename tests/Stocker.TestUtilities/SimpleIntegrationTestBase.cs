using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System.Net.Http.Headers;
using Xunit;
using Stocker.Persistence.Contexts;

namespace Stocker.TestUtilities;

public abstract class SimpleIntegrationTestBase : IDisposable
{
    protected readonly WebApplicationFactory<Program> Factory;
    protected readonly HttpClient Client;
    
    protected SimpleIntegrationTestBase()
    {
        Factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.UseStartup<TestStartup>();
            });
            
        Client = Factory.CreateClient();
    }
    
    protected void AuthenticateAsAdmin()
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", "test-token-admin@test.com-Admin");
    }
    
    protected void AuthenticateAsUser(string email = "user@test.com")
    {
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", $"test-token-{email}-User");
    }
    
    protected TenantDbContext CreateTenantDbContext(Guid tenantId)
    {
        var options = new DbContextOptionsBuilder<TenantDbContext>()
            .UseInMemoryDatabase($"TestTenantDb_{tenantId}")
            .Options;
        
        return new TenantDbContext(options, tenantId);
    }
    
    protected MasterDbContext CreateMasterDbContext()
    {
        var options = new DbContextOptionsBuilder<MasterDbContext>()
            .UseInMemoryDatabase($"TestMasterDb_{Guid.NewGuid()}")
            .Options;
        
        return new MasterDbContext(options);
    }
    
    public virtual void Dispose()
    {
        Client?.Dispose();
        Factory?.Dispose();
    }
}