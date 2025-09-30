using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantOnboardingTests
{
    private const string Name = "New Employee Onboarding";
    private const string TargetUserId = "user123";
    private const string TargetUserEmail = "john.doe@test.com";
    private const string TargetUserName = "John Doe";
    private const string CreatedBy = "admin@test.com";
    private const string Description = "Onboarding process for new employees";

    [Fact]
    public void Create_WithValidData_ShouldCreateOnboarding()
    {
        // Act
        var onboarding = TenantOnboarding.Create(
            Name,
            OnboardingType.NewEmployee,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            CreatedBy,
            Description,
            isRequired: true);

        // Assert
        onboarding.Should().NotBeNull();
        onboarding.Id.Should().NotBeEmpty();
        onboarding.Name.Should().Be(Name);
        onboarding.Type.Should().Be(OnboardingType.NewEmployee);
        onboarding.Description.Should().Be(Description);
        onboarding.Status.Should().Be(OnboardingStatus.NotStarted);
        onboarding.TargetUserId.Should().Be(TargetUserId);
        onboarding.TargetUserEmail.Should().Be(TargetUserEmail);
        onboarding.TargetUserName.Should().Be(TargetUserName);
        onboarding.IsRequired.Should().BeTrue();
        onboarding.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        onboarding.CreatedBy.Should().Be(CreatedBy);
        onboarding.TotalSteps.Should().BeGreaterThan(0); // Default steps added
        onboarding.CompletedSteps.Should().Be(0);
        onboarding.SkippedSteps.Should().Be(0);
        onboarding.ProgressPercentage.Should().Be(0);
        onboarding.LoginCount.Should().Be(0);
        onboarding.HelpRequestCount.Should().Be(0);
        onboarding.ReminderFrequencyDays.Should().Be(3);
    }

    [Fact]
    public void Create_NewEmployeeType_ShouldInitializeDefaultSteps()
    {
        // Act
        var onboarding = TenantOnboarding.Create(
            Name,
            OnboardingType.NewEmployee,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            CreatedBy);

        // Assert
        onboarding.Steps.Should().NotBeEmpty();
        onboarding.Steps.Should().HaveCount(5);
        onboarding.TotalSteps.Should().Be(5);
        
        var steps = onboarding.Steps.ToList();
        steps[0].Title.Should().Be("Welcome");
        steps[0].Type.Should().Be(StepType.Information);
        steps[0].IsRequired.Should().BeTrue();
        
        steps[1].Title.Should().Be("Profile Setup");
        steps[1].Type.Should().Be(StepType.Form);
        steps[1].IsRequired.Should().BeTrue();
        
        steps[2].Title.Should().Be("Company Policies");
        steps[2].Type.Should().Be(StepType.Document);
        steps[2].IsRequired.Should().BeTrue();
        
        steps[3].Title.Should().Be("Training Videos");
        steps[3].Type.Should().Be(StepType.Video);
        steps[3].IsRequired.Should().BeFalse();
        
        steps[4].Title.Should().Be("System Tour");
        steps[4].Type.Should().Be(StepType.Interactive);
        steps[4].IsRequired.Should().BeFalse();
    }

    [Fact]
    public void Create_NewCustomerType_ShouldInitializeCustomerSteps()
    {
        // Act
        var onboarding = TenantOnboarding.Create(
            "Customer Onboarding",
            OnboardingType.NewCustomer,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            CreatedBy);

        // Assert
        onboarding.Steps.Should().HaveCount(3);
        var steps = onboarding.Steps.ToList();
        steps[0].Title.Should().Be("Account Setup");
        steps[1].Title.Should().Be("Product Tour");
        steps[2].Title.Should().Be("First Order");
    }

    [Fact]
    public void Create_NewAdminType_ShouldInitializeAdminSteps()
    {
        // Act
        var onboarding = TenantOnboarding.Create(
            "Admin Onboarding",
            OnboardingType.NewAdmin,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            CreatedBy);

        // Assert
        onboarding.Steps.Should().HaveCount(3);
        var steps = onboarding.Steps.ToList();
        steps[0].Title.Should().Be("Admin Training");
        steps[1].Title.Should().Be("Security Setup");
        steps[2].Title.Should().Be("Team Setup");
    }

    [Fact]
    public void Create_SystemMigrationType_ShouldInitializeMigrationSteps()
    {
        // Act
        var onboarding = TenantOnboarding.Create(
            "System Migration",
            OnboardingType.SystemMigration,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            CreatedBy);

        // Assert
        onboarding.Steps.Should().HaveCount(3);
        var steps = onboarding.Steps.ToList();
        steps[0].Title.Should().Be("Data Review");
        steps[1].Title.Should().Be("Settings Configuration");
        steps[2].Title.Should().Be("Test Transactions");
    }

    [Fact]
    public void Create_WithNullName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantOnboarding.Create(
            null!,
            OnboardingType.NewEmployee,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Onboarding name is required*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithNullTargetUserId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantOnboarding.Create(
            Name,
            OnboardingType.NewEmployee,
            null!,
            TargetUserEmail,
            TargetUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Target user ID is required*")
            .WithParameterName("targetUserId");
    }

    [Fact]
    public void Create_WithNullTargetUserEmail_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantOnboarding.Create(
            Name,
            OnboardingType.NewEmployee,
            TargetUserId,
            null!,
            TargetUserName,
            CreatedBy);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Target user email is required*")
            .WithParameterName("targetUserEmail");
    }

    [Fact]
    public void Create_WithNullCreatedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantOnboarding.Create(
            Name,
            OnboardingType.NewEmployee,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Creator is required*")
            .WithParameterName("createdBy");
    }

    [Fact]
    public void AddStep_ShouldAddStepAndUpdateTotalSteps()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        var initialStepCount = onboarding.TotalSteps;
        var newStep = OnboardingStep.Create(
            6,
            "Additional Training",
            "Extra training materials",
            StepType.Video,
            false,
            30);

        // Act
        onboarding.AddStep(newStep);

        // Assert
        onboarding.TotalSteps.Should().Be(initialStepCount + 1);
        onboarding.Steps.Should().Contain(newStep);
        onboarding.EstimatedDuration.Should().BeGreaterThan(TimeSpan.Zero);
    }

    [Fact]
    public void AddTask_ShouldAddTask()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        var task = OnboardingTask.Create(
            "Complete IT Setup",
            "Set up workstation and accounts",
            TaskPriority.High,
            DateTime.UtcNow.AddDays(2));

        // Act
        onboarding.AddTask(task);

        // Assert
        onboarding.Tasks.Should().Contain(task);
    }

    [Fact]
    public void Start_FromNotStarted_ShouldStartOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        onboarding.Start("manager@test.com");

        // Assert
        onboarding.Status.Should().Be(OnboardingStatus.InProgress);
        onboarding.StartedAt.Should().NotBeNull();
        onboarding.StartedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        onboarding.LastActivityAt.Should().NotBeNull();
        onboarding.ModifiedAt.Should().NotBeNull();
        onboarding.ModifiedBy.Should().Be("manager@test.com");
    }

    [Fact]
    public void Start_FromPaused_ShouldResumeOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        onboarding.Pause();

        // Act
        onboarding.Start();

        // Assert
        onboarding.Status.Should().Be(OnboardingStatus.InProgress);
        onboarding.ResumedAt.Should().NotBeNull();
        onboarding.PausedAt.Should().BeNull();
    }

    [Fact]
    public void Start_FromInProgress_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();

        // Act
        var action = () => onboarding.Start();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Onboarding can only be started from NotStarted or Paused status");
    }

    [Fact]
    public void CompleteStep_WithValidStep_ShouldCompleteStepAndUpdateProgress()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        var step = onboarding.Steps.First();

        // Act
        onboarding.CompleteStep(step.Id, "user@test.com");

        // Assert
        onboarding.CompletedSteps.Should().Be(1);
        onboarding.ProgressPercentage.Should().BeGreaterThan(0);
        onboarding.LastActivityAt.Should().NotBeNull();
        onboarding.ModifiedBy.Should().Be("user@test.com");
    }

    [Fact]
    public void CompleteStep_WithInvalidStepId_ShouldThrowArgumentException()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        var invalidStepId = Guid.NewGuid();

        // Act
        var action = () => onboarding.CompleteStep(invalidStepId);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Step not found*")
            .WithParameterName("stepId");
    }

    [Fact]
    public void CompleteStep_AllRequiredStepsCompleted_ShouldCompleteOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        var requiredSteps = onboarding.Steps.Where(s => s.IsRequired).ToList();

        // Act
        foreach (var step in requiredSteps)
        {
            onboarding.CompleteStep(step.Id);
        }

        // Assert
        onboarding.Status.Should().Be(OnboardingStatus.Completed);
        onboarding.CompletedAt.Should().NotBeNull();
        onboarding.ProgressPercentage.Should().Be(100);
    }

    [Fact]
    public void SkipStep_WithNonRequiredStep_ShouldSkipStep()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        var nonRequiredStep = onboarding.Steps.First(s => !s.IsRequired);
        var reason = "Not applicable";

        // Act
        onboarding.SkipStep(nonRequiredStep.Id, reason, "user@test.com");

        // Assert
        onboarding.SkippedSteps.Should().Be(1);
        onboarding.ProgressPercentage.Should().BeGreaterThan(0);
        onboarding.ModifiedBy.Should().Be("user@test.com");
    }

    [Fact]
    public void SkipStep_WithRequiredStepAndAllowSkipFalse_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        var requiredStep = onboarding.Steps.First(s => s.IsRequired);

        // Act
        var action = () => onboarding.SkipStep(requiredStep.Id, "reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot skip required step");
    }

    [Fact]
    public void SkipStep_WithRequiredStepAndAllowSkipTrue_ShouldSkipStep()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.SetConfiguration(
            allowSkip: true,
            sendReminders: false,
            reminderFrequencyDays: 3,
            requireManagerApproval: false,
            dueDate: null,
            "admin@test.com");
        onboarding.Start();
        var requiredStep = onboarding.Steps.First(s => s.IsRequired);

        // Act
        onboarding.SkipStep(requiredStep.Id, "Not needed", "user@test.com");

        // Assert
        onboarding.SkippedSteps.Should().Be(1);
    }

    [Fact]
    public void Pause_WhenInProgress_ShouldPauseOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();

        // Act
        onboarding.Pause("user@test.com");

        // Assert
        onboarding.Status.Should().Be(OnboardingStatus.Paused);
        onboarding.PausedAt.Should().NotBeNull();
        onboarding.ModifiedBy.Should().Be("user@test.com");
    }

    [Fact]
    public void Pause_WhenNotInProgress_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        var action = () => onboarding.Pause();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only pause in-progress onboarding");
    }

    [Fact]
    public void Resume_WhenPaused_ShouldResumeOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        onboarding.Pause();

        // Act
        onboarding.Resume("manager@test.com");

        // Assert
        onboarding.Status.Should().Be(OnboardingStatus.InProgress);
        onboarding.ResumedAt.Should().NotBeNull();
        onboarding.PausedAt.Should().BeNull();
        onboarding.LastActivityAt.Should().NotBeNull();
        onboarding.ModifiedBy.Should().Be("manager@test.com");
    }

    [Fact]
    public void Resume_WhenNotPaused_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        var action = () => onboarding.Resume();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only resume paused onboarding");
    }

    [Fact]
    public void Cancel_WithValidReason_ShouldCancelOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        var reason = "Employee left the company";

        // Act
        onboarding.Cancel(reason, "hr@test.com");

        // Assert
        onboarding.Status.Should().Be(OnboardingStatus.Cancelled);
        onboarding.CompletionFeedback.Should().Contain("Cancelled");
        onboarding.CompletionFeedback.Should().Contain(reason);
        onboarding.ModifiedBy.Should().Be("hr@test.com");
    }

    [Fact]
    public void Cancel_WhenCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        var requiredSteps = onboarding.Steps.Where(s => s.IsRequired).ToList();
        foreach (var step in requiredSteps)
        {
            onboarding.CompleteStep(step.Id);
        }

        // Act
        var action = () => onboarding.Cancel("reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot cancel completed or already cancelled onboarding");
    }

    [Fact]
    public void Complete_WithAllRequiredStepsCompleted_ShouldCompleteOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();
        var requiredSteps = onboarding.Steps.Where(s => s.IsRequired).ToList();
        foreach (var step in requiredSteps)
        {
            step.Complete();
        }

        // Act
        onboarding.Complete("system");

        // Assert
        onboarding.Status.Should().Be(OnboardingStatus.Completed);
        onboarding.CompletedAt.Should().NotBeNull();
        onboarding.ProgressPercentage.Should().Be(100);
        onboarding.ActualDuration.Should().BeGreaterThan(TimeSpan.Zero);
        onboarding.ModifiedBy.Should().Be("system");
    }

    [Fact]
    public void Complete_WithPendingRequiredSteps_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.Start();

        // Act
        var action = () => onboarding.Complete();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot complete onboarding with pending required steps");
    }

    [Fact]
    public void SetTargetDetails_ShouldUpdateTargetInformation()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        var targetRole = "Software Developer";
        var targetDepartment = "Engineering";
        var managerId = "manager123";
        var managerEmail = "manager@test.com";

        // Act
        onboarding.SetTargetDetails(
            targetRole,
            targetDepartment,
            managerId,
            managerEmail,
            "admin@test.com");

        // Assert
        onboarding.TargetRole.Should().Be(targetRole);
        onboarding.TargetDepartment.Should().Be(targetDepartment);
        onboarding.ManagerId.Should().Be(managerId);
        onboarding.ManagerEmail.Should().Be(managerEmail);
        onboarding.ModifiedBy.Should().Be("admin@test.com");
    }

    [Fact]
    public void SetConfiguration_ShouldUpdateConfiguration()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        var dueDate = DateTime.UtcNow.AddDays(30);

        // Act
        onboarding.SetConfiguration(
            allowSkip: true,
            sendReminders: true,
            reminderFrequencyDays: 5,
            requireManagerApproval: true,
            dueDate: dueDate,
            "admin@test.com");

        // Assert
        onboarding.AllowSkip.Should().BeTrue();
        onboarding.SendReminders.Should().BeTrue();
        onboarding.ReminderFrequencyDays.Should().Be(5);
        onboarding.RequireManagerApproval.Should().BeTrue();
        onboarding.DueDate.Should().Be(dueDate);
        onboarding.ModifiedBy.Should().Be("admin@test.com");
    }

    [Fact]
    public void RecordLogin_FirstLogin_ShouldAutoStartOnboarding()
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        onboarding.RecordLogin();

        // Assert
        onboarding.LoginCount.Should().Be(1);
        onboarding.FirstLoginAt.Should().NotBeNull();
        onboarding.LastLoginAt.Should().NotBeNull();
        onboarding.Status.Should().Be(OnboardingStatus.InProgress); // Auto-started
        onboarding.StartedAt.Should().NotBeNull();
    }

    [Fact]
    public void RecordLogin_SubsequentLogins_ShouldIncrementCount()
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        onboarding.RecordLogin();
        onboarding.RecordLogin();
        onboarding.RecordLogin();

        // Assert
        onboarding.LoginCount.Should().Be(3);
        onboarding.FirstLoginAt.Should().NotBeNull();
        onboarding.LastLoginAt.Should().NotBeNull();
    }

    [Fact]
    public void RecordHelpRequest_ShouldIncrementHelpRequestCount()
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        onboarding.RecordHelpRequest();
        onboarding.RecordHelpRequest();

        // Assert
        onboarding.HelpRequestCount.Should().Be(2);
        onboarding.LastActivityAt.Should().NotBeNull();
    }

    [Fact]
    public void SetCompletionDetails_WithValidData_ShouldSetDetails()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        var certificateUrl = "https://example.com/certificate.pdf";
        var score = 95.5m;
        var feedback = "Excellent performance";
        var satisfactionRating = 5;

        // Act
        onboarding.SetCompletionDetails(
            certificateUrl,
            score,
            feedback,
            satisfactionRating,
            "admin@test.com");

        // Assert
        onboarding.CompletionCertificateUrl.Should().Be(certificateUrl);
        onboarding.CompletionScore.Should().Be(score);
        onboarding.CompletionFeedback.Should().Be(feedback);
        onboarding.SatisfactionRating.Should().Be(satisfactionRating);
        onboarding.ModifiedBy.Should().Be("admin@test.com");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    public void SetCompletionDetails_WithInvalidSatisfactionRating_ShouldThrowArgumentException(int invalidRating)
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        var action = () => onboarding.SetCompletionDetails(
            null,
            null,
            null,
            invalidRating,
            "admin@test.com");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Satisfaction rating must be between 1 and 5*")
            .WithParameterName("satisfactionRating");
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(5)]
    public void SetCompletionDetails_WithValidSatisfactionRating_ShouldSetRating(int validRating)
    {
        // Arrange
        var onboarding = CreateOnboarding();

        // Act
        onboarding.SetCompletionDetails(
            null,
            null,
            null,
            validRating,
            "admin@test.com");

        // Assert
        onboarding.SatisfactionRating.Should().Be(validRating);
    }

    [Fact]
    public void IsOverdue_WithPastDueDate_ShouldReturnTrue()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.SetConfiguration(
            false,
            false,
            3,
            false,
            DateTime.UtcNow.AddDays(-1),
            "admin@test.com");

        // Act
        var result = onboarding.IsOverdue();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsOverdue_WithFutureDueDate_ShouldReturnFalse()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.SetConfiguration(
            false,
            false,
            3,
            false,
            DateTime.UtcNow.AddDays(7),
            "admin@test.com");

        // Act
        var result = onboarding.IsOverdue();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsOverdue_WhenCompleted_ShouldReturnFalse()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.SetConfiguration(
            false,
            false,
            3,
            false,
            DateTime.UtcNow.AddDays(-1),
            "admin@test.com");
        onboarding.Start();
        var requiredSteps = onboarding.Steps.Where(s => s.IsRequired).ToList();
        foreach (var step in requiredSteps)
        {
            onboarding.CompleteStep(step.Id);
        }

        // Act
        var result = onboarding.IsOverdue();

        // Assert
        result.Should().BeFalse(); // Completed, so not overdue
    }

    [Fact]
    public void NeedsReminder_WithInactivity_ShouldReturnTrue()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.SetConfiguration(
            false,
            true, // sendReminders = true
            1, // reminderFrequencyDays = 1
            false,
            null,
            "admin@test.com");
        onboarding.Start();
        
        // Manually set last activity to past
        var modifiedAtProperty = typeof(TenantOnboarding).GetProperty("LastActivityAt");
        modifiedAtProperty!.SetValue(onboarding, DateTime.UtcNow.AddDays(-2));

        // Act
        var result = onboarding.NeedsReminder();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void NeedsReminder_WithRecentActivity_ShouldReturnFalse()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.SetConfiguration(
            false,
            true,
            3,
            false,
            null,
            "admin@test.com");
        onboarding.Start();

        // Act
        var result = onboarding.NeedsReminder();

        // Assert
        result.Should().BeFalse(); // Just started, so recent activity
    }

    [Fact]
    public void NeedsReminder_WhenNotInProgress_ShouldReturnFalse()
    {
        // Arrange
        var onboarding = CreateOnboarding();
        onboarding.SetConfiguration(
            false,
            true,
            3,
            false,
            null,
            "admin@test.com");

        // Act
        var result = onboarding.NeedsReminder();

        // Assert
        result.Should().BeFalse(); // Not started yet
    }

    [Fact]
    public void CompleteOnboardingWorkflow_ShouldWorkCorrectly()
    {
        // Arrange
        var onboarding = TenantOnboarding.Create(
            "New Developer Onboarding",
            OnboardingType.NewEmployee,
            "dev123",
            "developer@company.com",
            "Jane Smith",
            CreatedBy,
            "Complete onboarding process for new developer",
            isRequired: true);
        
        // Act & Assert - Initial state
        onboarding.Status.Should().Be(OnboardingStatus.NotStarted);
        onboarding.Steps.Should().HaveCount(5);
        
        // Configure onboarding
        onboarding.SetTargetDetails(
            "Senior Developer",
            "Engineering",
            "mgr123",
            "manager@company.com",
            "hr@company.com");
        
        onboarding.SetConfiguration(
            allowSkip: false,
            sendReminders: true,
            reminderFrequencyDays: 2,
            requireManagerApproval: true,
            dueDate: DateTime.UtcNow.AddDays(14),
            "hr@company.com");
        
        // First login auto-starts
        onboarding.RecordLogin();
        onboarding.Status.Should().Be(OnboardingStatus.InProgress);
        onboarding.LoginCount.Should().Be(1);
        
        // Complete first few steps
        var steps = onboarding.Steps.ToList();
        onboarding.CompleteStep(steps[0].Id, "developer@company.com"); // Welcome
        onboarding.CompleteStep(steps[1].Id, "developer@company.com"); // Profile Setup
        onboarding.CompletedSteps.Should().Be(2);
        
        // Pause for lunch
        onboarding.Pause("developer@company.com");
        onboarding.Status.Should().Be(OnboardingStatus.Paused);
        
        // Resume after lunch
        onboarding.Resume("developer@company.com");
        onboarding.Status.Should().Be(OnboardingStatus.InProgress);
        
        // Complete required step
        onboarding.CompleteStep(steps[2].Id, "developer@company.com"); // Company Policies
        
        // Skip optional steps
        onboarding.SkipStep(steps[3].Id, "Will watch later", "developer@company.com"); // Training Videos
        onboarding.SkipStep(steps[4].Id, "Already familiar", "developer@company.com"); // System Tour
        
        // All required steps completed - auto-completes
        onboarding.Status.Should().Be(OnboardingStatus.Completed);
        onboarding.CompletedAt.Should().NotBeNull();
        onboarding.ProgressPercentage.Should().Be(100);
        
        // Set completion details
        onboarding.SetCompletionDetails(
            "https://company.com/certificates/dev123.pdf",
            98m,
            "Completed successfully with excellent engagement",
            5,
            "hr@company.com");
        
        onboarding.CompletionScore.Should().Be(98m);
        onboarding.SatisfactionRating.Should().Be(5);
        onboarding.IsOverdue().Should().BeFalse();
    }

    // OnboardingStep Tests
    [Fact]
    public void OnboardingStep_Create_ShouldCreateStep()
    {
        // Act
        var step = OnboardingStep.Create(
            1,
            "Welcome",
            "Introduction to the company",
            StepType.Information,
            true,
            10);

        // Assert
        step.Should().NotBeNull();
        step.Id.Should().NotBeEmpty();
        step.Order.Should().Be(1);
        step.Title.Should().Be("Welcome");
        step.Description.Should().Be("Introduction to the company");
        step.Type.Should().Be(StepType.Information);
        step.Status.Should().Be(StepStatus.Pending);
        step.IsRequired.Should().BeTrue();
        step.EstimatedDurationMinutes.Should().Be(10);
    }

    [Fact]
    public void OnboardingStep_Start_ShouldStartStep()
    {
        // Arrange
        var step = OnboardingStep.Create(1, "Test", null, StepType.Action, false);

        // Act
        step.Start();

        // Assert
        step.Status.Should().Be(StepStatus.InProgress);
        step.StartedAt.Should().NotBeNull();
    }

    [Fact]
    public void OnboardingStep_Complete_ShouldCompleteStep()
    {
        // Arrange
        var step = OnboardingStep.Create(1, "Test", null, StepType.Action, false);
        step.Start();

        // Act
        step.Complete("user@test.com");

        // Assert
        step.Status.Should().Be(StepStatus.Completed);
        step.CompletedAt.Should().NotBeNull();
        step.CompletedBy.Should().Be("user@test.com");
        step.ActualDurationMinutes.Should().BeGreaterThanOrEqualTo(0);
    }

    [Fact]
    public void OnboardingStep_Skip_NonRequiredStep_ShouldSkip()
    {
        // Arrange
        var step = OnboardingStep.Create(1, "Test", null, StepType.Action, false);

        // Act
        step.Skip("Not needed", "user@test.com");

        // Assert
        step.Status.Should().Be(StepStatus.Skipped);
        step.SkippedAt.Should().NotBeNull();
        step.SkipReason.Should().Be("Not needed");
        step.SkippedBy.Should().Be("user@test.com");
    }

    [Fact]
    public void OnboardingStep_Skip_RequiredStep_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var step = OnboardingStep.Create(1, "Test", null, StepType.Action, true);

        // Act
        var action = () => step.Skip("reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot skip required step");
    }

    // OnboardingTask Tests
    [Fact]
    public void OnboardingTask_Create_ShouldCreateTask()
    {
        // Act
        var task = OnboardingTask.Create(
            "Complete paperwork",
            "Fill out all required forms",
            TaskPriority.High,
            DateTime.UtcNow.AddDays(2));

        // Assert
        task.Should().NotBeNull();
        task.Id.Should().NotBeEmpty();
        task.Title.Should().Be("Complete paperwork");
        task.Description.Should().Be("Fill out all required forms");
        task.Status.Should().Be(Stocker.Domain.Tenant.Entities.TaskStatus.Todo);
        task.Priority.Should().Be(TaskPriority.High);
        task.DueDate.Should().NotBeNull();
    }

    [Fact]
    public void OnboardingTask_Assign_ShouldAssignTask()
    {
        // Arrange
        var task = OnboardingTask.Create("Test Task", null, TaskPriority.Medium);

        // Act
        task.Assign("user@test.com", "manager@test.com");

        // Assert
        task.AssignedTo.Should().Be("user@test.com");
        task.AssignedBy.Should().Be("manager@test.com");
        task.AssignedAt.Should().NotBeNull();
        task.Status.Should().Be(Stocker.Domain.Tenant.Entities.TaskStatus.Assigned);
    }

    [Fact]
    public void OnboardingTask_Start_ShouldStartTask()
    {
        // Arrange
        var task = OnboardingTask.Create("Test Task", null, TaskPriority.Medium);
        task.Assign("user@test.com", "manager@test.com");

        // Act
        task.Start();

        // Assert
        task.Status.Should().Be(Stocker.Domain.Tenant.Entities.TaskStatus.InProgress);
        task.StartedAt.Should().NotBeNull();
    }

    [Fact]
    public void OnboardingTask_Complete_ShouldCompleteTask()
    {
        // Arrange
        var task = OnboardingTask.Create("Test Task", null, TaskPriority.Medium);
        task.Start();
        var notes = "Task completed successfully";

        // Act
        task.Complete(notes);

        // Assert
        task.Status.Should().Be(Stocker.Domain.Tenant.Entities.TaskStatus.Completed);
        task.CompletedAt.Should().NotBeNull();
        task.CompletionNotes.Should().Be(notes);
    }

    private TenantOnboarding CreateOnboarding()
    {
        return TenantOnboarding.Create(
            Name,
            OnboardingType.NewEmployee,
            TargetUserId,
            TargetUserEmail,
            TargetUserName,
            CreatedBy,
            Description,
            isRequired: true);
    }
}