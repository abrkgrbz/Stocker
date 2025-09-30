using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using MockQueryable.Moq;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Identity.Commands.VerifyEmail;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using System.Linq.Expressions;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity.Commands.VerifyEmail;

public class VerifyEmailCommandHandlerTests
{
    private readonly Mock<IMasterUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<VerifyEmailCommandHandler>> _loggerMock;
    private readonly Mock<IRepository<MasterUser>> _userRepositoryMock;
    private readonly VerifyEmailCommandHandler _handler;

    public VerifyEmailCommandHandlerTests()
    {
        _unitOfWorkMock = new Mock<IMasterUnitOfWork>();
        _loggerMock = new Mock<ILogger<VerifyEmailCommandHandler>>();
        _userRepositoryMock = new Mock<IRepository<MasterUser>>();
        
        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>())
            .Returns(_userRepositoryMock.Object);
            
        _handler = new VerifyEmailCommandHandler(_unitOfWorkMock.Object, _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidTokenAndUnverifiedEmail_ShouldVerifyEmailSuccessfully()
    {
        // Arrange
        var email = "user@example.com";
        var token = "valid-token-123";
        var command = new VerifyEmailCommand
        {
            Email = email,
            Token = token
        };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);
        
        // Generate and set a valid token
        var verificationToken = user.GenerateEmailVerificationToken();
        command.Token = verificationToken.Token;

        var users = new List<MasterUser> { user }.AsQueryable();
        var mockDbSet = CreateMockDbSet(users);
        
        _userRepositoryMock.Setup(x => x.AsQueryable())
            .Returns(mockDbSet);

        _unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Success.Should().BeTrue();
        result.Value.Message.Should().Contain("başarıyla doğrulandı");
        result.Value.RedirectUrl.Should().Be("/company-setup");
        
        user.IsEmailVerified.Should().BeTrue();
        user.IsActive.Should().BeTrue();
        
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Email verified successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithAlreadyVerifiedEmail_ShouldReturnSuccessWithLoginRedirect()
    {
        // Arrange
        var email = "user@example.com";
        var command = new VerifyEmailCommand
        {
            Email = email,
            Token = "any-token"
        };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);
        
        user.VerifyEmail(); // Already verified

        var users = new List<MasterUser> { user }.AsQueryable();
        var mockDbSet = CreateMockDbSet(users);
        
        _userRepositoryMock.Setup(x => x.AsQueryable())
            .Returns(mockDbSet);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Success.Should().BeTrue();
        result.Value.Message.Should().Contain("zaten doğrulanmış");
        result.Value.RedirectUrl.Should().Be("/login");
        
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Email already verified")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidToken_ShouldReturnFailure()
    {
        // Arrange
        var email = "user@example.com";
        var command = new VerifyEmailCommand
        {
            Email = email,
            Token = "invalid-token"
        };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);
        
        user.GenerateEmailVerificationToken(); // Generate token but use different one

        var users = new List<MasterUser> { user }.AsQueryable();
        var mockDbSet = CreateMockDbSet(users);
        
        _userRepositoryMock.Setup(x => x.AsQueryable())
            .Returns(mockDbSet);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("VerifyEmail.InvalidToken");
        result.Error.Description.Should().Contain("Geçersiz veya süresi dolmuş");
        
        user.IsEmailVerified.Should().BeFalse();
        
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Invalid email verification token")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ShouldReturnNotFound()
    {
        // Arrange
        var command = new VerifyEmailCommand
        {
            Email = "nonexistent@example.com",
            Token = "some-token"
        };

        var users = new List<MasterUser>().AsQueryable();
        var mockDbSet = CreateMockDbSet(users);
        
        _userRepositoryMock.Setup(x => x.AsQueryable())
            .Returns(mockDbSet);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("VerifyEmail.UserNotFound");
        result.Error.Description.Should().Contain("Kullanıcı bulunamadı");
        
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Email verification attempted for non-existent user")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithInvalidEmailFormat_ShouldReturnValidationError()
    {
        // Arrange
        var command = new VerifyEmailCommand
        {
            Email = "invalid-email",
            Token = "some-token"
        };

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("VerifyEmail.InvalidEmail");
        result.Error.Description.Should().Contain("Geçersiz email adresi");
        
        _userRepositoryMock.Verify(x => x.AsQueryable(), Times.Never);
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenExceptionOccurs_ShouldReturnFailureAndLogError()
    {
        // Arrange
        var command = new VerifyEmailCommand
        {
            Email = "user@example.com",
            Token = "token"
        };

        _userRepositoryMock.Setup(x => x.AsQueryable())
            .Throws(new Exception("Database connection failed"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("VerifyEmail.Failed");
        result.Error.Description.Should().Contain("Email doğrulama işlemi başarısız");
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Error verifying email")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithInactiveUser_ShouldActivateUserAfterVerification()
    {
        // Arrange
        var email = "user@example.com";
        var command = new VerifyEmailCommand
        {
            Email = email,
            Token = "valid-token"
        };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);
        
        // MasterUser.Create sets IsActive = false by default (user starts inactive)
        var verificationToken = user.GenerateEmailVerificationToken();
        command.Token = verificationToken.Token;

        var users = new List<MasterUser> { user }.AsQueryable();
        var mockDbSet = CreateMockDbSet(users);
        
        _userRepositoryMock.Setup(x => x.AsQueryable())
            .Returns(mockDbSet);

        _unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        user.IsEmailVerified.Should().BeTrue();
        user.IsActive.Should().BeTrue();
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Email verified successfully")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    private IQueryable<T> CreateMockDbSet<T>(IQueryable<T> data) where T : class
    {
        // Use MockQueryable for proper async support
        var mockDbSet = data.BuildMockDbSet();
        return mockDbSet.Object;
    }
}