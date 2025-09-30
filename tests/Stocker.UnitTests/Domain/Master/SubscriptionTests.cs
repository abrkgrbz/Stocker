using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.Domain.Master.Events;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class SubscriptionTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _packageId = Guid.NewGuid();
    private readonly BillingCycle _billingCycle = BillingCycle.Aylik;
    private readonly Money _price = Money.Create(1000m, "TRY");
    private readonly DateTime _startDate = DateTime.UtcNow;

    [Fact]
    public void Create_WithValidData_ShouldCreateSubscription()
    {
        // Act
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            _billingCycle,
            _price,
            _startDate);

        // Assert
        subscription.Should().NotBeNull();
        subscription.TenantId.Should().Be(_tenantId);
        subscription.PackageId.Should().Be(_packageId);
        subscription.BillingCycle.Should().Be(_billingCycle);
        subscription.Price.Should().Be(_price);
        subscription.StartDate.Should().BeCloseTo(_startDate, TimeSpan.FromSeconds(1));
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);
        subscription.AutoRenew.Should().BeTrue();
        subscription.UserCount.Should().Be(1);
        subscription.SubscriptionNumber.Should().StartWith("SUB-");
        subscription.Modules.Should().BeEmpty();
        subscription.Usages.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithTrialPeriod_ShouldCreateTrialSubscription()
    {
        // Arrange
        var trialEndDate = _startDate.AddDays(30);

        // Act
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            _billingCycle,
            _price,
            _startDate,
            trialEndDate);

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Deneme);
        subscription.TrialEndDate.Should().Be(trialEndDate);
        subscription.CurrentPeriodEnd.Should().BeCloseTo(
            _startDate.AddMonths(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void Create_WithInvalidTrialEndDate_ShouldThrowArgumentException()
    {
        // Arrange
        var invalidTrialEndDate = _startDate.AddDays(-1);

        // Act
        var action = () => Subscription.Create(
            _tenantId,
            _packageId,
            _billingCycle,
            _price,
            _startDate,
            invalidTrialEndDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Trial end date must be after start date.*");
    }

    [Fact]
    public void StartTrial_FromSuspended_ShouldStartTrial()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Suspend("Payment issue");
        var trialEndDate = DateTime.UtcNow.AddDays(14);

        // Act
        subscription.StartTrial(trialEndDate);

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Deneme);
        subscription.TrialEndDate.Should().Be(trialEndDate);
        subscription.CurrentPeriodEnd.Should().Be(trialEndDate);
    }

    [Fact]
    public void StartTrial_FromActiveStatus_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();
        var trialEndDate = DateTime.UtcNow.AddDays(14);

        // Act
        var action = () => subscription.StartTrial(trialEndDate);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Can only start trial from Suspended or Pending status.");
    }

    [Fact]
    public void StartTrial_WithPastDate_ShouldThrowArgumentException()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Suspend("Payment issue");
        var pastDate = DateTime.UtcNow.AddDays(-1);

        // Act
        var action = () => subscription.StartTrial(pastDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Trial end date must be in the future.*");
    }

    [Fact]
    public void Activate_TrialSubscription_ShouldActivate()
    {
        // Arrange
        var trialEndDate = _startDate.AddDays(30);
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            _billingCycle,
            _price,
            _startDate,
            trialEndDate);

        // Act
        subscription.Activate();

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);
        subscription.DomainEvents.Should().ContainSingle(e => e is SubscriptionActivatedDomainEvent);
    }

    [Fact]
    public void Activate_NonTrialSubscription_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        var action = () => subscription.Activate();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only trial subscriptions can be activated.");
    }

    [Fact]
    public void Suspend_ActiveSubscription_ShouldSuspend()
    {
        // Arrange
        var subscription = CreateSubscription();
        var reason = "Payment failed";

        // Act
        subscription.Suspend(reason);

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Askida);
        subscription.DomainEvents.Should().ContainSingle(e => e is SubscriptionSuspendedDomainEvent);
    }

    [Fact]
    public void Suspend_CancelledSubscription_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Cancel("User request");

        // Act
        var action = () => subscription.Suspend("Payment issue");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot suspend cancelled or expired subscriptions.");
    }

    [Fact]
    public void Reactivate_SuspendedSubscription_ShouldReactivate()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Suspend("Payment issue");

        // Act
        subscription.Reactivate();

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);
        subscription.DomainEvents.Should().ContainSingle(e => e is SubscriptionReactivatedDomainEvent);
    }

    [Fact]
    public void Reactivate_PastDueSubscription_ShouldReactivate()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.MarkAsPastDue();

        // Act
        subscription.Reactivate();

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);
    }

    [Fact]
    public void Reactivate_ActiveSubscription_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        var action = () => subscription.Reactivate();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only suspended or past due subscriptions can be reactivated.");
    }

    [Fact]
    public void Cancel_ActiveSubscription_ShouldCancel()
    {
        // Arrange
        var subscription = CreateSubscription();
        var reason = "Customer request";

        // Act
        subscription.Cancel(reason);

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.IptalEdildi);
        subscription.CancelledAt.Should().NotBeNull();
        subscription.CancellationReason.Should().Be(reason);
        subscription.AutoRenew.Should().BeFalse();
        subscription.DomainEvents.Should().ContainSingle(e => e is SubscriptionCancelledDomainEvent);
    }

    [Fact]
    public void Cancel_AlreadyCancelled_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Cancel("First cancellation");

        // Act
        var action = () => subscription.Cancel("Second cancellation");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Subscription is already cancelled or expired.");
    }

    [Fact]
    public void MarkAsPastDue_ActiveSubscription_ShouldMarkAsPastDue()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        subscription.MarkAsPastDue();

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.OdemesiGecikti);
    }

    [Fact]
    public void MarkAsPastDue_NonActiveSubscription_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Suspend("Payment issue");

        // Act
        var action = () => subscription.MarkAsPastDue();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only active subscriptions can be marked as past due.");
    }

    [Fact]
    public void Expire_ActiveSubscription_ShouldExpire()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        subscription.Expire();

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.SuresiDoldu);
        subscription.AutoRenew.Should().BeFalse();
        subscription.DomainEvents.Should().ContainSingle(e => e is SubscriptionExpiredDomainEvent);
    }

    [Fact]
    public void Expire_AlreadyExpired_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Expire();

        // Act
        var action = () => subscription.Expire();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Subscription is already expired.");
    }

    [Fact]
    public void Renew_ActiveSubscription_ShouldRenew()
    {
        // Arrange
        var subscription = CreateSubscription();
        var originalPeriodEnd = subscription.CurrentPeriodEnd;

        // Act
        subscription.Renew();

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);
        subscription.CurrentPeriodStart.Should().Be(originalPeriodEnd);
        subscription.CurrentPeriodEnd.Should().BeAfter(originalPeriodEnd);
        subscription.DomainEvents.Should().ContainSingle(e => e is SubscriptionRenewedDomainEvent);
    }

    [Fact]
    public void Renew_PastDueSubscription_ShouldRenew()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.MarkAsPastDue();

        // Act
        subscription.Renew();

        // Assert
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);
    }

    [Fact]
    public void Renew_CancelledSubscription_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Cancel("User request");

        // Act
        var action = () => subscription.Renew();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only active or past due subscriptions can be renewed.");
    }

    [Fact]
    public void UpdateBillingCycle_ShouldUpdateCycleAndPrice()
    {
        // Arrange
        var subscription = CreateSubscription();
        var newCycle = BillingCycle.Yillik;
        var newPrice = Money.Create(10000m, "TRY");
        var originalPeriodStart = subscription.CurrentPeriodStart;

        // Act
        subscription.UpdateBillingCycle(newCycle, newPrice);

        // Assert
        subscription.BillingCycle.Should().Be(newCycle);
        subscription.Price.Should().Be(newPrice);
        subscription.CurrentPeriodEnd.Should().BeCloseTo(
            originalPeriodStart.AddYears(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetAutoRenew_ShouldUpdateAutoRenewFlag()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        subscription.SetAutoRenew(false);

        // Assert
        subscription.AutoRenew.Should().BeFalse();
    }

    [Fact]
    public void UpdateUserCount_WithValidCount_ShouldUpdate()
    {
        // Arrange
        var subscription = CreateSubscription();
        var newCount = 10;

        // Act
        subscription.UpdateUserCount(newCount);

        // Assert
        subscription.UserCount.Should().Be(newCount);
    }

    [Fact]
    public void UpdateUserCount_WithZero_ShouldThrowArgumentException()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        var action = () => subscription.UpdateUserCount(0);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("User count must be greater than zero.*");
    }

    [Fact]
    public void AddModule_NewModule_ShouldAdd()
    {
        // Arrange
        var subscription = CreateSubscription();
        var moduleCode = "CRM";
        var moduleName = "Customer Relationship Management";

        // Act
        subscription.AddModule(moduleCode, moduleName, 1000);

        // Assert
        subscription.Modules.Should().HaveCount(1);
        var module = subscription.Modules.First();
        module.ModuleCode.Should().Be(moduleCode);
        module.ModuleName.Should().Be(moduleName);
    }

    [Fact]
    public void AddModule_DuplicateModule_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();
        var moduleCode = "CRM";
        subscription.AddModule(moduleCode, "CRM Module");

        // Act
        var action = () => subscription.AddModule(moduleCode, "Another Module");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Module '{moduleCode}' already exists in this subscription.");
    }

    [Fact]
    public void RemoveModule_ExistingModule_ShouldRemove()
    {
        // Arrange
        var subscription = CreateSubscription();
        var moduleCode = "CRM";
        subscription.AddModule(moduleCode, "CRM Module");

        // Act
        subscription.RemoveModule(moduleCode);

        // Assert
        subscription.Modules.Should().BeEmpty();
    }

    [Fact]
    public void RemoveModule_NonExistingModule_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        var action = () => subscription.RemoveModule("NON_EXISTING");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Module 'NON_EXISTING' not found in this subscription.");
    }

    [Fact]
    public void RecordUsage_ShouldAddUsageRecord()
    {
        // Arrange
        var subscription = CreateSubscription();
        var metricName = "API Calls";
        var value = 100;
        var recordedAt = DateTime.UtcNow;

        // Act
        subscription.RecordUsage(metricName, value, recordedAt);

        // Assert
        subscription.Usages.Should().HaveCount(1);
        var usage = subscription.Usages.First();
        usage.MetricName.Should().Be(metricName);
        usage.Value.Should().Be(value);
        usage.RecordedAt.Should().BeCloseTo(recordedAt, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void IsInTrial_TrialNotExpired_ShouldReturnTrue()
    {
        // Arrange
        var trialEndDate = DateTime.UtcNow.AddDays(30);
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            _billingCycle,
            _price,
            _startDate,
            trialEndDate);

        // Act
        var result = subscription.IsInTrial();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsInTrial_NotTrialStatus_ShouldReturnFalse()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        var result = subscription.IsInTrial();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_ExpiredStatus_ShouldReturnTrue()
    {
        // Arrange
        var subscription = CreateSubscription();
        subscription.Expire();

        // Act
        var result = subscription.IsExpired();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void IsExpired_ActiveStatus_ShouldReturnFalse()
    {
        // Arrange
        var subscription = CreateSubscription();

        // Act
        var result = subscription.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void BillingCycleCalculation_Monthly_ShouldAddOneMonth()
    {
        // Act
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            BillingCycle.Aylik,
            _price,
            _startDate);

        // Assert
        subscription.CurrentPeriodEnd.Should().BeCloseTo(
            _startDate.AddMonths(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void BillingCycleCalculation_Quarterly_ShouldAddThreeMonths()
    {
        // Act
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            BillingCycle.UcAylik,
            _price,
            _startDate);

        // Assert
        subscription.CurrentPeriodEnd.Should().BeCloseTo(
            _startDate.AddMonths(3), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void BillingCycleCalculation_SemiAnnual_ShouldAddSixMonths()
    {
        // Act
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            BillingCycle.AltiAylik,
            _price,
            _startDate);

        // Assert
        subscription.CurrentPeriodEnd.Should().BeCloseTo(
            _startDate.AddMonths(6), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void BillingCycleCalculation_Annual_ShouldAddOneYear()
    {
        // Act
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            BillingCycle.Yillik,
            _price,
            _startDate);

        // Assert
        subscription.CurrentPeriodEnd.Should().BeCloseTo(
            _startDate.AddYears(1), TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SubscriptionNumber_ShouldFollowFormat()
    {
        // Act
        var subscription = CreateSubscription();

        // Assert
        subscription.SubscriptionNumber.Should().MatchRegex(@"^SUB-\d{8}-[A-Z0-9]{8}$");
    }

    [Fact]
    public void CompleteWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var trialEndDate = DateTime.UtcNow.AddDays(14);
        var subscription = Subscription.Create(
            _tenantId,
            _packageId,
            BillingCycle.Aylik,
            _price,
            DateTime.UtcNow,
            trialEndDate);

        // Verify trial status
        subscription.IsInTrial().Should().BeTrue();

        // Activate after trial
        subscription.Activate();
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);

        // Add module
        subscription.AddModule("CRM", "Customer Management", 1000);
        subscription.Modules.Should().HaveCount(1);

        // Record usage
        subscription.RecordUsage("API Calls", 500, DateTime.UtcNow);
        subscription.Usages.Should().HaveCount(1);

        // Update billing
        subscription.UpdateBillingCycle(BillingCycle.Yillik, Money.Create(10000m, "TRY"));
        subscription.BillingCycle.Should().Be(BillingCycle.Yillik);

        // Mark as past due
        subscription.MarkAsPastDue();
        subscription.Status.Should().Be(SubscriptionStatus.OdemesiGecikti);

        // Reactivate
        subscription.Reactivate();
        subscription.Status.Should().Be(SubscriptionStatus.Aktif);

        // Renew
        var originalEnd = subscription.CurrentPeriodEnd;
        subscription.Renew();
        subscription.CurrentPeriodEnd.Should().BeAfter(originalEnd);

        // Finally cancel
        subscription.Cancel("End of service");
        subscription.Status.Should().Be(SubscriptionStatus.IptalEdildi);
        subscription.AutoRenew.Should().BeFalse();
    }

    private Subscription CreateSubscription()
    {
        return Subscription.Create(
            _tenantId,
            _packageId,
            _billingCycle,
            _price,
            _startDate);
    }
}