using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class SetupWizardTests
{
    private const string StartedBy = "admin@test.com";
    private const string CompletedBy = "user@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateWizardWithSteps()
    {
        // Act
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);

        // Assert
        wizard.Should().NotBeNull();
        wizard.Id.Should().NotBeEmpty();
        wizard.WizardType.Should().Be(WizardType.InitialSetup);
        wizard.Status.Should().Be(WizardStatus.NotStarted);
        wizard.StartedBy.Should().Be(StartedBy);
        wizard.StartedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        wizard.CompletedAt.Should().BeNull();
        wizard.CompletedBy.Should().BeNull();
        wizard.CurrentStepIndex.Should().Be(0);
        wizard.CompletedSteps.Should().Be(0);
        wizard.ProgressPercentage.Should().Be(0);
        wizard.LastActivityAt.Should().BeNull();
        wizard.LastModifiedBy.Should().BeNull();
        wizard.Steps.Should().NotBeEmpty();
        wizard.TotalSteps.Should().Be(wizard.Steps.Count);
    }

    [Theory]
    [InlineData(WizardType.InitialSetup, 6)]
    [InlineData(WizardType.ModuleSetup, 4)]
    [InlineData(WizardType.SecuritySetup, 4)]
    [InlineData(WizardType.IntegrationSetup, 3)] // Default steps
    [InlineData(WizardType.CustomizationSetup, 3)] // Default steps
    [InlineData(WizardType.DataImport, 3)] // Default steps
    public void Create_WithDifferentWizardTypes_ShouldCreateCorrectNumberOfSteps(WizardType wizardType, int expectedStepCount)
    {
        // Act
        var wizard = SetupWizard.Create(wizardType, StartedBy);

        // Assert
        wizard.WizardType.Should().Be(wizardType);
        wizard.Steps.Should().HaveCount(expectedStepCount);
        wizard.TotalSteps.Should().Be(expectedStepCount);
    }

    [Fact]
    public void Create_WithNullStartedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizard.Create(WizardType.InitialSetup, null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Started by cannot be empty.*")
            .WithParameterName("startedBy");
    }

    [Fact]
    public void Create_WithEmptyStartedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizard.Create(WizardType.InitialSetup, "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Started by cannot be empty.*")
            .WithParameterName("startedBy");
    }

    [Fact]
    public void Create_WithWhitespaceStartedBy_ShouldThrowArgumentException()
    {
        // Act
        var action = () => SetupWizard.Create(WizardType.InitialSetup, "   ");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Started by cannot be empty.*")
            .WithParameterName("startedBy");
    }

    [Fact]
    public void StartWizard_WhenNotStarted_ShouldChangeStatusAndMarkFirstStepAsCurrent()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);

        // Act
        wizard.StartWizard();

        // Assert
        wizard.Status.Should().Be(WizardStatus.InProgress);
        wizard.LastActivityAt.Should().NotBeNull();
        wizard.LastActivityAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        
        var firstStep = wizard.Steps.OrderBy(s => s.StepOrder).First();
        firstStep.Status.Should().Be(StepStatus.Current);
    }

    [Fact]
    public void StartWizard_WhenAlreadyStarted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();

        // Act
        var action = () => wizard.StartWizard();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Wizard has already been started.");
    }

    [Fact]
    public void CompleteCurrentStep_WithValidData_ShouldUpdateProgressAndMoveToNextStep()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();
        var stepData = "{\"companyName\":\"Test Corp\"}";

        // Act
        wizard.CompleteCurrentStep(CompletedBy, stepData);

        // Assert
        wizard.CompletedSteps.Should().Be(1);
        wizard.ProgressPercentage.Should().BeGreaterThan(0);
        wizard.CurrentStepIndex.Should().Be(1);
        wizard.LastActivityAt.Should().NotBeNull();
        wizard.LastModifiedBy.Should().Be(CompletedBy);
        
        // First step should be completed
        var firstStep = wizard.Steps.OrderBy(s => s.StepOrder).First();
        firstStep.Status.Should().Be(StepStatus.Completed);
        firstStep.CompletedBy.Should().Be(CompletedBy);
        firstStep.StepData.Should().Be(stepData);
        
        // Second step should be current
        var secondStep = wizard.Steps.OrderBy(s => s.StepOrder).Skip(1).First();
        secondStep.Status.Should().Be(StepStatus.Current);
    }

    [Fact]
    public void CompleteCurrentStep_WhenNotInProgress_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);

        // Act
        var action = () => wizard.CompleteCurrentStep(CompletedBy);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Wizard is not in progress.");
    }

    [Fact]
    public void CompleteCurrentStep_WhenLastStep_ShouldCompleteWizard()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.ModuleSetup, StartedBy);
        wizard.StartWizard();
        
        // Complete all steps except the last one
        for (int i = 0; i < wizard.TotalSteps - 1; i++)
        {
            wizard.CompleteCurrentStep(CompletedBy);
        }

        // Act - Complete the last step
        wizard.CompleteCurrentStep(CompletedBy);

        // Assert
        wizard.Status.Should().Be(WizardStatus.Completed);
        wizard.CompletedAt.Should().NotBeNull();
        wizard.CompletedBy.Should().Be(CompletedBy);
        wizard.ProgressPercentage.Should().Be(100);
        wizard.CompletedSteps.Should().Be(wizard.TotalSteps);
    }

    [Fact]
    public void SkipCurrentStep_WhenCanSkip_ShouldSkipAndMoveToNextStep()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();
        
        // Complete first two required steps
        wizard.CompleteCurrentStep(CompletedBy);
        wizard.CompleteCurrentStep(CompletedBy);
        
        // Current step should be "modules" which can be skipped
        var currentStep = wizard.Steps.First(s => s.Status == StepStatus.Current);
        currentStep.CanSkip.Should().BeTrue();
        
        var skipReason = "Not needed for this setup";

        // Act
        wizard.SkipCurrentStep(CompletedBy, skipReason);

        // Assert
        currentStep.Status.Should().Be(StepStatus.Skipped);
        currentStep.IsSkipped.Should().BeTrue();
        currentStep.SkipReason.Should().Be(skipReason);
        currentStep.SkippedBy.Should().Be(CompletedBy);
        
        wizard.LastActivityAt.Should().NotBeNull();
        wizard.LastModifiedBy.Should().Be(CompletedBy);
        wizard.CurrentStepIndex.Should().Be(3);
    }

    [Fact]
    public void SkipCurrentStep_WhenCannotSkip_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();
        
        // First step is required and cannot be skipped
        var currentStep = wizard.Steps.First(s => s.Status == StepStatus.Current);
        currentStep.CanSkip.Should().BeFalse();

        // Act
        var action = () => wizard.SkipCurrentStep(CompletedBy, "Trying to skip");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Current step cannot be skipped.");
    }

    [Fact]
    public void PauseWizard_WhenInProgress_ShouldChangeStatusToPaused()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();

        // Act
        wizard.PauseWizard();

        // Assert
        wizard.Status.Should().Be(WizardStatus.Paused);
        wizard.LastActivityAt.Should().NotBeNull();
    }

    [Fact]
    public void PauseWizard_WhenNotInProgress_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);

        // Act
        var action = () => wizard.PauseWizard();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only pause a wizard in progress.");
    }

    [Fact]
    public void ResumeWizard_WhenPaused_ShouldChangeStatusToInProgress()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();
        wizard.PauseWizard();

        // Act
        wizard.ResumeWizard();

        // Assert
        wizard.Status.Should().Be(WizardStatus.InProgress);
        wizard.LastActivityAt.Should().NotBeNull();
    }

    [Fact]
    public void ResumeWizard_WhenNotPaused_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();

        // Act
        var action = () => wizard.ResumeWizard();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only resume a paused wizard.");
    }

    [Fact]
    public void CancelWizard_ShouldChangeStatusAndMarkIncompleteStepsAsCancelled()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();
        wizard.CompleteCurrentStep(CompletedBy); // Complete first step
        
        var cancelReason = "User cancelled the setup";

        // Act
        wizard.CancelWizard(CompletedBy, cancelReason);

        // Assert
        wizard.Status.Should().Be(WizardStatus.Cancelled);
        wizard.CompletedAt.Should().NotBeNull();
        wizard.LastModifiedBy.Should().Be(CompletedBy);
        
        // Check that incomplete steps are cancelled
        var incompleteSteps = wizard.Steps.Where(s => s.Status == StepStatus.Cancelled);
        incompleteSteps.Should().NotBeEmpty();
    }

    [Fact]
    public void InitialSetupWizard_ShouldHaveCorrectSteps()
    {
        // Act
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);

        // Assert
        wizard.Steps.Should().HaveCount(6);
        
        var steps = wizard.Steps.OrderBy(s => s.StepOrder).ToList();
        
        steps[0].Name.Should().Be("company_info");
        steps[0].Title.Should().Be("Şirket Bilgileri");
        steps[0].IsRequired.Should().BeTrue();
        steps[0].CanSkip.Should().BeFalse();
        
        steps[1].Name.Should().Be("users");
        steps[1].IsRequired.Should().BeTrue();
        
        steps[2].Name.Should().Be("modules");
        steps[2].IsRequired.Should().BeFalse();
        steps[2].CanSkip.Should().BeTrue();
        
        steps[3].Name.Should().Be("security");
        steps[3].IsRequired.Should().BeFalse();
        steps[3].CanSkip.Should().BeTrue();
        
        steps[4].Name.Should().Be("integrations");
        steps[4].IsRequired.Should().BeFalse();
        steps[4].CanSkip.Should().BeTrue();
        
        steps[5].Name.Should().Be("completed");
        steps[5].Category.Should().Be(StepCategory.Review);
    }

    [Fact]
    public void ModuleSetupWizard_ShouldHaveCorrectSteps()
    {
        // Act
        var wizard = SetupWizard.Create(WizardType.ModuleSetup, StartedBy);

        // Assert
        wizard.Steps.Should().HaveCount(4);
        
        var steps = wizard.Steps.OrderBy(s => s.StepOrder).ToList();
        
        steps[0].Name.Should().Be("module_selection");
        steps[0].IsRequired.Should().BeTrue();
        
        steps[1].Name.Should().Be("module_config");
        steps[1].IsRequired.Should().BeTrue();
        
        steps[2].Name.Should().Be("permissions");
        steps[2].IsRequired.Should().BeTrue();
        
        steps[3].Name.Should().Be("completed");
        steps[3].Category.Should().Be(StepCategory.Review);
    }

    [Fact]
    public void SecuritySetupWizard_ShouldHaveCorrectSteps()
    {
        // Act
        var wizard = SetupWizard.Create(WizardType.SecuritySetup, StartedBy);

        // Assert
        wizard.Steps.Should().HaveCount(4);
        
        var steps = wizard.Steps.OrderBy(s => s.StepOrder).ToList();
        
        steps[0].Name.Should().Be("two_factor");
        steps[0].IsRequired.Should().BeTrue();
        
        steps[1].Name.Should().Be("ip_restriction");
        steps[1].IsRequired.Should().BeFalse();
        steps[1].CanSkip.Should().BeTrue();
        
        steps[2].Name.Should().Be("password_policy");
        steps[2].IsRequired.Should().BeTrue();
        
        steps[3].Name.Should().Be("completed");
    }

    [Fact]
    public void CompleteWizardWithSkippedOptionalSteps_ShouldCompleteSuccessfully()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        wizard.StartWizard();
        
        // Complete required steps
        wizard.CompleteCurrentStep(CompletedBy); // company_info
        wizard.CompleteCurrentStep(CompletedBy); // users
        
        // Skip optional steps
        wizard.SkipCurrentStep(CompletedBy, "Not needed"); // modules
        wizard.SkipCurrentStep(CompletedBy, "Not needed"); // security
        wizard.SkipCurrentStep(CompletedBy, "Not needed"); // integrations
        
        // Complete final step
        wizard.CompleteCurrentStep(CompletedBy); // completed

        // Assert
        wizard.Status.Should().Be(WizardStatus.Completed);
        wizard.CompletedSteps.Should().Be(3); // Only completed steps count
        wizard.ProgressPercentage.Should().Be(100);
    }

    [Fact]
    public void ProgressPercentage_ShouldCalculateCorrectly()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.ModuleSetup, StartedBy);
        wizard.StartWizard();

        // Act & Assert
        wizard.ProgressPercentage.Should().Be(0);
        
        wizard.CompleteCurrentStep(CompletedBy);
        wizard.ProgressPercentage.Should().Be(25); // 1/4 = 25%
        
        wizard.CompleteCurrentStep(CompletedBy);
        wizard.ProgressPercentage.Should().Be(50); // 2/4 = 50%
        
        wizard.CompleteCurrentStep(CompletedBy);
        wizard.ProgressPercentage.Should().Be(75); // 3/4 = 75%
        
        wizard.CompleteCurrentStep(CompletedBy);
        wizard.ProgressPercentage.Should().Be(100); // 4/4 = 100%
    }

    [Fact]
    public void WizardWorkflow_FullScenario_ShouldWorkCorrectly()
    {
        // Arrange
        var wizard = SetupWizard.Create(WizardType.InitialSetup, StartedBy);
        
        // Act & Assert - Start wizard
        wizard.StartWizard();
        wizard.Status.Should().Be(WizardStatus.InProgress);
        
        // Complete first step
        wizard.CompleteCurrentStep(CompletedBy, "{\"company\":\"Test Corp\"}");
        wizard.CompletedSteps.Should().Be(1);
        
        // Pause and resume
        wizard.PauseWizard();
        wizard.Status.Should().Be(WizardStatus.Paused);
        
        wizard.ResumeWizard();
        wizard.Status.Should().Be(WizardStatus.InProgress);
        
        // Complete second step
        wizard.CompleteCurrentStep(CompletedBy, "{\"users\":[\"admin\",\"user1\"]}");
        wizard.CompletedSteps.Should().Be(2);
        
        // Skip optional steps
        wizard.SkipCurrentStep(CompletedBy, "Will configure later");
        wizard.SkipCurrentStep(CompletedBy, "Will configure later");
        wizard.SkipCurrentStep(CompletedBy, "No integrations needed");
        
        // Complete final step
        wizard.CompleteCurrentStep(CompletedBy);
        
        // Verify final state
        wizard.Status.Should().Be(WizardStatus.Completed);
        wizard.CompletedAt.Should().NotBeNull();
        wizard.CompletedBy.Should().Be(CompletedBy);
        wizard.ProgressPercentage.Should().Be(100);
    }
}