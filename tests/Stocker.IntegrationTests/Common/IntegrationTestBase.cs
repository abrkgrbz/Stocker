using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Persistence.Contexts;
using Respawn;
using System.Data.Common;
using Microsoft.Data.Sqlite;
using Stocker.SharedKernel.Settings;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace Stocker.IntegrationTests.Common;

public class IntegrationTestBase : IAsyncLifetime
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly IServiceProvider _serviceProvider;
    private readonly IServiceScope _scope;
    private DbConnection _dbConnection = null!;
    private Respawner _respawner = null!;

    protected HttpClient Client { get; }
    protected MasterDbContext MasterDbContext { get; }
    protected TenantDbContext TenantDbContext { get; }

    public IntegrationTestBase()
    {
        _factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Remove existing DbContext configurations
                    var descriptors = services.Where(
                        d => d.ServiceType == typeof(DbContextOptions<MasterDbContext>) ||
                             d.ServiceType == typeof(DbContextOptions<TenantDbContext>))
                        .ToList();

                    foreach (var descriptor in descriptors)
                    {
                        services.Remove(descriptor);
                    }

                    // Use SQLite in-memory database
                    _dbConnection = new SqliteConnection("DataSource=:memory:");
                    _dbConnection.Open();

                    // Add MasterDbContext with SQLite
                    services.AddDbContext<MasterDbContext>(options =>
                    {
                        options.UseSqlite(_dbConnection);
                    });

                    // Override database settings
                    services.Configure<DatabaseSettings>(options =>
                    {
                        options.ServerName = "localhost";
                        options.MasterDatabaseName = "TestMasterDb";
                        options.UseWindowsAuthentication = false;
                        options.UserId = "test";
                        options.Password = "test";
                    });
                });

                builder.UseEnvironment("Testing");
            });

        Client = _factory.CreateClient();
        _scope = _factory.Services.CreateScope();
        _serviceProvider = _scope.ServiceProvider;
        
        MasterDbContext = _serviceProvider.GetRequiredService<MasterDbContext>();
        // TenantDbContext requires tenant context, so we'll create it when needed
        TenantDbContext = null!; // Will be initialized in InitializeAsync
    }

    public async Task InitializeAsync()
    {
        await MasterDbContext.Database.EnsureCreatedAsync();
        // TenantDbContext will be created on demand for each tenant
        
        // Initialize Respawner for database cleanup
        _respawner = await Respawner.CreateAsync(_dbConnection, new RespawnerOptions
        {
            SchemasToInclude = new[] { "public" }
        });
    }

    public async Task DisposeAsync()
    {
        await MasterDbContext.DisposeAsync();
        if (TenantDbContext != null)
        {
            await TenantDbContext.DisposeAsync();
        }
        _scope.Dispose();
        await _dbConnection.CloseAsync();
        await _dbConnection.DisposeAsync();
    }

    protected async Task ResetDatabaseAsync()
    {
        await _respawner.ResetAsync(_dbConnection);
    }

    protected async Task<T> AddAsync<T>(T entity) where T : class
    {
        if (typeof(T).Namespace?.Contains("Master") == true)
        {
            await MasterDbContext.Set<T>().AddAsync(entity);
            await MasterDbContext.SaveChangesAsync();
        }
        else
        {
            // For tenant entities, we'll add them to MasterDbContext for now
            // In a real scenario, you would need to create a tenant context
            await MasterDbContext.Set<T>().AddAsync(entity);
            await MasterDbContext.SaveChangesAsync();
        }
        
        return entity;
    }

    protected async Task<T?> FindAsync<T>(params object[] keyValues) where T : class
    {
        if (typeof(T).Namespace?.Contains("Master") == true)
        {
            return await MasterDbContext.Set<T>().FindAsync(keyValues);
        }
        else
        {
            // For tenant entities, try to find them in MasterDbContext for now
            return await MasterDbContext.Set<T>().FindAsync(keyValues);
        }
    }
}