using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class PasswordHistoryTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private const string PasswordHash = "hashed_password_123456";
    private const string Salt = "salt_abc_123";
    private const int Length = 12;
    private const string ChangedBy = "user@test.com";
    private const string ChangedFromIP = "192.168.1.100";

    [Fact]
    public void Create_WithValidData_ShouldCreatePasswordHistory()
    {
        // Act
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.UserRequested,
            ChangedBy,
            ChangedFromIP,
            expirationDays: 90);

        // Assert
        history.Should().NotBeNull();
        history.Id.Should().NotBeEmpty();
        history.UserId.Should().Be(_userId);
        history.PasswordHash.Should().Be(PasswordHash);
        history.Salt.Should().Be(Salt);
        history.Length.Should().Be(Length);
        history.ChangeReason.Should().Be(PasswordChangeReason.UserRequested);
        history.ChangedBy.Should().Be(ChangedBy);
        history.ChangedFromIP.Should().Be(ChangedFromIP);
        history.ChangedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        history.ExpirationDate.Should().NotBeNull();
        history.ExpirationDate.Should().BeCloseTo(DateTime.UtcNow.AddDays(90), TimeSpan.FromSeconds(1));
        
        // Default values
        history.PasswordStrength.Should().Be(0);
        history.MeetsComplexityRequirements.Should().BeFalse();
        history.WasCompromised.Should().BeFalse();
        history.WasExpired.Should().BeFalse();
        history.DaysUsed.Should().Be(0);
        history.FailedAttemptCount.Should().Be(0);
        history.ForcedChange.Should().BeFalse();
    }

    [Fact]
    public void Create_WithoutOptionalParameters_ShouldCreateWithDefaults()
    {
        // Act
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy);

        // Assert
        history.Should().NotBeNull();
        history.ChangedFromIP.Should().BeNull();
        history.ExpirationDate.Should().BeNull();
        history.ChangedFromDevice.Should().BeNull();
        history.ChangedFromLocation.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyUserId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => PasswordHistory.Create(
            Guid.Empty,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("User ID is required*")
            .WithParameterName("userId");
    }

    [Fact]
    public void Create_WithNullPasswordHash_ShouldThrowArgumentException()
    {
        // Act
        var action = () => PasswordHistory.Create(
            _userId,
            null!,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Password hash is required*")
            .WithParameterName("passwordHash");
    }

    [Fact]
    public void Create_WithEmptyPasswordHash_ShouldThrowArgumentException()
    {
        // Act
        var action = () => PasswordHistory.Create(
            _userId,
            "",
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Password hash is required*")
            .WithParameterName("passwordHash");
    }

    [Fact]
    public void Create_WithNullSalt_ShouldThrowArgumentException()
    {
        // Act
        var action = () => PasswordHistory.Create(
            _userId,
            PasswordHash,
            null!,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Salt is required*")
            .WithParameterName("salt");
    }

    [Fact]
    public void Create_WithNullChangedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Changed by is required*")
            .WithParameterName("changedBy");
    }

    [Theory]
    [InlineData(30)]
    [InlineData(60)]
    [InlineData(90)]
    [InlineData(180)]
    [InlineData(365)]
    public void Create_WithDifferentExpirationDays_ShouldSetCorrectExpiration(int days)
    {
        // Act
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy,
            expirationDays: days);

        // Assert
        history.ExpirationDate.Should().NotBeNull();
        history.ExpirationDate.Should().BeCloseTo(
            DateTime.UtcNow.AddDays(days), 
            TimeSpan.FromSeconds(1));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-30)]
    public void Create_WithZeroOrNegativeExpirationDays_ShouldNotSetExpiration(int days)
    {
        // Act
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy,
            expirationDays: days);

        // Assert
        history.ExpirationDate.Should().BeNull();
    }

    [Fact]
    public void SetPasswordAnalysis_WithValidData_ShouldUpdateAnalysis()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.SetPasswordAnalysis(
            strength: 85,
            meetsComplexity: true,
            hasUppercase: true,
            hasLowercase: true,
            hasNumbers: true,
            hasSpecialCharacters: true,
            hasSequential: false,
            hasRepeating: false);

        // Assert
        history.PasswordStrength.Should().Be(85);
        history.MeetsComplexityRequirements.Should().BeTrue();
        history.HasUppercase.Should().BeTrue();
        history.HasLowercase.Should().BeTrue();
        history.HasNumbers.Should().BeTrue();
        history.HasSpecialCharacters.Should().BeTrue();
        history.HasSequentialCharacters.Should().BeFalse();
        history.HasRepeatingCharacters.Should().BeFalse();
    }

    [Theory]
    [InlineData(-10, 0)]
    [InlineData(0, 0)]
    [InlineData(50, 50)]
    [InlineData(100, 100)]
    [InlineData(150, 100)]
    public void SetPasswordAnalysis_WithDifferentStrengths_ShouldClampTo0To100(int input, int expected)
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.SetPasswordAnalysis(
            strength: input,
            meetsComplexity: true,
            hasUppercase: true,
            hasLowercase: true,
            hasNumbers: true,
            hasSpecialCharacters: false,
            hasSequential: false,
            hasRepeating: false);

        // Assert
        history.PasswordStrength.Should().Be(expected);
    }

    [Fact]
    public void SetPasswordAnalysis_WithWeakPassword_ShouldReflectWeakness()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.SetPasswordAnalysis(
            strength: 20,
            meetsComplexity: false,
            hasUppercase: false,
            hasLowercase: true,
            hasNumbers: false,
            hasSpecialCharacters: false,
            hasSequential: true,
            hasRepeating: true);

        // Assert
        history.PasswordStrength.Should().Be(20);
        history.MeetsComplexityRequirements.Should().BeFalse();
        history.HasUppercase.Should().BeFalse();
        history.HasLowercase.Should().BeTrue();
        history.HasNumbers.Should().BeFalse();
        history.HasSpecialCharacters.Should().BeFalse();
        history.HasSequentialCharacters.Should().BeTrue();
        history.HasRepeatingCharacters.Should().BeTrue();
    }

    [Fact]
    public void SetChangeDetails_ShouldUpdateDetails()
    {
        // Arrange
        var history = CreatePasswordHistory();
        var reasonDetails = "Password expired after 90 days";
        var device = "Windows PC - Chrome";
        var location = "New York, USA";

        // Act
        history.SetChangeDetails(reasonDetails, device, location);

        // Assert
        history.ChangeReasonDetails.Should().Be(reasonDetails);
        history.ChangedFromDevice.Should().Be(device);
        history.ChangedFromLocation.Should().Be(location);
    }

    [Fact]
    public void SetChangeDetails_WithNullValues_ShouldAcceptNulls()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.SetChangeDetails(null, null, null);

        // Assert
        history.ChangeReasonDetails.Should().BeNull();
        history.ChangedFromDevice.Should().BeNull();
        history.ChangedFromLocation.Should().BeNull();
    }

    [Fact]
    public void MarkAsCompromised_WithValidReason_ShouldMarkCompromised()
    {
        // Arrange
        var history = CreatePasswordHistory();
        var reason = "Detected in data breach";

        // Act
        history.MarkAsCompromised(reason);

        // Assert
        history.WasCompromised.Should().BeTrue();
        history.CompromisedAt.Should().NotBeNull();
        history.CompromisedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        history.CompromiseReason.Should().Be(reason);
    }

    [Fact]
    public void MarkAsCompromised_WithNullReason_ShouldThrowArgumentException()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        var action = () => history.MarkAsCompromised(null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Compromise reason is required*")
            .WithParameterName("reason");
    }

    [Fact]
    public void MarkAsCompromised_WithEmptyReason_ShouldThrowArgumentException()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        var action = () => history.MarkAsCompromised("");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Compromise reason is required*")
            .WithParameterName("reason");
    }

    [Fact]
    public void RecordFailedAttempt_ShouldIncrementCounter()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.RecordFailedAttempt();
        history.RecordFailedAttempt();
        history.RecordFailedAttempt();

        // Assert
        history.FailedAttemptCount.Should().Be(3);
        history.LastFailedAttemptAt.Should().NotBeNull();
        history.LastFailedAttemptAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void RecordFailedAttempt_MultipleTimes_ShouldUpdateLastAttemptTime()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.RecordFailedAttempt();
        var firstAttempt = history.LastFailedAttemptAt;
        
        System.Threading.Thread.Sleep(10); // Small delay
        history.RecordFailedAttempt();
        var secondAttempt = history.LastFailedAttemptAt;

        // Assert
        history.FailedAttemptCount.Should().Be(2);
        secondAttempt.Should().BeAfter(firstAttempt!.Value);
    }

    [Fact]
    public void RecordValidation_ShouldUpdateValidationTime()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.RecordValidation();

        // Assert
        history.LastValidatedAt.Should().NotBeNull();
        history.LastValidatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void RecordValidation_MultipleTimes_ShouldUpdateEachTime()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        history.RecordValidation();
        var firstValidation = history.LastValidatedAt;
        
        System.Threading.Thread.Sleep(10);
        history.RecordValidation();
        var secondValidation = history.LastValidatedAt;

        // Assert
        secondValidation.Should().BeAfter(firstValidation!.Value);
    }

    [Fact]
    public void CalculateDaysUsed_WithoutEndDate_ShouldCalculateFromNow()
    {
        // Arrange
        var history = CreatePasswordHistory();
        // Simulate password created 10 days ago
        var changedAtProperty = typeof(PasswordHistory).GetProperty("ChangedAt");
        changedAtProperty!.SetValue(history, DateTime.UtcNow.AddDays(-10));

        // Act
        history.CalculateDaysUsed();

        // Assert
        history.DaysUsed.Should().Be(10);
        history.WasExpired.Should().BeFalse();
    }

    [Fact]
    public void CalculateDaysUsed_WithEndDate_ShouldCalculateFromEndDate()
    {
        // Arrange
        var history = CreatePasswordHistory();
        var changedAtProperty = typeof(PasswordHistory).GetProperty("ChangedAt");
        var createdDate = DateTime.UtcNow.AddDays(-30);
        changedAtProperty!.SetValue(history, createdDate);
        var endDate = DateTime.UtcNow.AddDays(-5);

        // Act
        history.CalculateDaysUsed(endDate);

        // Assert
        history.DaysUsed.Should().Be(25); // 30 - 5 = 25 days
    }

    [Fact]
    public void CalculateDaysUsed_WithExpiredPassword_ShouldMarkAsExpired()
    {
        // Arrange
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy,
            expirationDays: 30);
        
        // Set creation date to 40 days ago
        var changedAtProperty = typeof(PasswordHistory).GetProperty("ChangedAt");
        changedAtProperty!.SetValue(history, DateTime.UtcNow.AddDays(-40));
        
        // Set expiration to 10 days ago
        var expirationProperty = typeof(PasswordHistory).GetProperty("ExpirationDate");
        expirationProperty!.SetValue(history, DateTime.UtcNow.AddDays(-10));

        // Act
        history.CalculateDaysUsed();

        // Assert
        history.WasExpired.Should().BeTrue();
        history.DaysUsed.Should().Be(40);
    }

    [Fact]
    public void IsExpired_WithNoExpiration_ShouldReturnFalse()
    {
        // Arrange
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy);

        // Act
        var result = history.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithFutureExpiration_ShouldReturnFalse()
    {
        // Arrange
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy,
            expirationDays: 90);

        // Act
        var result = history.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithPastExpiration_ShouldReturnTrue()
    {
        // Arrange
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy,
            expirationDays: 1);
        
        // Set expiration to yesterday
        var expirationProperty = typeof(PasswordHistory).GetProperty("ExpirationDate");
        expirationProperty!.SetValue(history, DateTime.UtcNow.AddDays(-1));

        // Act
        var result = history.IsExpired();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void GetDaysUntilExpiration_WithNoExpiration_ShouldReturnMaxValue()
    {
        // Arrange
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy);

        // Act
        var days = history.GetDaysUntilExpiration();

        // Assert
        days.Should().Be(int.MaxValue);
    }

    [Fact]
    public void GetDaysUntilExpiration_WithFutureExpiration_ShouldReturnPositiveDays()
    {
        // Arrange
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy,
            expirationDays: 30);

        // Act
        var days = history.GetDaysUntilExpiration();

        // Assert
        days.Should().BeInRange(29, 30);
    }

    [Fact]
    public void GetDaysUntilExpiration_WithPastExpiration_ShouldReturnZero()
    {
        // Arrange
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.Initial,
            ChangedBy,
            expirationDays: 1);
        
        // Set expiration to 5 days ago
        var expirationProperty = typeof(PasswordHistory).GetProperty("ExpirationDate");
        expirationProperty!.SetValue(history, DateTime.UtcNow.AddDays(-5));

        // Act
        var days = history.GetDaysUntilExpiration();

        // Assert
        days.Should().Be(0);
    }

    [Fact]
    public void MatchesPassword_WithSameHash_ShouldReturnTrue()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        var result = history.MatchesPassword(PasswordHash);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void MatchesPassword_WithDifferentHash_ShouldReturnFalse()
    {
        // Arrange
        var history = CreatePasswordHistory();

        // Act
        var result = history.MatchesPassword("different_hash_456");

        // Assert
        result.Should().BeFalse();
    }

    [Theory]
    [InlineData(PasswordChangeReason.Initial)]
    [InlineData(PasswordChangeReason.UserRequested)]
    [InlineData(PasswordChangeReason.AdminForced)]
    [InlineData(PasswordChangeReason.Expired)]
    [InlineData(PasswordChangeReason.Compromised)]
    [InlineData(PasswordChangeReason.PolicyChange)]
    [InlineData(PasswordChangeReason.SecurityReset)]
    [InlineData(PasswordChangeReason.ForgotPassword)]
    [InlineData(PasswordChangeReason.FirstLogin)]
    [InlineData(PasswordChangeReason.Scheduled)]
    [InlineData(PasswordChangeReason.TwoFactorReset)]
    public void Create_WithDifferentChangeReasons_ShouldAcceptAll(PasswordChangeReason reason)
    {
        // Act
        var history = PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            reason,
            ChangedBy);

        // Assert
        history.ChangeReason.Should().Be(reason);
    }

    [Fact]
    public void CompletePasswordLifecycle_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var userId = Guid.NewGuid();
        var history = PasswordHistory.Create(
            userId,
            "hash_P@ssw0rd123!",
            "salt_xyz_789",
            14,
            PasswordChangeReason.FirstLogin,
            "user@company.com",
            "192.168.1.50",
            expirationDays: 90);

        // Set password analysis (strong password)
        history.SetPasswordAnalysis(
            strength: 92,
            meetsComplexity: true,
            hasUppercase: true,
            hasLowercase: true,
            hasNumbers: true,
            hasSpecialCharacters: true,
            hasSequential: false,
            hasRepeating: false);

        // Set change details
        history.SetChangeDetails(
            "First login - forced password change",
            "Windows 11 - Edge Browser",
            "Seattle, WA, USA");

        // Record some failed attempts
        history.RecordFailedAttempt();
        history.RecordFailedAttempt();
        
        // Record successful validation
        history.RecordValidation();

        // Simulate password was changed 30 days ago
        // Note: Since we can't modify ChangedAt directly, we'll skip the expiration check
        // or create a new history with past date
        history.CalculateDaysUsed();

        // Assert final state
        history.UserId.Should().Be(userId);
        history.Length.Should().Be(14);
        history.PasswordStrength.Should().Be(92);
        history.MeetsComplexityRequirements.Should().BeTrue();
        history.HasUppercase.Should().BeTrue();
        history.HasLowercase.Should().BeTrue();
        history.HasNumbers.Should().BeTrue();
        history.HasSpecialCharacters.Should().BeTrue();
        history.HasSequentialCharacters.Should().BeFalse();
        history.HasRepeatingCharacters.Should().BeFalse();
        
        history.FailedAttemptCount.Should().Be(2);
        history.LastFailedAttemptAt.Should().NotBeNull();
        history.LastValidatedAt.Should().NotBeNull();
        
        // DaysUsed will be 0 since we just created it
        history.DaysUsed.Should().Be(0);
        history.IsExpired().Should().BeFalse();
        // Since expiration is 90 days from now, it should be around 89-90 days
        history.GetDaysUntilExpiration().Should().BeInRange(89, 90);
        
        history.ChangeReasonDetails.Should().Be("First login - forced password change");
        history.ChangedFromDevice.Should().Be("Windows 11 - Edge Browser");
        history.ChangedFromLocation.Should().Be("Seattle, WA, USA");
        
        // Test compromise scenario
        history.MarkAsCompromised("Found in public data breach");
        history.WasCompromised.Should().BeTrue();
        history.CompromiseReason.Should().Be("Found in public data breach");
        history.CompromisedAt.Should().NotBeNull();
        
        // Test password matching
        history.MatchesPassword("hash_P@ssw0rd123!").Should().BeTrue();
        history.MatchesPassword("wrong_hash").Should().BeFalse();
    }

    private PasswordHistory CreatePasswordHistory()
    {
        return PasswordHistory.Create(
            _userId,
            PasswordHash,
            Salt,
            Length,
            PasswordChangeReason.UserRequested,
            ChangedBy,
            ChangedFromIP);
    }
}