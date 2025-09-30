using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class SetupWizardStepTests
{
    private readonly Guid _wizardId = Guid.NewGuid();
    private const string StepName = "company_info";
    private const string StepTitle = "Company Information";
    private const string StepDescription = "Enter company details";
    private const string StartedBy = "admin@test.com";
    private const string CompletedBy = "user@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateStep()
    {
        // Act
        var step = SetupWizardStep.Create(
            _wizardId,
            0,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        step.Should().NotBeNull();
        step.Id.Should().NotBeEmpty();
        step.WizardId.Should().Be(_wizardId);
        step.StepOrder.Should().Be(0);
        step.Name.Should().Be(StepName);
        step.Title.Should().Be(StepTitle);
        step.Description.Should().Be(StepDescription);
        step.Category.Should().Be(StepCategory.Required);
        step.Status.Should().Be(StepStatus.Pending);
        step.IsRequired.Should().BeTrue();
        step.CanSkip.Should().BeFalse();
        step.IsSkipped.Should().BeFalse();
        step.StepData.Should().BeNull();
        step.ValidationErrors.Should().BeNull();
        step.StartedAt.Should().BeNull();
        step.CompletedAt.Should().BeNull();
        step.Duration.Should().BeNull();
    }

    [Fact]
    public void Create_WithEmptyWizardId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizardStep.Create(
            Guid.Empty,
            0,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Wizard ID cannot be empty.*")
            .WithParameterName("wizardId");
    }

    [Fact]
    public void Create_WithNullName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizardStep.Create(
            _wizardId,
            0,
            null!,
            StepTitle,
            StepDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Step name cannot be empty.*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizardStep.Create(
            _wizardId,
            0,
            "",
            StepTitle,
            StepDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Step name cannot be empty.*")
            .WithParameterName("name");
    }

    [Fact]
    public void Create_WithNullTitle_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizardStep.Create(
            _wizardId,
            0,
            StepName,
            null!,
            StepDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Step title cannot be empty.*")
            .WithParameterName("title");
    }

    [Fact]
    public void Create_WithNegativeStepOrder_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizardStep.Create(
            _wizardId,
            -1,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Step order must be non-negative.*")
            .WithParameterName("stepOrder");
    }

    [Fact]
    public void MarkAsCurrent_WhenPending_ShouldChangeStatusToCurrent()
    {
        // Arrange
        var step = CreateStep();

        // Act
        step.MarkAsCurrent();

        // Assert
        step.Status.Should().Be(StepStatus.Current);
        step.StartedAt.Should().NotBeNull();
        step.StartedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkAsCurrent_WhenNotPending_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();

        // Act
        var action = () => step.MarkAsCurrent();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot mark step as current. Current status: Current");
    }

    [Fact]
    public void Start_WhenPendingOrCurrent_ShouldChangeStatusToInProgress()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();

        // Act
        step.Start(StartedBy);

        // Assert
        step.Status.Should().Be(StepStatus.InProgress);
        step.StartedAt.Should().NotBeNull();
        step.StartedBy.Should().Be(StartedBy);
    }

    [Fact]
    public void Start_WhenCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.Complete(CompletedBy);

        // Act
        var action = () => step.Start(StartedBy);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot start step. Current status: Completed");
    }

    [Fact]
    public void Complete_WhenCurrent_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        var stepData = "{\"company\":\"Test Corp\"}";

        // Act
        step.Complete(CompletedBy, stepData);

        // Assert
        step.Status.Should().Be(StepStatus.Completed);
        step.CompletedAt.Should().NotBeNull();
        step.CompletedBy.Should().Be(CompletedBy);
        step.StepData.Should().Be(stepData);
        step.Duration.Should().NotBeNull();
        step.Duration.Should().BeGreaterThanOrEqualTo(TimeSpan.Zero);
    }

    [Fact]
    public void Complete_WhenInProgress_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.Start(StartedBy);

        // Act
        step.Complete(CompletedBy);

        // Assert
        step.Status.Should().Be(StepStatus.Completed);
        step.CompletedAt.Should().NotBeNull();
        step.CompletedBy.Should().Be(CompletedBy);
        step.Duration.Should().NotBeNull();
    }

    [Fact]
    public void Complete_WhenPending_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var step = CreateStep();

        // Act
        var action = () => step.Complete(CompletedBy);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot complete step. Current status: Pending");
    }

    [Fact]
    public void Skip_WhenCanSkipAndCurrent_ShouldChangeStatusToSkipped()
    {
        // Arrange
        var step = SetupWizardStep.Create(
            _wizardId,
            0,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Optional,
            false,
            true); // Can skip
        step.MarkAsCurrent();
        var skipReason = "Not needed for this setup";

        // Act
        step.Skip(CompletedBy, skipReason);

        // Assert
        step.Status.Should().Be(StepStatus.Skipped);
        step.IsSkipped.Should().BeTrue();
        step.SkipReason.Should().Be(skipReason);
        step.SkippedBy.Should().Be(CompletedBy);
        step.SkippedAt.Should().NotBeNull();
        step.SkippedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Skip_WhenCannotSkip_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var step = CreateStep(); // Cannot skip by default
        step.MarkAsCurrent();

        // Act
        var action = () => step.Skip(CompletedBy, "Trying to skip");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("This step cannot be skipped.");
    }

    [Fact]
    public void Skip_WhenCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var step = SetupWizardStep.Create(
            _wizardId,
            0,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Optional,
            false,
            true); // Can skip
        step.MarkAsCurrent();
        step.Complete(CompletedBy);

        // Act
        var action = () => step.Skip(CompletedBy, "Trying to skip");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot skip step. Current status: Completed");
    }

    [Fact]
    public void Cancel_WhenPending_ShouldChangeStatusToCancelled()
    {
        // Arrange
        var step = CreateStep();
        var cancelReason = "Wizard cancelled";

        // Act
        step.Cancel(cancelReason);

        // Assert
        step.Status.Should().Be(StepStatus.Cancelled);
        step.SkipReason.Should().Be(cancelReason);
    }

    [Fact]
    public void Cancel_WhenCompleted_ShouldNotChangeStatus()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.Complete(CompletedBy);

        // Act
        step.Cancel("Trying to cancel");

        // Assert
        step.Status.Should().Be(StepStatus.Completed); // Should remain completed
    }

    [Fact]
    public void Cancel_WhenSkipped_ShouldNotChangeStatus()
    {
        // Arrange
        var step = SetupWizardStep.Create(
            _wizardId,
            0,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Optional,
            false,
            true); // Can skip
        step.MarkAsCurrent();
        step.Skip(CompletedBy, "Skipping");

        // Act
        step.Cancel("Trying to cancel");

        // Assert
        step.Status.Should().Be(StepStatus.Skipped); // Should remain skipped
    }

    [Fact]
    public void UpdateData_WhenInProgress_ShouldUpdateStepData()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.Start(StartedBy);
        var newData = "{\"updated\":true}";

        // Act
        step.UpdateData(newData);

        // Assert
        step.StepData.Should().Be(newData);
    }

    [Fact]
    public void UpdateData_WhenCurrent_ShouldUpdateStepData()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        var newData = "{\"updated\":true}";

        // Act
        step.UpdateData(newData);

        // Assert
        step.StepData.Should().Be(newData);
    }

    [Fact]
    public void UpdateData_WhenCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.Complete(CompletedBy);

        // Act
        var action = () => step.UpdateData("{\"data\":\"test\"}");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only update data for active steps.");
    }

    [Fact]
    public void SetValidationErrors_ShouldSetErrorsAndChangeStatusToError()
    {
        // Arrange
        var step = CreateStep();
        var errors = "[\"Field is required\", \"Invalid format\"]";

        // Act
        step.SetValidationErrors(errors);

        // Assert
        step.ValidationErrors.Should().Be(errors);
        step.Status.Should().Be(StepStatus.Error);
    }

    [Fact]
    public void ClearValidationErrors_WhenError_ShouldClearErrorsAndRestoreStatus()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.Start(StartedBy);
        step.SetValidationErrors("[\"Error\"]");

        // Act
        step.ClearValidationErrors();

        // Assert
        step.ValidationErrors.Should().BeNull();
        step.Status.Should().Be(StepStatus.InProgress); // Should restore to InProgress since it was started
    }

    [Fact]
    public void ClearValidationErrors_WhenErrorAndNotStarted_ShouldRestoreToCurrent()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.SetValidationErrors("[\"Error\"]");

        // Act
        step.ClearValidationErrors();

        // Assert
        step.ValidationErrors.Should().BeNull();
        step.Status.Should().Be(StepStatus.Current); // Should restore to Current since it wasn't started
    }

    [Fact]
    public void ResetStep_ShouldResetAllProperties()
    {
        // Arrange
        var step = CreateStep();
        step.MarkAsCurrent();
        step.Start(StartedBy);
        step.UpdateData("{\"data\":\"test\"}");
        step.SetValidationErrors("[\"Error\"]");

        // Act
        step.ResetStep();

        // Assert
        step.Status.Should().Be(StepStatus.Pending);
        step.StartedAt.Should().BeNull();
        step.StartedBy.Should().BeNull();
        step.CompletedAt.Should().BeNull();
        step.CompletedBy.Should().BeNull();
        step.Duration.Should().BeNull();
        step.StepData.Should().BeNull();
        step.ValidationErrors.Should().BeNull();
        step.IsSkipped.Should().BeFalse();
        step.SkipReason.Should().BeNull();
        step.SkippedBy.Should().BeNull();
        step.SkippedAt.Should().BeNull();
    }

    [Theory]
    [InlineData(StepCategory.Required, true, false)]
    [InlineData(StepCategory.Recommended, false, true)]
    [InlineData(StepCategory.Optional, false, true)]
    [InlineData(StepCategory.Review, false, false)]
    public void Create_WithDifferentCategories_ShouldSetCorrectDefaults(StepCategory category, bool expectedRequired, bool expectedCanSkip)
    {
        // Act
        var step = SetupWizardStep.Create(
            _wizardId,
            0,
            StepName,
            StepTitle,
            StepDescription,
            category,
            expectedRequired,
            expectedCanSkip);

        // Assert
        step.Category.Should().Be(category);
        step.IsRequired.Should().Be(expectedRequired);
        step.CanSkip.Should().Be(expectedCanSkip);
    }

    [Fact]
    public void StepWorkflow_FullScenario_ShouldWorkCorrectly()
    {
        // Arrange
        var step = CreateStep();
        
        // Act & Assert - Mark as current
        step.MarkAsCurrent();
        step.Status.Should().Be(StepStatus.Current);
        
        // Start the step
        step.Start(StartedBy);
        step.Status.Should().Be(StepStatus.InProgress);
        step.StartedBy.Should().Be(StartedBy);
        
        // Update data
        step.UpdateData("{\"progress\":\"50%\"}");
        step.StepData.Should().Contain("50%");
        
        // Set validation error
        step.SetValidationErrors("[\"Missing field\"]");
        step.Status.Should().Be(StepStatus.Error);
        
        // Clear validation error
        step.ClearValidationErrors();
        step.Status.Should().Be(StepStatus.InProgress);
        
        // Update data again
        step.UpdateData("{\"progress\":\"100%\"}");
        
        // Complete the step
        step.Complete(CompletedBy, "{\"final\":true}");
        step.Status.Should().Be(StepStatus.Completed);
        step.CompletedBy.Should().Be(CompletedBy);
        step.Duration.Should().NotBeNull();
    }

    [Fact]
    public void Create_WithLargeStepOrder_ShouldCreateStep()
    {
        // Act
        var step = SetupWizardStep.Create(
            _wizardId,
            9999,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        step.StepOrder.Should().Be(9999);
    }

    [Fact]
    public void Create_WithLongStrings_ShouldCreateStep()
    {
        // Arrange
        var longName = new string('A', 500);
        var longTitle = new string('B', 1000);
        var longDescription = new string('C', 5000);

        // Act
        var step = SetupWizardStep.Create(
            _wizardId,
            0,
            longName,
            longTitle,
            longDescription,
            StepCategory.Required,
            true,
            false);

        // Assert
        step.Name.Should().Be(longName);
        step.Title.Should().Be(longTitle);
        step.Description.Should().Be(longDescription);
    }

    private SetupWizardStep CreateStep()
    {
        return SetupWizardStep.Create(
            _wizardId,
            0,
            StepName,
            StepTitle,
            StepDescription,
            StepCategory.Required,
            true,
            false);
    }
}