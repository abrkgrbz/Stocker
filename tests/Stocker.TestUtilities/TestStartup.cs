using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Stocker.Application;
using Stocker.Persistence.Contexts;
using Stocker.Persistence.Factories;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Models;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Interfaces;
using Moq;

namespace Stocker.TestUtilities;

public class TestStartup
{
    public IConfiguration Configuration { get; }
    
    public TestStartup(IConfiguration configuration)
    {
        Configuration = configuration;
    }
    
    public void ConfigureServices(IServiceCollection services)
    {
        // Add Controllers from the API assembly (without filters)
        services.AddControllers(options =>
        {
            // Remove InputSanitizationFilter in test environment
            options.Filters.Clear();
        })
            .AddApplicationPart(typeof(Stocker.API.Controllers.CustomersController).Assembly);
        
        // Add Application layer
        services.AddApplication(Configuration);
        
        // Configure test databases - use shared database for all services in same test
        services.AddDbContext<MasterDbContext>(options =>
            options.UseInMemoryDatabase("TestMasterDb"));
            
        // Note: TenantDbContext will be created dynamically per tenant
        // This registration is just for DI container satisfaction
        services.AddDbContext<TenantDbContext>(options =>
            options.UseInMemoryDatabase("DefaultTestTenantDb"));
        
        // Register interfaces
        services.AddScoped<IMasterDbContext>(provider => provider.GetRequiredService<MasterDbContext>());
        services.AddScoped<ITenantDbContext>(provider => provider.GetRequiredService<TenantDbContext>());
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<MasterDbContext>());
        
        // Mock services
        services.AddScoped<ITenantService>(provider =>
        {
            var mock = new Mock<ITenantService>();
            mock.Setup(x => x.GetCurrentTenantId()).Returns(Guid.NewGuid());
            mock.Setup(x => x.GetCurrentTenantName()).Returns("Test Tenant");
            return mock.Object;
        });
        
        // Register as singleton to ensure database persistence across requests
        services.AddSingleton<ITenantDbContextFactory, TestTenantDbContextFactory>();
        
        // Mock background job service
        services.AddScoped<IBackgroundJobService, MockBackgroundJobService>();
        
        // Mock other required services
        services.AddScoped<IDateTime, TestDateTimeService>();
        
        // Mock CurrentUserService  
        var currentUserMock = new Mock<Stocker.Application.Common.Interfaces.ICurrentUserService>();
        currentUserMock.Setup(x => x.UserId).Returns("test-user-id");
        currentUserMock.Setup(x => x.TenantId).Returns(Guid.NewGuid().ToString());
        currentUserMock.Setup(x => x.IsAuthenticated).Returns(true);
        currentUserMock.Setup(x => x.IsMasterAdmin).Returns(false);
        currentUserMock.Setup(x => x.Roles).Returns(new[] { "Admin" });
        services.AddScoped(provider => currentUserMock.Object);
        
        var sharedCurrentUserMock = new Mock<Stocker.SharedKernel.Interfaces.ICurrentUserService>();
        sharedCurrentUserMock.Setup(x => x.UserId).Returns(Guid.NewGuid());
        sharedCurrentUserMock.Setup(x => x.TenantId).Returns(Guid.NewGuid());
        sharedCurrentUserMock.Setup(x => x.IsAuthenticated).Returns(true);
        services.AddScoped(provider => sharedCurrentUserMock.Object);
        
        // Mock EmailService
        var emailMock = new Mock<IEmailService>();
        emailMock.Setup(x => x.IsEmailServiceAvailable()).ReturnsAsync(true);
        emailMock.Setup(x => x.SendAsync(It.IsAny<EmailMessage>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        emailMock.Setup(x => x.SendBulkAsync(It.IsAny<IEnumerable<EmailMessage>>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        emailMock.Setup(x => x.SendEmailVerificationAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        emailMock.Setup(x => x.SendPasswordResetAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        emailMock.Setup(x => x.SendWelcomeEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        emailMock.Setup(x => x.SendInvitationEmailAsync(It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);
        services.AddScoped(provider => emailMock.Object);
        
        // Remove any existing authentication services
        services.RemoveAll<Microsoft.AspNetCore.Authentication.IAuthenticationService>();
        services.RemoveAll<Microsoft.AspNetCore.Authentication.IAuthenticationHandlerProvider>();
        services.RemoveAll<Microsoft.AspNetCore.Authentication.IAuthenticationSchemeProvider>();
        
        // Add authentication with test handler as default
        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = TestAuthenticationHandler.SchemeName;
            options.DefaultChallengeScheme = TestAuthenticationHandler.SchemeName;
            options.DefaultScheme = TestAuthenticationHandler.SchemeName;
        })
        .AddScheme<Microsoft.AspNetCore.Authentication.AuthenticationSchemeOptions, TestAuthenticationHandler>(
            TestAuthenticationHandler.SchemeName, null);
        
        services.AddAuthorization();
        
        // Add memory cache
        services.AddMemoryCache();
        services.AddDistributedMemoryCache();
    }
    
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        // Use exception handler for debugging
        app.UseExceptionHandler("/error");
        
        app.UseRouting();
        
        app.UseAuthentication();
        app.UseAuthorization();
        
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllers();
        });
    }
}

public class TestDateTimeService : IDateTime
{
    public DateTime Now => DateTime.Now;
    public DateTime UtcNow => DateTime.UtcNow;
    public DateTimeOffset NowOffset => DateTimeOffset.Now;
    public DateTimeOffset UtcNowOffset => DateTimeOffset.UtcNow;
    public DateOnly Today => DateOnly.FromDateTime(DateTime.Today);
    public TimeOnly TimeOfDay => TimeOnly.FromDateTime(DateTime.Now);
}