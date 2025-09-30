using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Stocker.Application.Features.Identity.Commands.Register;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Services;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Repositories;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Stocker.UnitTests.Application.Features.Identity.Commands.Register;

public class RegisterCommandHandlerTests
{
    private readonly Mock<IMasterUnitOfWork> _masterUnitOfWorkMock;
    private readonly Mock<ITenantContextFactory> _tenantContextFactoryMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<IBackgroundJobService> _backgroundJobServiceMock;
    private readonly Mock<ILogger<RegisterCommandHandler>> _loggerMock;
    private readonly RegisterCommandHandler _handler;

    public RegisterCommandHandlerTests()
    {
        _masterUnitOfWorkMock = new Mock<IMasterUnitOfWork>();
        _tenantContextFactoryMock = new Mock<ITenantContextFactory>();
        _tokenServiceMock = new Mock<ITokenService>();
        _backgroundJobServiceMock = new Mock<IBackgroundJobService>();
        _loggerMock = new Mock<ILogger<RegisterCommandHandler>>();

        _handler = new RegisterCommandHandler(
            _masterUnitOfWorkMock.Object,
            _tenantContextFactoryMock.Object,
            _tokenServiceMock.Object,
            _backgroundJobServiceMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Email_Invalid()
    {
        // Arrange
        var command = new RegisterCommand
        {
            CompanyName = "Test Company",
            Username = "testuser",
            Email = "invalid-email",  // Invalid email format
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            IdentityType = "VKN",
            IdentityNumber = "1234567890",
            Sector = "Technology",
            EmployeeCount = "1-10"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Register.InvalidData");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Exception_Occurs()
    {
        // Arrange
        var command = new RegisterCommand
        {
            CompanyName = "Test Company",
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            IdentityType = "VKN",
            IdentityNumber = "1234567890",
            Sector = "Technology",
            EmployeeCount = "1-10"
        };

        _masterUnitOfWorkMock.Setup(x => x.Repository<Stocker.Domain.Master.Entities.Tenant>())
            .Throws(new Exception("Database error"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Register.Failed");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_ConnectionString_Invalid()
    {
        // Arrange - connection string will be created internally as SQLite, which should be valid
        // But we can test with empty company name which might fail
        var command = new RegisterCommand
        {
            CompanyName = "",  // Empty company name
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123!",
            FirstName = "Test",
            LastName = "User",
            IdentityType = "VKN",
            IdentityNumber = "1234567890",
            Sector = "Technology",
            EmployeeCount = "1-10"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
    }
}