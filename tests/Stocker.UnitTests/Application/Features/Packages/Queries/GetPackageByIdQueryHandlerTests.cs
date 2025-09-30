using Xunit;
using Moq;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Features.Packages.Queries.GetPackageById;
using Stocker.Application.DTOs.Package;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MockQueryable.Moq;

namespace Stocker.UnitTests.Application.Features.Packages.Queries;

public class GetPackageByIdQueryHandlerTests
{
    private readonly Mock<IMasterDbContext> _contextMock;
    private readonly Mock<ILogger<GetPackageByIdQueryHandler>> _loggerMock;
    private readonly GetPackageByIdQueryHandler _handler;

    public GetPackageByIdQueryHandlerTests()
    {
        _contextMock = new Mock<IMasterDbContext>();
        _loggerMock = new Mock<ILogger<GetPackageByIdQueryHandler>>();
        _handler = new GetPackageByIdQueryHandler(_contextMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Success_When_Package_Exists()
    {
        // Arrange
        var packageLimits = PackageLimit.Create(100, 1000, 10, 5000);
        var basePrice = Money.Create(100m, "TRY");
        var package = Package.Create(
            "Basic Package",
            PackageType.Baslangic,
            basePrice,
            packageLimits,
            "Basic plan for small businesses"
        );

        var query = new GetPackageByIdQuery(package.Id);

        var mockPackages = new[] { package }.AsQueryable().BuildMockDbSet();

        _contextMock.Setup(x => x.Packages).Returns(mockPackages.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Id.Should().Be(package.Id);
        result.Value.Name.Should().Be("Basic Package");
        result.Value.BasePrice.Amount.Should().Be(100m);
        result.Value.BasePrice.Currency.Should().Be("TRY");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Package_Not_Found()
    {
        // Arrange
        var packageId = Guid.NewGuid();
        var query = new GetPackageByIdQuery(packageId);

        var mockPackages = Array.Empty<Package>().AsQueryable().BuildMockDbSet();

        _contextMock.Setup(x => x.Packages).Returns(mockPackages.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Package.NotFound");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Exception_Occurs()
    {
        // Arrange
        var packageId = Guid.NewGuid();
        var query = new GetPackageByIdQuery(packageId);

        _contextMock.Setup(x => x.Packages).Throws(new Exception("Database error"));

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Package.RetrieveFailed");
    }
}