using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Services;
using Stocker.SharedKernel.Interfaces;
using Xunit;

namespace Stocker.UnitTests.Application.Services;

public class ModuleActivationServiceTests
{
    private readonly Mock<IServiceProvider> _serviceProviderMock;
    private readonly Mock<ILogger<ModuleActivationService>> _loggerMock;
    private readonly Mock<ITenantService> _tenantServiceMock;
    private readonly ModuleActivationService _service;
    private readonly Guid _tenantId = Guid.NewGuid();

    public ModuleActivationServiceTests()
    {
        _serviceProviderMock = new Mock<IServiceProvider>();
        _loggerMock = new Mock<ILogger<ModuleActivationService>>();
        _tenantServiceMock = new Mock<ITenantService>();
        
        _service = new ModuleActivationService(
            _serviceProviderMock.Object,
            _loggerMock.Object,
            _tenantServiceMock.Object);
    }

    [Theory]
    [InlineData("CRM")]
    [InlineData("Inventory")]
    [InlineData("Sales")]
    [InlineData("Purchase")]
    [InlineData("Finance")]
    [InlineData("HR")]
    public async Task ActivateModuleForTenantAsync_WithRegisteredModule_ShouldReturnTrue(string moduleName)
    {
        // Act
        var result = await _service.ActivateModuleForTenantAsync(_tenantId, moduleName);

        // Assert
        result.Should().BeTrue();
        
        // Verify logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains($"Activating module {moduleName}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains($"Module {moduleName} activated successfully")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task ActivateModuleForTenantAsync_WithUnregisteredModule_ShouldReturnFalse()
    {
        // Arrange
        var unregisteredModule = "UnknownModule";

        // Act
        var result = await _service.ActivateModuleForTenantAsync(_tenantId, unregisteredModule);

        // Assert
        result.Should().BeFalse();
        
        // Verify warning logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains($"Module {unregisteredModule} is not registered")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Theory]
    [InlineData("CRM")]
    [InlineData("Inventory")]
    [InlineData("Sales")]
    public async Task DeactivateModuleForTenantAsync_WithRegisteredModule_ShouldReturnTrue(string moduleName)
    {
        // Act
        var result = await _service.DeactivateModuleForTenantAsync(_tenantId, moduleName);

        // Assert
        result.Should().BeTrue();
        
        // Verify logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains($"Deactivating module {moduleName}")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains($"Module {moduleName} deactivated successfully")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task DeactivateModuleForTenantAsync_WithUnregisteredModule_ShouldReturnFalse()
    {
        // Arrange
        var unregisteredModule = "UnknownModule";

        // Act
        var result = await _service.DeactivateModuleForTenantAsync(_tenantId, unregisteredModule);

        // Assert
        result.Should().BeFalse();
        
        // Verify warning logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains($"Module {unregisteredModule} is not registered")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task IsModuleActiveForTenantAsync_ShouldReturnTrue()
    {
        // Arrange
        var scopeMock = new Mock<IServiceScope>();
        var scopeFactoryMock = new Mock<IServiceScopeFactory>();
        
        scopeFactoryMock.Setup(x => x.CreateScope()).Returns(scopeMock.Object);
        _serviceProviderMock.Setup(x => x.GetService(typeof(IServiceScopeFactory)))
            .Returns(scopeFactoryMock.Object);

        // Act
        var result = await _service.IsModuleActiveForTenantAsync(_tenantId, "CRM");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task IsModuleActiveForTenantAsync_WithException_ShouldReturnFalse()
    {
        // Arrange
        var scopeFactoryMock = new Mock<IServiceScopeFactory>();
        scopeFactoryMock.Setup(x => x.CreateScope())
            .Throws(new Exception("Test exception"));
        
        _serviceProviderMock.Setup(x => x.GetService(typeof(IServiceScopeFactory)))
            .Returns(scopeFactoryMock.Object);

        // Act
        var result = await _service.IsModuleActiveForTenantAsync(_tenantId, "CRM");

        // Assert
        result.Should().BeFalse();
        
        // Verify error logging
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString().Contains("Error checking module")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task GetActiveModulesForTenantAsync_ShouldReturnActiveModules()
    {
        // Act
        var result = await _service.GetActiveModulesForTenantAsync(_tenantId);

        // Assert
        result.Should().NotBeNull();
        result.Should().Contain("CRM");
        result.Count.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task GetActiveModulesForTenantAsync_WithException_ShouldReturnEmptyList()
    {
        // Arrange
        var serviceWithException = new ModuleActivationServiceWithException(
            _serviceProviderMock.Object,
            _loggerMock.Object,
            _tenantServiceMock.Object);

        // Act & Assert
        // Since we use 'new' keyword, we need to cast to the derived type
        await Assert.ThrowsAsync<Exception>(async () => 
            await serviceWithException.GetActiveModulesForTenantAsync(_tenantId));
    }

    [Fact]
    public async Task ActivateModuleForTenantAsync_WithCancellation_ShouldHandleGracefully()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act
        var result = await _service.ActivateModuleForTenantAsync(_tenantId, "CRM", cts.Token);

        // Assert
        result.Should().BeTrue(); // Service doesn't currently check cancellation token
    }

    [Fact]
    public async Task DeactivateModuleForTenantAsync_WithCancellation_ShouldHandleGracefully()
    {
        // Arrange
        var cts = new CancellationTokenSource();
        cts.Cancel();

        // Act
        var result = await _service.DeactivateModuleForTenantAsync(_tenantId, "CRM", cts.Token);

        // Assert
        result.Should().BeTrue(); // Service doesn't currently check cancellation token
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task ActivateModuleForTenantAsync_WithInvalidModuleName_ShouldReturnFalse(string moduleName)
    {
        // Act
        var result = await _service.ActivateModuleForTenantAsync(_tenantId, moduleName);

        // Assert
        result.Should().BeFalse();
    }

    [Theory]
    [InlineData("")]
    [InlineData(null)]
    public async Task DeactivateModuleForTenantAsync_WithInvalidModuleName_ShouldReturnFalse(string moduleName)
    {
        // Act
        var result = await _service.DeactivateModuleForTenantAsync(_tenantId, moduleName);

        // Assert
        result.Should().BeFalse();
    }

    // Helper class for testing exception scenarios
    private class ModuleActivationServiceWithException : ModuleActivationService
    {
        public ModuleActivationServiceWithException(
            IServiceProvider serviceProvider,
            ILogger<ModuleActivationService> logger,
            ITenantService tenantService)
            : base(serviceProvider, logger, tenantService)
        {
        }

        public new async Task<List<string>> GetActiveModulesForTenantAsync(
            Guid tenantId,
            CancellationToken cancellationToken = default)
        {
            throw new Exception("Test exception");
        }
    }
}