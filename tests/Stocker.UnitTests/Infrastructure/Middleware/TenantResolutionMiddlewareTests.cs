using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Primitives;
using Moq;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Xunit;
using TenantInfo = Stocker.Infrastructure.Middleware.TenantInfo;
using ITenantResolverService = Stocker.Infrastructure.Middleware.ITenantResolverService;
using TenantResolutionMiddleware = Stocker.Infrastructure.Middleware.TenantResolutionMiddleware;

namespace Stocker.UnitTests.Infrastructure.Middleware;

public class TenantResolutionMiddlewareTests
{
    private readonly Mock<ILogger<TenantResolutionMiddleware>> _loggerMock;
    private readonly Mock<ITenantService> _tenantServiceMock;
    private readonly Mock<ITenantResolverService> _tenantResolverServiceMock;
    private readonly IServiceProvider _serviceProvider;
    private readonly TenantResolutionMiddleware _middleware;
    private readonly DefaultHttpContext _httpContext;
    private bool _nextCalled;

    public TenantResolutionMiddlewareTests()
    {
        _loggerMock = new Mock<ILogger<TenantResolutionMiddleware>>();
        _tenantServiceMock = new Mock<ITenantService>();
        _tenantResolverServiceMock = new Mock<ITenantResolverService>();
        
        var services = new ServiceCollection();
        services.AddSingleton(_tenantServiceMock.Object);
        services.AddSingleton(_tenantResolverServiceMock.Object);
        _serviceProvider = services.BuildServiceProvider();

        _middleware = new TenantResolutionMiddleware(
            next: (context) =>
            {
                _nextCalled = true;
                return Task.CompletedTask;
            },
            _loggerMock.Object
        );

        _httpContext = new DefaultHttpContext
        {
            RequestServices = _serviceProvider
        };
        _nextCalled = false;
    }

    [Fact]
    public async Task InvokeAsync_SkipsResolution_InTestingEnvironment()
    {
        // Arrange
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Testing");
        
        try
        {
            // Act
            await _middleware.InvokeAsync(_httpContext);

            // Assert
            _nextCalled.Should().BeTrue();
            _tenantServiceMock.Verify(x => x.SetCurrentTenant(It.IsAny<Guid>()), Times.Never);
        }
        finally
        {
            Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", null);
        }
    }

    [Theory]
    [InlineData("/health")]
    [InlineData("/healthz")]
    [InlineData("/ready")]
    [InlineData("/health/live")]
    public async Task InvokeAsync_SkipsResolution_ForHealthEndpoints(string path)
    {
        // Arrange
        _httpContext.Request.Path = path;

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task InvokeAsync_SkipsResolution_ForSignalRHubs()
    {
        // Arrange
        _httpContext.Request.Path = "/hubs/notifications";

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromSubdomain_WhenValid()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantCode = "company1";
        _httpContext.Request.Host = new HostString($"{tenantCode}.stocker.app");
        
        _tenantResolverServiceMock
            .Setup(x => x.GetTenantByCodeAsync(tenantCode))
            .ReturnsAsync(new TenantInfo { Id = tenantId, Code = tenantCode, IsActive = true });

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
        _httpContext.Response.Headers.Should().ContainKey("X-Tenant-Id");
    }

    [Theory]
    [InlineData("localhost")]
    [InlineData("127.0.0.1")]
    [InlineData("192.168.1.1")]
    [InlineData("www.stocker.app")]
    [InlineData("api.stocker.app")]
    [InlineData("admin.stocker.app")]
    public async Task InvokeAsync_SkipsSubdomainResolution_ForSpecialHosts(string host)
    {
        // Arrange
        _httpContext.Request.Host = new HostString(host);

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantResolverServiceMock.Verify(
            x => x.GetTenantByCodeAsync(It.IsAny<string>()), 
            Times.Never
        );
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromCustomDomain_WhenSubdomainFails()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var customDomain = "mycustom.domain.com";
        _httpContext.Request.Host = new HostString(customDomain);
        
        _tenantResolverServiceMock
            .Setup(x => x.GetTenantByDomainAsync(customDomain))
            .ReturnsAsync(new TenantInfo { Id = tenantId, Domain = customDomain, IsActive = true });

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromHeader_UsingTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.Headers["X-Tenant-Id"] = tenantId.ToString();

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromHeader_UsingTenantCode()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantCode = "company2";
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.Headers["X-Tenant-Code"] = tenantCode;
        
        _tenantResolverServiceMock
            .Setup(x => x.GetTenantByCodeAsync(tenantCode))
            .ReturnsAsync(new TenantInfo { Id = tenantId, Code = tenantCode, IsActive = true });

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromRoute_WhenPathContainsTenant()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.Path = $"/api/tenant/{tenantId}/users";

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromRoute_UsingContextItems()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Items["tenantId"] = tenantId.ToString();

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromQueryString_UsingTenantId()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.QueryString = new QueryString($"?tenantId={tenantId}");

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_ResolvesFromQueryString_UsingTenantCode()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var tenantCode = "company3";
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.QueryString = new QueryString($"?tenant={tenantCode}");
        
        _tenantResolverServiceMock
            .Setup(x => x.GetTenantByCodeAsync(tenantCode))
            .ReturnsAsync(new TenantInfo { Id = tenantId, Code = tenantCode, IsActive = true });

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(tenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_LogsWarning_WhenNoTenantResolved()
    {
        // Arrange
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.Path = "/api/users";

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(It.IsAny<Guid>()), Times.Never);
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains("No tenant could be resolved")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once
        );
    }

    [Fact]
    public async Task InvokeAsync_PrioritizesResolutionSources_InCorrectOrder()
    {
        // Arrange
        var subdomainTenantId = Guid.NewGuid();
        var headerTenantId = Guid.NewGuid();
        var queryTenantId = Guid.NewGuid();
        
        // Setup all resolution sources
        _httpContext.Request.Host = new HostString("company.stocker.app");
        _httpContext.Request.Headers["X-Tenant-Id"] = headerTenantId.ToString();
        _httpContext.Request.QueryString = new QueryString($"?tenantId={queryTenantId}");
        
        _tenantResolverServiceMock
            .Setup(x => x.GetTenantByCodeAsync("company"))
            .ReturnsAsync(new TenantInfo { Id = subdomainTenantId, Code = "company", IsActive = true });

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        // Should use subdomain (highest priority)
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(subdomainTenantId), Times.Once);
    }

    [Fact]
    public async Task InvokeAsync_AddsResponseHeader_WhenTenantResolved()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        _httpContext.Request.Headers["X-Tenant-Id"] = tenantId.ToString();

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _httpContext.Response.Headers.Should().ContainKey("X-Tenant-Id");
        _httpContext.Response.Headers["X-Tenant-Id"].Should().BeEquivalentTo(tenantId.ToString());
    }

    [Fact]
    public async Task InvokeAsync_HandlesInvalidGuidInHeader_Gracefully()
    {
        // Arrange
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.Headers["X-Tenant-Id"] = "not-a-valid-guid";

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(It.IsAny<Guid>()), Times.Never);
    }

    [Fact]
    public async Task InvokeAsync_HandlesExceptionInRouteResolution_Gracefully()
    {
        // Arrange
        _httpContext.Request.Host = new HostString("localhost");
        _httpContext.Request.Path = "/api/tenant/invalid/users";
        _httpContext.Items["tenantId"] = new object(); // Invalid object that will cause exception

        // Act
        await _middleware.InvokeAsync(_httpContext);

        // Assert
        _nextCalled.Should().BeTrue();
        // Should continue without setting tenant (exception should be caught internally)
        _tenantServiceMock.Verify(x => x.SetCurrentTenant(It.IsAny<Guid>()), Times.Never);
        // Should log warning that no tenant was resolved
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains("No tenant could be resolved")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once
        );
    }
}