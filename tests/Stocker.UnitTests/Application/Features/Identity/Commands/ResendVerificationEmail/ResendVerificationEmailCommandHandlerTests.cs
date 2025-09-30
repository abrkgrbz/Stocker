using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.Identity.Commands.ResendVerificationEmail;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using System.Linq.Expressions;
using Xunit;

namespace Stocker.UnitTests.Application.Features.Identity.Commands.ResendVerificationEmail;

public class ResendVerificationEmailCommandHandlerTests
{
    private readonly Mock<IMasterUnitOfWork> _unitOfWorkMock;
    private readonly Mock<IEmailService> _emailServiceMock;
    private readonly Mock<ILogger<ResendVerificationEmailCommandHandler>> _loggerMock;
    private readonly Mock<IRepository<MasterUser>> _userRepositoryMock;
    private readonly ResendVerificationEmailCommandHandler _handler;

    public ResendVerificationEmailCommandHandlerTests()
    {
        _unitOfWorkMock = new Mock<IMasterUnitOfWork>();
        _emailServiceMock = new Mock<IEmailService>();
        _loggerMock = new Mock<ILogger<ResendVerificationEmailCommandHandler>>();
        _userRepositoryMock = new Mock<IRepository<MasterUser>>();
        
        _unitOfWorkMock.Setup(x => x.Repository<MasterUser>())
            .Returns(_userRepositoryMock.Object);
            
        _handler = new ResendVerificationEmailCommandHandler(
            _unitOfWorkMock.Object,
            _emailServiceMock.Object,
            _loggerMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidUnverifiedUser_ShouldResendVerificationEmail()
    {
        // Arrange
        var email = "user@example.com";
        var command = new ResendVerificationEmailCommand { Email = email };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _emailServiceMock.Setup(x => x.SendEmailVerificationAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Success.Should().BeTrue();
        result.Value.Message.Should().Contain("başarıyla gönderildi");
        
        _emailServiceMock.Verify(x => x.SendEmailVerificationAsync(
            email,
            It.IsAny<string>(),
            "Test User",
            It.IsAny<CancellationToken>()), Times.Once);
        
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Verification email resent")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ShouldReturnSuccessForSecurity()
    {
        // Arrange
        var command = new ResendVerificationEmailCommand { Email = "nonexistent@example.com" };

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync((MasterUser?)null);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue(); // Don't reveal user doesn't exist
        result.Value.Success.Should().BeTrue();
        result.Value.Message.Should().Contain("Eğer bu email adresi kayıtlıysa");
        
        _emailServiceMock.Verify(x => x.SendEmailVerificationAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("User not found")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithAlreadyVerifiedEmail_ShouldReturnSuccess()
    {
        // Arrange
        var email = "user@example.com";
        var command = new ResendVerificationEmailCommand { Email = email };

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

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Value.Success.Should().BeTrue();
        result.Value.Message.Should().Contain("zaten doğrulanmış");
        
        _emailServiceMock.Verify(x => x.SendEmailVerificationAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);
        
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithRateLimiting_ShouldReturnFailureWithRemainingTime()
    {
        // Arrange
        var email = "user@example.com";
        var command = new ResendVerificationEmailCommand { Email = email };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);
        
        // Generate a recent token (within 1 minute)
        user.GenerateEmailVerificationToken();

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("ResendVerification.TooSoon");
        result.Error.Description.Should().Contain("saniye sonra tekrar deneyin");
        
        _emailServiceMock.Verify(x => x.SendEmailVerificationAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Warning,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Rate limit hit")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenEmailServiceFails_ShouldReturnFailure()
    {
        // Arrange
        var email = "user@example.com";
        var command = new ResendVerificationEmailCommand { Email = email };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _emailServiceMock.Setup(x => x.SendEmailVerificationAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("SMTP server unavailable"));

        _unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("ResendVerification.EmailFailed");
        result.Error.Description.Should().Contain("Email gönderilemedi");
        
        _unitOfWorkMock.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Failed to resend verification email")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenGeneralExceptionOccurs_ShouldReturnFailure()
    {
        // Arrange
        var command = new ResendVerificationEmailCommand { Email = "user@example.com" };

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsFailure.Should().BeTrue();
        result.Error.Code.Should().Be("ResendVerification.Failed");
        result.Error.Description.Should().Contain("Email gönderimi sırasında bir hata oluştu");
        
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Error,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Error during resend verification email")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldGenerateNewTokenForEachResend()
    {
        // Arrange
        var email = "user@example.com";
        var command = new ResendVerificationEmailCommand { Email = email };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);
        
        // Generate an old token (more than 1 minute ago)
        var oldToken = user.GenerateEmailVerificationToken();
        var oldTokenValue = oldToken.Token;
        
        // Set the token creation time to more than 1 minute ago using reflection
        // This is necessary to bypass the rate limiting check in the handler
        var tokenType = oldToken.GetType();
        var createdAtField = tokenType.GetField("<CreatedAt>k__BackingField", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (createdAtField != null)
        {
            createdAtField.SetValue(oldToken, DateTime.UtcNow.AddMinutes(-2));
        }

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        string? capturedNewToken = null;
        _emailServiceMock.Setup(x => x.SendEmailVerificationAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .Callback<string, string, string, CancellationToken>((e, token, n, ct) => capturedNewToken = token)
            .Returns(Task.CompletedTask);

        _unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        capturedNewToken.Should().NotBeNull();
        capturedNewToken.Should().NotBe(oldTokenValue); // New token should be generated
        user.EmailVerificationToken.Should().NotBeNull();
        user.EmailVerificationToken.Token.Should().Be(capturedNewToken);
    }

    [Fact]
    public async Task Handle_ShouldLogAllImportantSteps()
    {
        // Arrange
        var email = "user@example.com";
        var command = new ResendVerificationEmailCommand { Email = email };

        var emailValue = Email.Create(email).Value;
        var user = MasterUser.Create(
            username: "testuser",
            email: emailValue,
            plainPassword: "Password123!",
            firstName: "Test",
            lastName: "User",
            userType: Stocker.Domain.Master.Enums.UserType.Personel,
            phoneNumber: null);

        _userRepositoryMock.Setup(x => x.SingleOrDefaultAsync(
            It.IsAny<Expression<Func<MasterUser, bool>>>(),
            It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _emailServiceMock.Setup(x => x.SendEmailVerificationAsync(
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _unitOfWorkMock.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Processing resend verification email")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);

        _loggerMock.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((o, t) => o.ToString()!.Contains("Verification email resent")),
                null,
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}