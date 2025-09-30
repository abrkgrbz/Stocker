using FluentAssertions;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Common.ValueObjects;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class MasterUserTests
{
    [Fact]
    public void Create_WithValidData_ShouldCreateMasterUser()
    {
        // Arrange
        var username = "testuser";
        var emailResult = Email.Create("test@example.com");
        var plainPassword = "TestPassword123!";
        var firstName = "John";
        var lastName = "Doe";
        var userType = UserType.Personel;
        var phoneResult = PhoneNumber.Create("+905551234567");

        // Act
        var user = MasterUser.Create(
            username,
            emailResult.Value,
            plainPassword,
            firstName,
            lastName,
            userType,
            phoneResult.Value
        );

        // Assert
        user.Should().NotBeNull();
        user.Username.Should().Be(username);
        user.Email.Should().Be(emailResult.Value);
        user.FirstName.Should().Be(firstName);
        user.LastName.Should().Be(lastName);
        user.UserType.Should().Be(userType);
        user.PhoneNumber.Should().Be(phoneResult.Value);
        user.IsActive.Should().BeFalse(); // Default is inactive
        user.IsEmailVerified.Should().BeFalse();
        user.TwoFactorEnabled.Should().BeFalse();
        user.FailedLoginAttempts.Should().Be(0);
        user.PreferredLanguage.Should().Be("tr");
        user.Timezone.Should().Be("UTC+3 (Istanbul)");
    }

    [Fact]
    public void Create_WithEmptyUsername_ShouldThrowArgumentException()
    {
        // Arrange
        var emailResult = Email.Create("test@example.com");

        // Act & Assert
        var action = () => MasterUser.Create(
            "",
            emailResult.Value,
            "TestPassword123!",
            "John",
            "Doe",
            UserType.Personel
        );

        action.Should().Throw<ArgumentException>()
            .WithMessage("Username cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyFirstName_ShouldThrowArgumentException()
    {
        // Arrange
        var emailResult = Email.Create("test@example.com");

        // Act & Assert
        var action = () => MasterUser.Create(
            "testuser",
            emailResult.Value,
            "TestPassword123!",
            "",
            "Doe",
            UserType.Personel
        );

        action.Should().Throw<ArgumentException>()
            .WithMessage("First name cannot be empty.*");
    }

    [Fact]
    public void Activate_WhenInactive_ShouldActivateUser()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        user.Activate();

        // Assert
        user.IsActive.Should().BeTrue();
    }

    [Fact]
    public void Activate_WhenAlreadyActive_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.Activate();

        // Act & Assert
        var action = () => user.Activate();
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("User is already active.");
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldDeactivateUser()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.Activate();

        // Act
        user.Deactivate();

        // Assert
        user.IsActive.Should().BeFalse();
    }

    [Fact]
    public void VerifyEmail_WhenUnverified_ShouldVerifyAndActivate()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        user.VerifyEmail();

        // Assert
        user.IsEmailVerified.Should().BeTrue();
        user.EmailVerifiedAt.Should().NotBeNull();
        user.IsActive.Should().BeTrue(); // Auto-activated on email verification
    }

    [Fact]
    public void VerifyEmail_WithValidToken_ShouldVerifyEmail()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var token = user.GenerateEmailVerificationToken();

        // Act
        user.VerifyEmail(token.Token);

        // Assert
        user.IsEmailVerified.Should().BeTrue();
        user.EmailVerifiedAt.Should().NotBeNull();
        user.IsActive.Should().BeTrue();
    }

    [Fact]
    public void VerifyEmail_WithInvalidToken_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.GenerateEmailVerificationToken();

        // Act & Assert
        var action = () => user.VerifyEmail("invalid-token");
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Invalid or expired verification token.");
    }

    [Fact]
    public void ChangePassword_WithCorrectCurrentPassword_ShouldChangePassword()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var currentPassword = "TestPassword123!";
        var newPassword = "NewPassword456!";

        // Act
        user.ChangePassword(currentPassword, newPassword);

        // Assert
        user.Password.Verify(newPassword).Should().BeTrue();
        user.PasswordChangedAt.Should().NotBeNull();
        user.RefreshTokens.Should().BeEmpty(); // Tokens cleared on password change
    }

    [Fact]
    public void ChangePassword_WithIncorrectCurrentPassword_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act & Assert
        var action = () => user.ChangePassword("WrongPassword", "NewPassword456!");
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Current password is incorrect.");
    }

    [Fact]
    public void EnableTwoFactor_WhenDisabled_ShouldEnable()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var secret = "JBSWY3DPEHPK3PXP";

        // Act
        user.EnableTwoFactor(secret);

        // Assert
        user.TwoFactorEnabled.Should().BeTrue();
        user.TwoFactorSecret.Should().Be(secret);
    }

    [Fact]
    public void EnableTwoFactor_WhenAlreadyEnabled_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.EnableTwoFactor("JBSWY3DPEHPK3PXP");

        // Act & Assert
        var action = () => user.EnableTwoFactor("NEWTOKEN");
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Two-factor authentication is already enabled.");
    }

    [Fact]
    public void RecordSuccessfulLogin_ShouldUpdateLoginDetails()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var ipAddress = "192.168.1.1";
        var userAgent = "Mozilla/5.0";

        // Act
        user.RecordSuccessfulLogin(ipAddress, userAgent);

        // Assert
        user.LastLoginAt.Should().NotBeNull();
        user.FailedLoginAttempts.Should().Be(0);
        user.LockoutEndAt.Should().BeNull();
        user.LoginHistory.Should().HaveCount(1);
        user.LoginHistory.First().IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void RecordFailedLogin_AfterFiveAttempts_ShouldLockAccount()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        for (int i = 0; i < 5; i++)
        {
            user.RecordFailedLogin();
        }

        // Assert
        user.FailedLoginAttempts.Should().Be(5);
        user.LockoutEndAt.Should().NotBeNull();
        user.IsLockedOut().Should().BeTrue();
    }

    [Fact]
    public void GetFullName_ShouldReturnConcatenatedName()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        var fullName = user.GetFullName();

        // Assert
        fullName.Should().Be("John Doe");
    }

    [Fact]
    public void UpdateProfile_ShouldUpdateUserDetails()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var newFirstName = "Jane";
        var newLastName = "Smith";
        var newPhoneResult = PhoneNumber.Create("+905559876543");
        var newTimezone = "UTC+2";
        var newLanguage = "en";

        // Act
        user.UpdateProfile(
            newFirstName,
            newLastName,
            newPhoneResult.Value,
            newTimezone,
            newLanguage
        );

        // Assert
        user.FirstName.Should().Be(newFirstName);
        user.LastName.Should().Be(newLastName);
        user.PhoneNumber.Should().Be(newPhoneResult.Value);
        user.Timezone.Should().Be(newTimezone);
        user.PreferredLanguage.Should().Be(newLanguage);
    }

    [Fact]
    public void GenerateRefreshToken_ShouldCreateNewToken()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        var refreshToken = user.GenerateRefreshToken("Device1", "192.168.1.1");

        // Assert
        refreshToken.Should().NotBeNull();
        user.RefreshTokens.Should().HaveCount(1);
        user.RefreshTokens.First().Should().Be(refreshToken);
    }

    [Fact]
    public void GenerateRefreshToken_MoreThanFive_ShouldKeepOnlyLatestFive()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        for (int i = 0; i < 7; i++)
        {
            user.GenerateRefreshToken($"Device{i}", "192.168.1.1");
        }

        // Assert
        user.RefreshTokens.Should().HaveCount(5);
    }

    [Fact]
    public void HasAccessToTenant_AsSystemAdmin_ShouldAlwaysReturnTrue()
    {
        // Arrange
        var emailResult = Email.Create("admin@example.com");
        var user = MasterUser.Create(
            "admin",
            emailResult.Value,
            "AdminPassword123!",
            "Admin",
            "User",
            UserType.SistemYoneticisi
        );
        var tenantId = Guid.NewGuid();

        // Act
        var hasAccess = user.HasAccessToTenant(tenantId);

        // Assert
        hasAccess.Should().BeTrue();
    }

    [Fact]
    public void HasAccessToTenant_AsNonAdmin_WithTenant_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var tenantId = Guid.NewGuid();
        user.AssignToTenant(tenantId, UserType.Personel);

        // Act
        var hasAccess = user.HasAccessToTenant(tenantId);

        // Assert
        // After moving UserTenant to Tenant domain, non-admin users 
        // always return false as tenant access is checked in Tenant context
        hasAccess.Should().BeFalse();
    }

    [Fact]
    public void HasAccessToTenant_AsNonAdmin_WithoutTenant_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var tenantId = Guid.NewGuid();

        // Act
        var hasAccess = user.HasAccessToTenant(tenantId);

        // Assert
        hasAccess.Should().BeFalse();
    }

    [Fact]
    public void AssignToTenant_ShouldNotThrow()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var tenantId = Guid.NewGuid();

        // Act
        Action act = () => user.AssignToTenant(tenantId, UserType.Personel);

        // Assert
        act.Should().NotThrow();
    }

    [Fact]
    public void RemoveFromTenant_ShouldNotThrow()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var tenantId = Guid.NewGuid();
        user.AssignToTenant(tenantId, UserType.Personel);

        // Act
        Action act = () => user.RemoveFromTenant(tenantId);

        // Assert
        act.Should().NotThrow();
    }


    [Fact]
    public void DisableTwoFactor_WhenEnabled_ShouldDisable()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.EnableTwoFactor("JBSWY3DPEHPK3PXP");

        // Act
        user.DisableTwoFactor();

        // Assert
        user.TwoFactorEnabled.Should().BeFalse();
        user.TwoFactorSecret.Should().BeNull();
    }

    [Fact]
    public void DisableTwoFactor_WhenNotEnabled_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act & Assert
        var action = () => user.DisableTwoFactor();
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Two-factor authentication is not enabled.");
    }

    [Fact]
    public void ResetPassword_ShouldChangePasswordAndClearTokens()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var newPassword = "NewSecurePassword123!";
        user.GenerateRefreshToken("Device1", "192.168.1.1");

        // Act
        user.ResetPassword(newPassword);

        // Assert
        user.Password.Verify(newPassword).Should().BeTrue();
        user.PasswordChangedAt.Should().NotBeNull();
        user.RefreshTokens.Should().BeEmpty();
    }

    [Fact]
    public void GeneratePasswordResetToken_ShouldNotThrow()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        Action act = () => user.GeneratePasswordResetToken();

        // Assert
        act.Should().NotThrow();
        user.PasswordResetToken.Should().NotBeNull();
        user.PasswordResetTokenExpiry.Should().BeCloseTo(DateTime.UtcNow.AddHours(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void ValidatePasswordResetToken_WithValidToken_ShouldReturnTrue()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.GeneratePasswordResetToken();
        var token = user.PasswordResetToken;

        // Act
        var isValid = user.ValidatePasswordResetToken(token);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void ValidatePasswordResetToken_WithInvalidToken_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.GeneratePasswordResetToken();

        // Act
        var isValid = user.ValidatePasswordResetToken("invalid-token");

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void ValidatePasswordResetToken_WithExpiredToken_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.GeneratePasswordResetToken();
        // Manually set expiry to past
        var passwordResetTokenExpiryProperty = typeof(MasterUser).GetProperty("PasswordResetTokenExpiry");
        passwordResetTokenExpiryProperty?.SetValue(user, DateTime.UtcNow.AddHours(-1));

        // Act
        var isValid = user.ValidatePasswordResetToken(user.PasswordResetToken);

        // Assert
        isValid.Should().BeFalse();
    }

    [Fact]
    public void GenerateEmailVerificationToken_ShouldCreateValidToken()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        var token = user.GenerateEmailVerificationToken();

        // Assert
        token.Should().NotBeNull();
        token.IsValid().Should().BeTrue();
    }

    [Fact]
    public void IsLockedOut_WhenNotLockedOut_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act
        var isLockedOut = user.IsLockedOut();

        // Assert
        isLockedOut.Should().BeFalse();
    }

    [Fact]
    public void IsLockedOut_WhenLockedOutExpired_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateValidMasterUser();
        // Manually set past lockout
        var lockoutEndAtProperty = typeof(MasterUser).GetProperty("LockoutEndAt");
        lockoutEndAtProperty?.SetValue(user, DateTime.UtcNow.AddHours(-1));

        // Act
        var isLockedOut = user.IsLockedOut();

        // Assert
        isLockedOut.Should().BeFalse();
    }

    [Fact]
    public void Create_WithEmptyLastName_ShouldThrowArgumentException()
    {
        // Arrange
        var emailResult = Email.Create("test@example.com");

        // Act & Assert
        var action = () => MasterUser.Create(
            "testuser",
            emailResult.Value,
            "TestPassword123!",
            "John",
            "",
            UserType.Personel
        );

        action.Should().Throw<ArgumentException>()
            .WithMessage("Last name cannot be empty.*");
    }

    [Fact]
    public void Create_WithEmptyPassword_ShouldThrowArgumentException()
    {
        // Arrange
        var emailResult = Email.Create("test@example.com");

        // Act & Assert
        var action = () => MasterUser.Create(
            "testuser",
            emailResult.Value,
            "",
            "John",
            "Doe",
            UserType.Personel
        );

        action.Should().Throw<ArgumentException>()
            .WithMessage("Password cannot be empty.*");
    }

    [Fact]
    public void Deactivate_WhenAlreadyInactive_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateValidMasterUser();

        // Act & Assert
        var action = () => user.Deactivate();
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("User is already inactive.");
    }

    [Fact]
    public void VerifyEmail_WhenAlreadyVerified_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var user = CreateValidMasterUser();
        user.VerifyEmail();

        // Act & Assert
        var action = () => user.VerifyEmail();
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Email is already verified.");
    }

    [Fact]
    public void RevokeRefreshToken_WithValidToken_ShouldRemoveToken()
    {
        // Arrange
        var user = CreateValidMasterUser();
        var refreshToken = user.GenerateRefreshToken("Device1", "192.168.1.1");

        // Act
        user.RevokeRefreshToken(refreshToken.Token);

        // Assert
        user.RefreshTokens.Should().BeEmpty();
    }

    private static MasterUser CreateValidMasterUser()
    {
        var emailResult = Email.Create("test@example.com");
        return MasterUser.Create(
            "testuser",
            emailResult.Value,
            "TestPassword123!",
            "John",
            "Doe",
            UserType.Personel
        );
    }
}