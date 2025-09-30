using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantNotificationTests
{
    private const string Title = "Important Notification";
    private const string Message = "This is an important message for users";
    private const string CreatedBy = "system@test.com";
    private readonly Guid _userId = Guid.NewGuid();

    [Fact]
    public void CreateUserNotification_WithValidData_ShouldCreateNotification()
    {
        // Act
        var notification = TenantNotification.CreateUserNotification(
            Title,
            Message,
            NotificationType.Information,
            _userId,
            CreatedBy);

        // Assert
        notification.Should().NotBeNull();
        notification.Id.Should().NotBeEmpty();
        notification.Title.Should().Be(Title);
        notification.Message.Should().Be(Message);
        notification.Type.Should().Be(NotificationType.Information);
        notification.Category.Should().Be(NotificationCategory.User);
        notification.TargetType.Should().Be(NotificationTarget.User);
        notification.TargetUserId.Should().Be(_userId);
        notification.IsGlobal.Should().BeFalse();
        notification.CreatedBy.Should().Be(CreatedBy);
        notification.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        notification.Status.Should().Be(NotificationStatus.Created);
        notification.Priority.Should().Be(NotificationPriority.Normal);
        notification.Severity.Should().Be(NotificationSeverity.Info);
        notification.Source.Should().Be(NotificationSource.System);
        notification.SendInApp.Should().BeTrue();
        notification.AllowDismiss.Should().BeTrue();
        notification.ShowUntilRead.Should().BeTrue();
        notification.DeliveryAttempts.Should().Be(0);
    }

    [Fact]
    public void CreateRoleNotification_WithValidData_ShouldCreateNotification()
    {
        // Arrange
        var targetRole = "Administrator";

        // Act
        var notification = TenantNotification.CreateRoleNotification(
            Title,
            Message,
            NotificationType.Alert,
            targetRole,
            CreatedBy);

        // Assert
        notification.Should().NotBeNull();
        notification.Type.Should().Be(NotificationType.Alert);
        notification.Category.Should().Be(NotificationCategory.System);
        notification.TargetType.Should().Be(NotificationTarget.Role);
        notification.TargetRole.Should().Be(targetRole);
        notification.TargetUserId.Should().BeNull();
        notification.IsGlobal.Should().BeFalse();
    }

    [Fact]
    public void CreateGlobalNotification_WithValidData_ShouldCreateNotification()
    {
        // Act
        var notification = TenantNotification.CreateGlobalNotification(
            Title,
            Message,
            NotificationType.Announcement,
            CreatedBy);

        // Assert
        notification.Should().NotBeNull();
        notification.Type.Should().Be(NotificationType.Announcement);
        notification.Category.Should().Be(NotificationCategory.System);
        notification.TargetType.Should().Be(NotificationTarget.AllUsers);
        notification.IsGlobal.Should().BeTrue();
        notification.TargetUserId.Should().BeNull();
        notification.TargetRole.Should().BeNull();
    }

    [Fact]
    public void SetDescription_ShouldUpdateDescription()
    {
        // Arrange
        var notification = CreateUserNotification();
        var description = "Detailed description of the notification";

        // Act
        notification.SetDescription(description);

        // Assert
        notification.Description.Should().Be(description);
    }

    [Fact]
    public void SetPriority_ShouldUpdatePriority()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetPriority(NotificationPriority.Urgent);

        // Assert
        notification.Priority.Should().Be(NotificationPriority.Urgent);
    }

    [Fact]
    public void SetSeverity_ShouldUpdateSeverity()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetSeverity(NotificationSeverity.Critical);

        // Assert
        notification.Severity.Should().Be(NotificationSeverity.Critical);
    }

    [Fact]
    public void SetIcon_WithColor_ShouldSetIconAndColor()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetIcon("bell", "#FF5733");

        // Assert
        notification.IconName.Should().Be("bell");
        notification.IconColor.Should().Be("#FF5733");
    }

    [Fact]
    public void SetIcon_WithoutColor_ShouldSetIconOnly()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetIcon("alert");

        // Assert
        notification.IconName.Should().Be("alert");
        notification.IconColor.Should().BeNull();
    }

    [Fact]
    public void SetImage_ShouldUpdateImageUrl()
    {
        // Arrange
        var notification = CreateUserNotification();
        var imageUrl = "https://example.com/image.png";

        // Act
        notification.SetImage(imageUrl);

        // Assert
        notification.ImageUrl.Should().Be(imageUrl);
    }

    [Fact]
    public void SetAction_WithAllParameters_ShouldSetAction()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetAction("/dashboard", "Go to Dashboard", "navigate");

        // Assert
        notification.ActionUrl.Should().Be("/dashboard");
        notification.ActionText.Should().Be("Go to Dashboard");
        notification.ActionType.Should().Be("navigate");
    }

    [Fact]
    public void SetAction_WithoutActionType_ShouldDefaultToNavigate()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetAction("/profile", "View Profile");

        // Assert
        notification.ActionUrl.Should().Be("/profile");
        notification.ActionText.Should().Be("View Profile");
        notification.ActionType.Should().Be("navigate");
    }

    [Fact]
    public void AddAction_ShouldAddToActionsList()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.AddAction("Approve", "/approve", "modal", "primary");
        notification.AddAction("Reject", "/reject", "modal", "danger");

        // Assert
        notification.Actions.Should().HaveCount(2);
        notification.Actions[0].Text.Should().Be("Approve");
        notification.Actions[0].Url.Should().Be("/approve");
        notification.Actions[0].Type.Should().Be("modal");
        notification.Actions[0].Style.Should().Be("primary");
        notification.Actions[1].Text.Should().Be("Reject");
        notification.Actions[1].Style.Should().Be("danger");
    }

    [Fact]
    public void SetActionData_ShouldUpdateActionData()
    {
        // Arrange
        var notification = CreateUserNotification();
        var actionData = new Dictionary<string, string>
        {
            { "entityId", "123" },
            { "entityType", "Order" }
        };

        // Act
        notification.SetActionData(actionData);

        // Assert
        notification.ActionData.Should().BeEquivalentTo(actionData);
    }

    [Fact]
    public void ConfigureDeliveryChannels_ShouldSetChannels()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.ConfigureDeliveryChannels(
            inApp: true,
            email: true,
            sms: false,
            push: true,
            webhook: false);

        // Assert
        notification.SendInApp.Should().BeTrue();
        notification.SendEmail.Should().BeTrue();
        notification.SendSms.Should().BeFalse();
        notification.SendPushNotification.Should().BeTrue();
        notification.SendWebhook.Should().BeFalse();
    }

    [Fact]
    public void SetEmailTemplate_ShouldSetTemplateAndEnableEmail()
    {
        // Arrange
        var notification = CreateUserNotification();
        var templateId = "welcome-email";

        // Act
        notification.SetEmailTemplate(templateId);

        // Assert
        notification.EmailTemplateId.Should().Be(templateId);
        notification.SendEmail.Should().BeTrue();
    }

    [Fact]
    public void SetSmsTemplate_ShouldSetTemplateAndEnableSms()
    {
        // Arrange
        var notification = CreateUserNotification();
        var templateId = "alert-sms";

        // Act
        notification.SetSmsTemplate(templateId);

        // Assert
        notification.SmsTemplateId.Should().Be(templateId);
        notification.SendSms.Should().BeTrue();
    }

    [Fact]
    public void SetWebhook_ShouldSetUrlAndEnableWebhook()
    {
        // Arrange
        var notification = CreateUserNotification();
        var webhookUrl = "https://api.example.com/webhook";

        // Act
        notification.SetWebhook(webhookUrl);

        // Assert
        notification.WebhookUrl.Should().Be(webhookUrl);
        notification.SendWebhook.Should().BeTrue();
    }

    [Fact]
    public void Schedule_ShouldSetScheduledTimeAndStatus()
    {
        // Arrange
        var notification = CreateUserNotification();
        var scheduledTime = DateTime.UtcNow.AddHours(2);

        // Act
        notification.Schedule(scheduledTime);

        // Assert
        notification.ScheduledAt.Should().Be(scheduledTime);
        notification.IsScheduled.Should().BeTrue();
        notification.Status.Should().Be(NotificationStatus.Scheduled);
    }

    [Fact]
    public void SetRecurrence_WithEndDate_ShouldSetRecurrencePattern()
    {
        // Arrange
        var notification = CreateUserNotification();
        var cronPattern = "0 9 * * MON";
        var endDate = DateTime.UtcNow.AddMonths(6);

        // Act
        notification.SetRecurrence(cronPattern, endDate);

        // Assert
        notification.IsRecurring.Should().BeTrue();
        notification.RecurrencePattern.Should().Be(cronPattern);
        notification.RecurrenceEndDate.Should().Be(endDate);
    }

    [Fact]
    public void SetRecurrence_WithoutEndDate_ShouldSetIndefiniteRecurrence()
    {
        // Arrange
        var notification = CreateUserNotification();
        var cronPattern = "0 0 * * *";

        // Act
        notification.SetRecurrence(cronPattern);

        // Assert
        notification.IsRecurring.Should().BeTrue();
        notification.RecurrencePattern.Should().Be(cronPattern);
        notification.RecurrenceEndDate.Should().BeNull();
    }

    [Fact]
    public void SetExpiration_ShouldSetExpiryDate()
    {
        // Arrange
        var notification = CreateUserNotification();
        var expiryDate = DateTime.UtcNow.AddDays(7);

        // Act
        notification.SetExpiration(expiryDate);

        // Assert
        notification.ExpiresAt.Should().Be(expiryDate);
    }

    [Fact]
    public void RequireAcknowledgment_WithAllowDismiss_ShouldSetBoth()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.RequireAcknowledgment(allowDismiss: true);

        // Assert
        notification.RequiresAcknowledgment.Should().BeTrue();
        notification.AllowDismiss.Should().BeTrue();
    }

    [Fact]
    public void RequireAcknowledgment_WithoutAllowDismiss_ShouldOnlyRequireAck()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.RequireAcknowledgment(allowDismiss: false);

        // Assert
        notification.RequiresAcknowledgment.Should().BeTrue();
        notification.AllowDismiss.Should().BeFalse();
    }

    [Fact]
    public void SetPersistent_True_ShouldMakeNotDismissable()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetPersistent(true);

        // Assert
        notification.Persistent.Should().BeTrue();
        notification.AllowDismiss.Should().BeFalse();
    }

    [Fact]
    public void SetPersistent_False_ShouldAllowDismiss()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetPersistent(false);

        // Assert
        notification.Persistent.Should().BeFalse();
        notification.AllowDismiss.Should().BeTrue();
    }

    [Fact]
    public void SetSource_WithAllParameters_ShouldSetSource()
    {
        // Arrange
        var notification = CreateUserNotification();
        var entityId = Guid.NewGuid();

        // Act
        notification.SetSource(
            NotificationSource.Integration,
            "Order",
            entityId,
            "OrderPlaced");

        // Assert
        notification.Source.Should().Be(NotificationSource.Integration);
        notification.SourceEntityType.Should().Be("Order");
        notification.SourceEntityId.Should().Be(entityId);
        notification.SourceEventType.Should().Be("OrderPlaced");
    }

    [Fact]
    public void SetMetadata_ShouldUpdateMetadata()
    {
        // Arrange
        var notification = CreateUserNotification();
        var metadata = "{\"category\":\"sales\",\"priority\":1}";

        // Act
        notification.SetMetadata(metadata);

        // Assert
        notification.Metadata.Should().Be(metadata);
    }

    [Fact]
    public void SetTemplateData_ShouldUpdateData()
    {
        // Arrange
        var notification = CreateUserNotification();
        var data = new Dictionary<string, string>
        {
            { "userName", "John Doe" },
            { "amount", "$100.00" }
        };

        // Act
        notification.SetTemplateData(data);

        // Assert
        notification.Data.Should().BeEquivalentTo(data);
    }

    [Fact]
    public void AddTag_WithNewTag_ShouldAddTag()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.AddTag("urgent");
        notification.AddTag("billing");

        // Assert
        notification.Tags.Should().HaveCount(2);
        notification.Tags.Should().Contain("urgent");
        notification.Tags.Should().Contain("billing");
    }

    [Fact]
    public void AddTag_WithExistingTag_ShouldNotDuplicate()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.AddTag("urgent");
        notification.AddTag("urgent");

        // Assert
        notification.Tags.Should().HaveCount(1);
        notification.Tags.Should().Contain("urgent");
    }

    [Fact]
    public void AddTag_WithNullOrEmpty_ShouldNotAdd()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.AddTag(null);
        notification.AddTag("");
        notification.AddTag("  ");

        // Assert
        notification.Tags.Should().BeEmpty();
    }

    [Fact]
    public void SetGroupKey_ShouldSetGroupingInfo()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.SetGroupKey("order-updates", 5);

        // Assert
        notification.GroupKey.Should().Be("order-updates");
        notification.GroupCount.Should().Be(5);
    }

    [Fact]
    public void MarkAsSent_ShouldUpdateStatusAndTimestamp()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.MarkAsSent();

        // Assert
        notification.Status.Should().Be(NotificationStatus.Sent);
        notification.SentAt.Should().NotBeNull();
        notification.SentAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkAsDelivered_ShouldUpdateStatus()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.MarkAsDelivered();

        // Assert
        notification.Status.Should().Be(NotificationStatus.Delivered);
    }

    [Fact]
    public void MarkAsRead_ShouldUpdateStatusAndTimestamp()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.MarkAsRead();

        // Assert
        notification.IsRead.Should().BeTrue();
        notification.ReadAt.Should().NotBeNull();
        notification.ReadAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        notification.Status.Should().Be(NotificationStatus.Read);
    }

    [Fact]
    public void MarkAsDismissed_WhenAllowed_ShouldDismiss()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.MarkAsDismissed();

        // Assert
        notification.IsDismissed.Should().BeTrue();
        notification.DismissedAt.Should().NotBeNull();
        notification.DismissedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkAsDismissed_WhenNotAllowedAndNoAckRequired_ShouldThrow()
    {
        // Arrange
        var notification = CreateUserNotification();
        notification.SetPersistent(true); // This sets AllowDismiss to false

        // Act
        var action = () => notification.MarkAsDismissed();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("This notification cannot be dismissed.");
    }

    [Fact]
    public void MarkAsDismissed_WhenRequiresAcknowledgment_ShouldAllowDismiss()
    {
        // Arrange
        var notification = CreateUserNotification();
        notification.RequireAcknowledgment(allowDismiss: true);

        // Act
        notification.MarkAsDismissed();

        // Assert
        notification.IsDismissed.Should().BeTrue();
    }

    [Fact]
    public void Acknowledge_WhenRequired_ShouldAcknowledge()
    {
        // Arrange
        var notification = CreateUserNotification();
        notification.RequireAcknowledgment();
        var acknowledgedBy = "user@test.com";

        // Act
        notification.Acknowledge(acknowledgedBy);

        // Assert
        notification.IsAcknowledged.Should().BeTrue();
        notification.AcknowledgedAt.Should().NotBeNull();
        notification.AcknowledgedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        notification.AcknowledgedBy.Should().Be(acknowledgedBy);
        notification.Status.Should().Be(NotificationStatus.Acknowledged);
    }

    [Fact]
    public void Acknowledge_WhenNotRequired_ShouldThrow()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        var action = () => notification.Acknowledge("user@test.com");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("This notification does not require acknowledgment.");
    }

    [Fact]
    public void Archive_ShouldUpdateStatusAndTimestamp()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.Archive();

        // Assert
        notification.IsArchived.Should().BeTrue();
        notification.ArchivedAt.Should().NotBeNull();
        notification.ArchivedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        notification.Status.Should().Be(NotificationStatus.Archived);
    }

    [Fact]
    public void RecordDeliveryAttempt_Success_ShouldIncrementCount()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.RecordDeliveryAttempt(true);

        // Assert
        notification.DeliveryAttempts.Should().Be(1);
        notification.LastDeliveryAttempt.Should().NotBeNull();
        notification.LastDeliveryAttempt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        notification.DeliveryError.Should().BeNull();
        notification.Status.Should().NotBe(NotificationStatus.Failed);
    }

    [Fact]
    public void RecordDeliveryAttempt_Failure_ShouldSetErrorAndStatus()
    {
        // Arrange
        var notification = CreateUserNotification();
        var errorMessage = "Connection timeout";

        // Act
        notification.RecordDeliveryAttempt(false, errorMessage);

        // Assert
        notification.DeliveryAttempts.Should().Be(1);
        notification.LastDeliveryAttempt.Should().NotBeNull();
        notification.DeliveryError.Should().Be(errorMessage);
        notification.Status.Should().Be(NotificationStatus.Failed);
    }

    [Fact]
    public void RecordDeliveryAttempt_MultipleTimes_ShouldAccumulate()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        notification.RecordDeliveryAttempt(false, "Error 1");
        notification.RecordDeliveryAttempt(false, "Error 2");
        notification.RecordDeliveryAttempt(true);

        // Assert
        notification.DeliveryAttempts.Should().Be(3);
        notification.DeliveryError.Should().BeNull(); // Last was successful
    }

    [Fact]
    public void IsExpired_WithNoExpiry_ShouldReturnFalse()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        var result = notification.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithFutureExpiry_ShouldReturnFalse()
    {
        // Arrange
        var notification = CreateUserNotification();
        notification.SetExpiration(DateTime.UtcNow.AddDays(7));

        // Act
        var result = notification.IsExpired();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void IsExpired_WithPastExpiry_ShouldReturnTrue()
    {
        // Arrange
        var notification = CreateUserNotification();
        notification.SetExpiration(DateTime.UtcNow.AddDays(-1));

        // Act
        var result = notification.IsExpired();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void ShouldSendNow_NotScheduled_ShouldReturnTrue()
    {
        // Arrange
        var notification = CreateUserNotification();

        // Act
        var result = notification.ShouldSendNow();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void ShouldSendNow_ScheduledForFuture_ShouldReturnFalse()
    {
        // Arrange
        var notification = CreateUserNotification();
        notification.Schedule(DateTime.UtcNow.AddHours(2));

        // Act
        var result = notification.ShouldSendNow();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void ShouldSendNow_ScheduledForPast_ShouldReturnTrue()
    {
        // Arrange
        var notification = CreateUserNotification();
        notification.Schedule(DateTime.UtcNow.AddHours(-1));

        // Act
        var result = notification.ShouldSendNow();

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void CompleteNotificationLifecycle_ShouldWorkCorrectly()
    {
        // Arrange & Act
        // Create a critical system notification
        var notification = TenantNotification.CreateGlobalNotification(
            "System Maintenance",
            "The system will undergo maintenance tonight",
            NotificationType.Announcement,
            "admin@company.com");

        // Configure the notification
        notification.SetDescription("Scheduled maintenance for system upgrade");
        notification.SetPriority(NotificationPriority.High);
        notification.SetSeverity(NotificationSeverity.Warning);
        notification.SetIcon("maintenance", "#FFA500");
        notification.SetImage("https://example.com/maintenance.png");
        
        // Set actions
        notification.SetAction("/maintenance-info", "Learn More");
        notification.AddAction("Remind Me Later", "/remind", "modal", "secondary");
        notification.AddAction("I Understand", "/acknowledge", "dismiss", "primary");
        
        // Configure delivery channels
        notification.ConfigureDeliveryChannels(
            inApp: true,
            email: true,
            sms: true,
            push: true,
            webhook: false);
        
        notification.SetEmailTemplate("maintenance-notification");
        notification.SetSmsTemplate("maintenance-alert");
        
        // Set scheduling and recurrence
        notification.Schedule(DateTime.UtcNow.AddHours(1));
        notification.SetRecurrence("0 20 * * *", DateTime.UtcNow.AddDays(7));
        notification.SetExpiration(DateTime.UtcNow.AddDays(8));
        
        // Require acknowledgment
        notification.RequireAcknowledgment(allowDismiss: false);
        
        // Set source and metadata
        notification.SetSource(
            NotificationSource.Schedule,
            "MaintenanceWindow",
            Guid.NewGuid(),
            "SystemMaintenance");
        
        notification.SetMetadata("{\"duration\":\"2hours\",\"affectedServices\":[\"API\",\"WebApp\"]}");
        
        var templateData = new Dictionary<string, string>
        {
            { "startTime", "10:00 PM" },
            { "endTime", "12:00 AM" },
            { "affectedRegions", "US-East, EU-West" }
        };
        notification.SetTemplateData(templateData);
        
        // Add tags and grouping
        notification.AddTag("maintenance");
        notification.AddTag("system");
        notification.AddTag("critical");
        notification.SetGroupKey("maintenance-2024", 3);
        
        // Simulate delivery process
        notification.RecordDeliveryAttempt(false, "SMTP server unavailable");
        notification.DeliveryAttempts.Should().Be(1);
        notification.Status.Should().Be(NotificationStatus.Failed);
        
        // Retry and succeed
        notification.RecordDeliveryAttempt(true);
        notification.DeliveryAttempts.Should().Be(2);
        
        // Mark as sent and delivered
        notification.MarkAsSent();
        notification.MarkAsDelivered();
        
        // User interaction
        notification.MarkAsRead();
        notification.IsRead.Should().BeTrue();
        
        // User acknowledges
        notification.Acknowledge("user@company.com");
        notification.IsAcknowledged.Should().BeTrue();
        notification.Status.Should().Be(NotificationStatus.Acknowledged);
        
        // Archive after processing
        notification.Archive();
        notification.IsArchived.Should().BeTrue();
        notification.Status.Should().Be(NotificationStatus.Archived);
        
        // Verify final state
        notification.ShouldSendNow().Should().BeFalse(); // Already processed
        notification.IsExpired().Should().BeFalse(); // Still within expiry
        notification.Tags.Should().HaveCount(3);
        notification.Actions.Should().HaveCount(2);
        notification.SendEmail.Should().BeTrue();
        notification.SendSms.Should().BeTrue();
    }

    [Theory]
    [InlineData(NotificationType.Information)]
    [InlineData(NotificationType.Success)]
    [InlineData(NotificationType.Warning)]
    [InlineData(NotificationType.Error)]
    [InlineData(NotificationType.Alert)]
    [InlineData(NotificationType.Reminder)]
    [InlineData(NotificationType.Update)]
    [InlineData(NotificationType.Announcement)]
    [InlineData(NotificationType.Promotion)]
    [InlineData(NotificationType.Security)]
    [InlineData(NotificationType.System)]
    public void CreateUserNotification_WithDifferentTypes_ShouldAcceptAll(NotificationType type)
    {
        // Act
        var notification = TenantNotification.CreateUserNotification(
            Title,
            Message,
            type,
            _userId,
            CreatedBy);

        // Assert
        notification.Type.Should().Be(type);
    }

    private TenantNotification CreateUserNotification()
    {
        return TenantNotification.CreateUserNotification(
            Title,
            Message,
            NotificationType.Information,
            _userId,
            CreatedBy);
    }
}