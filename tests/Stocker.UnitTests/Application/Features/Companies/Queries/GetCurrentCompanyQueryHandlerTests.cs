using Xunit;
using Moq;
using FluentAssertions;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Stocker.Application.Features.Companies.Queries.GetCurrentCompany;
using Stocker.Application.DTOs.Company;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MockQueryable.Moq;

namespace Stocker.UnitTests.Application.Features.Companies.Queries;

public class GetCurrentCompanyQueryHandlerTests
{
    private readonly Mock<ITenantUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<GetCurrentCompanyQueryHandler>> _loggerMock;
    private readonly GetCurrentCompanyQueryHandler _handler;

    public GetCurrentCompanyQueryHandlerTests()
    {
        _unitOfWorkMock = new Mock<ITenantUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<GetCurrentCompanyQueryHandler>>();
        _handler = new GetCurrentCompanyQueryHandler(_unitOfWorkMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Success_When_Company_Exists()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetCurrentCompanyQuery { TenantId = tenantId };

        var email = Email.Create("test@company.com").Value!;
        var address = CompanyAddress.Create("Turkey", "Istanbul", "Kadikoy", "34710", "Test Street 123").Value!;
        var company = Company.Create(tenantId, "Test Company", "TESTCO", "1234567890", email, address);

        var companyDto = new CompanyDto { Id = company.Id, Name = "Test Company" };

        var mockCompanies = new[] { company }.AsQueryable().BuildMockDbSet();

        var repositoryMock = new Mock<IRepository<Company>>();
        repositoryMock.Setup(x => x.AsQueryable()).Returns(mockCompanies.Object);

        _unitOfWorkMock.Setup(x => x.Repository<Company>()).Returns(repositoryMock.Object);
        _mapperMock.Setup(x => x.Map<CompanyDto>(It.IsAny<Company>())).Returns(companyDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Name.Should().Be("Test Company");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Company_Not_Found()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetCurrentCompanyQuery { TenantId = tenantId };

        var mockCompanies = Array.Empty<Company>().AsQueryable().BuildMockDbSet();

        var repositoryMock = new Mock<IRepository<Company>>();
        repositoryMock.Setup(x => x.AsQueryable()).Returns(mockCompanies.Object);

        _unitOfWorkMock.Setup(x => x.Repository<Company>()).Returns(repositoryMock.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Company.NotFound");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Exception_Occurs()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetCurrentCompanyQuery { TenantId = tenantId };

        var repositoryMock = new Mock<IRepository<Company>>();
        repositoryMock.Setup(x => x.AsQueryable()).Throws(new Exception("Database error"));

        _unitOfWorkMock.Setup(x => x.Repository<Company>()).Returns(repositoryMock.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("Company.GetFailed");
    }

    [Fact]
    public async Task Handle_Should_Only_Return_Active_Company()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var query = new GetCurrentCompanyQuery { TenantId = tenantId };

        var email1 = Email.Create("active@company.com").Value!;
        var email2 = Email.Create("inactive@company.com").Value!;
        var address1 = CompanyAddress.Create("Turkey", "Istanbul", "Kadikoy", "34710", "Active Street 123").Value!;
        var address2 = CompanyAddress.Create("Turkey", "Ankara", "Cankaya", "06100", "Inactive Street 456").Value!;

        var activeCompany = Company.Create(tenantId, "Active Company", "ACTIVE", "1234567890", email1, address1);
        var inactiveCompany = Company.Create(tenantId, "Inactive Company", "INACTIVE", "9876543210", email2, address2);
        inactiveCompany.Deactivate();

        var companyDto = new CompanyDto { Id = activeCompany.Id, Name = "Active Company" };

        var mockCompanies = new[] { activeCompany, inactiveCompany }.AsQueryable().BuildMockDbSet();

        var repositoryMock = new Mock<IRepository<Company>>();
        repositoryMock.Setup(x => x.AsQueryable()).Returns(mockCompanies.Object);

        _unitOfWorkMock.Setup(x => x.Repository<Company>()).Returns(repositoryMock.Object);
        _mapperMock.Setup(x => x.Map<CompanyDto>(It.IsAny<Company>())).Returns(companyDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Name.Should().Be("Active Company");
    }
}