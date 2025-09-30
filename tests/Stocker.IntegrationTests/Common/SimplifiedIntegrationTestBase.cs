using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Persistence.Contexts;
using Stocker.SharedKernel.Settings;
using System.Net.Http.Headers;
using Xunit;

namespace Stocker.IntegrationTests.Common;

public class SimplifiedIntegrationTestBase : IAsyncLifetime
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly IServiceScope _scope;
    private readonly string _databaseName;

    protected HttpClient Client { get; }
    protected MasterDbContext MasterDbContext { get; }

    protected TenantDbContext TenantDbContext { get; }

    public SimplifiedIntegrationTestBase()
    {
        // Create a unique database name for this test run
        _databaseName = $"TestDb_{Guid.NewGuid():N}";
        var connectionString = $"Server=(localdb)\\TestDB;Database={_databaseName};Trusted_Connection=true;MultipleActiveResultSets=true;TrustServerCertificate=true";
        
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                
                builder.ConfigureServices(services =>
                {
                    // Remove ALL Entity Framework related services
                    var descriptorsToRemove = services.Where(d =>
                        d.ServiceType == typeof(DbContextOptions<MasterDbContext>) ||
                        d.ServiceType == typeof(DbContextOptions<TenantDbContext>) ||
                        d.ServiceType == typeof(DbContextOptions) ||
                        d.ServiceType.ToString().Contains("EntityFramework") ||
                        d.ServiceType.ToString().Contains("SqlServer") ||
                        d.ServiceType.ToString().Contains("DbContext"))
                        .ToList();

                    foreach (var descriptor in descriptorsToRemove)
                    {
                        services.Remove(descriptor);
                    }

                    // Add MasterDbContext with SQL Server LocalDB
                    services.AddDbContext<MasterDbContext>(options =>
                    {
                        options.UseSqlServer(connectionString);
                        options.EnableSensitiveDataLogging();
                        options.EnableDetailedErrors();
                    });

                    // Add TenantDbContext with the same connection string for testing
                    services.AddDbContext<TenantDbContext>(options =>
                    {
                        options.UseSqlServer(connectionString);
                        options.EnableSensitiveDataLogging();
                        options.EnableDetailedErrors();
                    });

                    // Register DbContext interfaces
                    services.AddScoped<Stocker.Application.Common.Interfaces.IMasterDbContext>(provider => 
                        provider.GetRequiredService<MasterDbContext>());
                    services.AddScoped<Stocker.Application.Common.Interfaces.ITenantDbContext>(provider => 
                        provider.GetRequiredService<TenantDbContext>());
                    services.AddScoped<Stocker.Application.Common.Interfaces.IApplicationDbContext>(provider => 
                        provider.GetRequiredService<MasterDbContext>());

                    // Add ITenantDbContextFactory for testing - just returns the same TenantDbContext
                    services.AddScoped<Stocker.Application.Common.Interfaces.ITenantDbContextFactory>(provider =>
                    {
                        var factory = new TestTenantDbContextFactory(provider);
                        return factory;
                    });

                    // Add ITenantService for testing - register both interfaces
                    services.AddScoped<Stocker.SharedKernel.Interfaces.ITenantService, TestTenantService>();
                });
            });

        Client = _factory.CreateClient();
        
        _scope = _factory.Services.CreateScope();
        MasterDbContext = _scope.ServiceProvider.GetRequiredService<MasterDbContext>();
        TenantDbContext = _scope.ServiceProvider.GetRequiredService<TenantDbContext>();
    }

    public async Task InitializeAsync()
    {
        // Ensure database is created and migrations are applied
        try
        {
            // Create the database and apply migrations
            await MasterDbContext.Database.EnsureCreatedAsync();
            await TenantDbContext.Database.EnsureCreatedAsync();
            
            Console.WriteLine($"Test database created: {_databaseName}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error creating test database: {ex.Message}");
            Console.WriteLine($"Stack trace: {ex.StackTrace}");
            throw; // Re-throw to fail the test
        }
    }

    public async Task DisposeAsync()
    {
        // Delete the test database
        try
        {
            await MasterDbContext.Database.EnsureDeletedAsync();
            await TenantDbContext.Database.EnsureDeletedAsync();
        }
        catch
        {
            // Ignore errors when deleting test database
        }
        
        await MasterDbContext.DisposeAsync();
        await TenantDbContext.DisposeAsync();
        _scope.Dispose();
        _factory.Dispose();
    }

    protected async Task<T> AddAsync<T>(T entity) where T : class
    {
        await MasterDbContext.Set<T>().AddAsync(entity);
        await MasterDbContext.SaveChangesAsync();
        
        // Detach the entity to avoid tracking issues
        MasterDbContext.Entry(entity).State = EntityState.Detached;
        
        return entity;
    }

    protected async Task<T?> FindAsync<T>(params object[] keyValues) where T : class
    {
        // Use the same singleton instance
        return await MasterDbContext.Set<T>().FindAsync(keyValues);
    }

    protected async Task ResetDatabaseAsync()
    {
        // Clear all data from tables
        var entityTypes = MasterDbContext.Model.GetEntityTypes();
        foreach (var entityType in entityTypes)
        {
            var tableName = entityType.GetTableName();
            if (tableName != null)
            {
                await MasterDbContext.Database.ExecuteSqlRawAsync($"DELETE FROM [{tableName}]");
            }
        }
    }
    
    protected void AuthenticateAsAdmin(string? tenantId = null)
    {
        var token = JwtTokenGenerator.GenerateToken(
            userId: Guid.NewGuid().ToString(),
            username: "admin",
            email: "admin@test.com",
            tenantId: tenantId ?? Guid.NewGuid().ToString(),
            role: "SistemYoneticisi");
        
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
    }
    
    protected void AuthenticateAsUser(string userId, string username, string email, string tenantId, string role = "User")
    {
        var token = JwtTokenGenerator.GenerateToken(userId, username, email, tenantId, role);
        Client.DefaultRequestHeaders.Authorization = 
            new AuthenticationHeaderValue("Bearer", token);
    }
}