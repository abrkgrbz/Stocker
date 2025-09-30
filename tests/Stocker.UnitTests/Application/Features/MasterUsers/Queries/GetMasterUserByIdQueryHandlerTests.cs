using Xunit;
using Moq;
using FluentAssertions;
using AutoMapper;
using Microsoft.Extensions.Logging;
using Stocker.Application.Features.MasterUsers.Queries.GetMasterUserById;
using Stocker.Application.DTOs.MasterUser;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MockQueryable.Moq;

namespace Stocker.UnitTests.Application.Features.MasterUsers.Queries;

public class GetMasterUserByIdQueryHandlerTests
{
    private readonly Mock<IMasterUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IMapper> _mapperMock;
    private readonly Mock<ILogger<GetMasterUserByIdQueryHandler>> _loggerMock;
    private readonly GetMasterUserByIdQueryHandler _handler;

    public GetMasterUserByIdQueryHandlerTests()
    {
        _unitOfWorkMock = new Mock<IMasterUnitOfWork>();
        _mapperMock = new Mock<IMapper>();
        _loggerMock = new Mock<ILogger<GetMasterUserByIdQueryHandler>>();
        _handler = new GetMasterUserByIdQueryHandler(_unitOfWorkMock.Object, _mapperMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Success_When_User_Exists()
    {
        // Arrange
        var email = Email.Create("test@example.com").Value!;
        var user = MasterUser.Create(
            "testuser",
            email,
            "Password123!",
            "Test",
            "User",
            UserType.Personel
        );

        var query = new GetMasterUserByIdQuery { UserId = user.Id };
        var userDto = new MasterUserDto { Id = user.Id, Email = "test@example.com" };

        var mockUsers = new[] { user }.AsQueryable().BuildMockDbSet();

        var repositoryMock = new Mock<IRepository<MasterUser>>();
        repositoryMock.Setup(x => x.AsQueryable()).Returns(mockUsers.Object);

        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>()).Returns(repositoryMock.Object);
        _mapperMock.Setup(x => x.Map<MasterUserDto>(It.IsAny<MasterUser>())).Returns(userDto);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Should().NotBeNull();
        result.Value.Email.Should().Be("test@example.com");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_User_Not_Found()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetMasterUserByIdQuery { UserId = userId };

        var mockUsers = Array.Empty<MasterUser>().AsQueryable().BuildMockDbSet();

        var repositoryMock = new Mock<IRepository<MasterUser>>();
        repositoryMock.Setup(x => x.AsQueryable()).Returns(mockUsers.Object);

        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>()).Returns(repositoryMock.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("MasterUser.NotFound");
    }

    [Fact]
    public async Task Handle_Should_Return_Failure_When_Exception_Occurs()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var query = new GetMasterUserByIdQuery { UserId = userId };

        var repositoryMock = new Mock<IRepository<MasterUser>>();
        repositoryMock.Setup(x => x.AsQueryable()).Throws(new Exception("Database error"));

        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>()).Returns(repositoryMock.Object);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeFalse();
        result.Error.Should().NotBeNull();
        result.Error.Code.Should().Be("MasterUser.RetrievalFailed");
    }
}