using Xunit;
using Moq;
using FluentAssertions;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionById;
using Stocker.Application.DTOs.Subscription;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Results;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MockQueryable.Moq;

namespace Stocker.UnitTests.Application.Features.Subscriptions.Queries;

public class GetSubscriptionByIdQueryHandlerTests
{
    private readonly Mock<IMasterDbContext> _contextMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<GetSubscriptionByIdQueryHandler>> _loggerMock;
    private readonly GetSubscriptionByIdQueryHandler _handler;

    public GetSubscriptionByIdQueryHandlerTests()
    {
        _contextMock = new Mock<IMasterDbContext>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<GetSubscriptionByIdQueryHandler>>();
        _handler = new GetSubscriptionByIdQueryHandler(_contextMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Success_When_Subscription_Exists()
    {
        // Arrange
        var subscriptionId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var packageId = Guid.NewGuid();

        var email = Email.Create("test@example.com").Value!;
        var tenant = Stocker.Domain.Master.Entities.Tenant.Create(
            "Test Company",
            "TESTCO",
            "testdb",
            ConnectionString.Create("Server=test;Database=test;").Value!,
            email
        );

        var packageLimits = PackageLimit.Create(100, 1000, 10, 5000);
        var basePrice = Money.Create(100.00m, "TRY");
        var package = Package.Create(
            "Basic Package",
            PackageType.Baslangic,
            basePrice,
            packageLimits
        );

        var subscriptionPrice = Money.Create(100.00m, "TRY");
        var subscription = Subscription.Create(
            tenant.Id,
            package.Id,
            BillingCycle.Aylik,
            subscriptionPrice,
            DateTime.UtcNow,
            DateTime.UtcNow.AddMonths(1)
        );

        var subscriptions = new[] { subscription }.AsQueryable().BuildMockDbSet();

        _contextMock.Setup(x => x.Subscriptions).Returns(subscriptions.Object);

        var subscriptionDto = new SubscriptionDto
        {
            Id = subscription.Id,
            TenantId = tenant.Id,
            PackageId = package.Id,
            Status = SubscriptionStatus.Aktif
        };

        _mapperMock.Setup(x => x.Map<SubscriptionDto>(It.IsAny<Subscription>())).Returns(subscriptionDto);

        var query = new GetSubscriptionByIdQuery { Id = subscription.Id };

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(subscription.Id);
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Subscription_Not_Found()
    {
        // Arrange
        var subscriptionId = Guid.NewGuid();
        var query = new GetSubscriptionByIdQuery { Id = subscriptionId };

        var subscriptions = Array.Empty<Subscription>().AsQueryable().BuildMockDbSet();
        _contextMock.Setup(x => x.Subscriptions).Returns(subscriptions.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Subscription.NotFound");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Exception_Occurs()
    {
        // Arrange
        var subscriptionId = Guid.NewGuid();
        var query = new GetSubscriptionByIdQuery { Id = subscriptionId };

        _contextMock.Setup(x => x.Subscriptions).Throws(new Exception("Database error"));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Subscription.GetFailed");
    }
}