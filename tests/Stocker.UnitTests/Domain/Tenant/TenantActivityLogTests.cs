using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class TenantActivityLogTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private const string UserName = "test.user";
    private const string UserEmail = "test@example.com";
    private const string ActivityType = "Create";
    private const string EntityType = "Product";
    private const string Action = "Create";
    private const string Description = "Created new product";

    [Fact]
    public void Create_WithValidData_ShouldCreateActivityLog()
    {
        // Act
        var log = TenantActivityLog.Create(
            ActivityType,
            EntityType,
            Action,
            Description,
            _userId,
            UserName,
            UserEmail);

        // Assert
        log.Should().NotBeNull();
        log.Id.Should().NotBeEmpty();
        log.ActivityType.Should().Be(ActivityType);
        log.EntityType.Should().Be(EntityType);
        log.Action.Should().Be(Action);
        log.Description.Should().Be(Description);
        log.UserId.Should().Be(_userId);
        log.UserName.Should().Be(UserName);
        log.UserEmail.Should().Be(UserEmail);
        log.ActivityAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        log.IsSuccess.Should().BeTrue();
        log.IsSystemGenerated.Should().BeFalse();
        log.Category.Should().Be(ActivityCategory.Create);
        log.Severity.Should().Be(ActivitySeverity.Medium);
        log.EntityId.Should().BeNull();
        log.UserRole.Should().BeNull();
        log.IpAddress.Should().BeNull();
        log.UserAgent.Should().BeNull();
        log.SessionId.Should().BeNull();
        log.RequestId.Should().BeNull();
        log.OldData.Should().BeNull();
        log.NewData.Should().BeNull();
        log.Changes.Should().BeNull();
        log.AdditionalData.Should().BeNull();
        log.ErrorMessage.Should().BeNull();
        log.ErrorDetails.Should().BeNull();
        log.HttpStatusCode.Should().BeNull();
        log.Duration.Should().BeNull();
    }

    [Fact]
    public void Create_WithNullActivityType_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantActivityLog.Create(
            null!,
            EntityType,
            Action,
            Description,
            _userId,
            UserName,
            UserEmail);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Activity type cannot be empty.*")
            .WithParameterName("activityType");
    }

    [Fact]
    public void Create_WithEmptyActivityType_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantActivityLog.Create(
            "",
            EntityType,
            Action,
            Description,
            _userId,
            UserName,
            UserEmail);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Activity type cannot be empty.*")
            .WithParameterName("activityType");
    }

    [Fact]
    public void Create_WithNullEntityType_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantActivityLog.Create(
            ActivityType,
            null!,
            Action,
            Description,
            _userId,
            UserName,
            UserEmail);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Entity type cannot be empty.*")
            .WithParameterName("entityType");
    }

    [Fact]
    public void Create_WithNullAction_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantActivityLog.Create(
            ActivityType,
            EntityType,
            null!,
            Description,
            _userId,
            UserName,
            UserEmail);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Action cannot be empty.*")
            .WithParameterName("action");
    }

    [Fact]
    public void Create_WithNullUserName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantActivityLog.Create(
            ActivityType,
            EntityType,
            Action,
            Description,
            _userId,
            null!,
            UserEmail);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("User name cannot be empty.*")
            .WithParameterName("userName");
    }

    [Fact]
    public void CreateSystemActivity_ShouldCreateSystemGeneratedLog()
    {
        // Act
        var log = TenantActivityLog.CreateSystemActivity(
            "SystemMaintenance",
            "Database",
            "Optimize",
            "Database optimization completed");

        // Assert
        log.Should().NotBeNull();
        log.Id.Should().NotBeEmpty();
        log.ActivityType.Should().Be("SystemMaintenance");
        log.EntityType.Should().Be("Database");
        log.Action.Should().Be("Optimize");
        log.Description.Should().Be("Database optimization completed");
        log.UserId.Should().Be(Guid.Empty);
        log.UserName.Should().Be("System");
        log.UserEmail.Should().Be("system@stocker.com");
        log.IsSystemGenerated.Should().BeTrue();
        log.IsSuccess.Should().BeTrue();
        log.Category.Should().Be(ActivityCategory.System);
    }

    [Fact]
    public void SetEntityReference_ShouldSetEntityId()
    {
        // Arrange
        var log = CreateActivityLog();
        var entityId = Guid.NewGuid();

        // Act
        log.SetEntityReference(entityId);

        // Assert
        log.EntityId.Should().Be(entityId);
    }

    [Fact]
    public void SetUserContext_ShouldSetContextInformation()
    {
        // Arrange
        var log = CreateActivityLog();
        var role = "Admin";
        var ipAddress = "192.168.1.1";
        var userAgent = "Mozilla/5.0";
        var sessionId = "session-123";

        // Act
        log.SetUserContext(role, ipAddress, userAgent, sessionId);

        // Assert
        log.UserRole.Should().Be(role);
        log.IpAddress.Should().Be(ipAddress);
        log.UserAgent.Should().Be(userAgent);
        log.SessionId.Should().Be(sessionId);
    }

    [Fact]
    public void SetRequestContext_ShouldSetRequestId()
    {
        // Arrange
        var log = CreateActivityLog();
        var requestId = "req-12345";

        // Act
        log.SetRequestContext(requestId);

        // Assert
        log.RequestId.Should().Be(requestId);
    }

    [Fact]
    public void SetAuditData_ShouldSetAuditInformation()
    {
        // Arrange
        var log = CreateActivityLog();
        var oldData = "{\"name\":\"Old Product\"}";
        var newData = "{\"name\":\"New Product\"}";
        var changes = "[{\"field\":\"name\",\"old\":\"Old Product\",\"new\":\"New Product\"}]";

        // Act
        log.SetAuditData(oldData, newData, changes);

        // Assert
        log.OldData.Should().Be(oldData);
        log.NewData.Should().Be(newData);
        log.Changes.Should().Be(changes);
    }

    [Fact]
    public void SetAdditionalData_ShouldSetAdditionalData()
    {
        // Arrange
        var log = CreateActivityLog();
        var additionalData = "{\"metadata\":\"value\"}";

        // Act
        log.SetAdditionalData(additionalData);

        // Assert
        log.AdditionalData.Should().Be(additionalData);
    }

    [Fact]
    public void MarkAsSuccess_ShouldSetSuccessAndDuration()
    {
        // Arrange
        var log = CreateActivityLog();
        var duration = TimeSpan.FromMilliseconds(150);

        // Act
        log.MarkAsSuccess(duration);

        // Assert
        log.IsSuccess.Should().BeTrue();
        log.Duration.Should().Be(duration);
    }

    [Fact]
    public void MarkAsSuccess_WithoutDuration_ShouldOnlySetSuccess()
    {
        // Arrange
        var log = CreateActivityLog();

        // Act
        log.MarkAsSuccess();

        // Assert
        log.IsSuccess.Should().BeTrue();
        log.Duration.Should().BeNull();
    }

    [Fact]
    public void MarkAsFailure_ShouldSetFailureInformation()
    {
        // Arrange
        var log = CreateActivityLog();
        var errorMessage = "Validation failed";
        var errorDetails = "Field X is required";
        var httpStatusCode = 400;

        // Act
        log.MarkAsFailure(errorMessage, errorDetails, httpStatusCode);

        // Assert
        log.IsSuccess.Should().BeFalse();
        log.ErrorMessage.Should().Be(errorMessage);
        log.ErrorDetails.Should().Be(errorDetails);
        log.HttpStatusCode.Should().Be(httpStatusCode);
        log.Severity.Should().Be(ActivitySeverity.Error);
    }

    [Fact]
    public void MarkAsFailure_WithOnlyErrorMessage_ShouldSetMinimalFailureInfo()
    {
        // Arrange
        var log = CreateActivityLog();
        var errorMessage = "Operation failed";

        // Act
        log.MarkAsFailure(errorMessage);

        // Assert
        log.IsSuccess.Should().BeFalse();
        log.ErrorMessage.Should().Be(errorMessage);
        log.ErrorDetails.Should().BeNull();
        log.HttpStatusCode.Should().BeNull();
        log.Severity.Should().Be(ActivitySeverity.Error);
    }

    [Fact]
    public void SetDuration_ShouldSetDuration()
    {
        // Arrange
        var log = CreateActivityLog();
        var duration = TimeSpan.FromSeconds(2.5);

        // Act
        log.SetDuration(duration);

        // Assert
        log.Duration.Should().Be(duration);
    }

    [Fact]
    public void SetHttpStatusCode_ShouldSetStatusCode()
    {
        // Arrange
        var log = CreateActivityLog();
        var statusCode = 201;

        // Act
        log.SetHttpStatusCode(statusCode);

        // Assert
        log.HttpStatusCode.Should().Be(statusCode);
    }

    [Theory]
    [InlineData("authentication", ActivityCategory.Authentication)]
    [InlineData("login", ActivityCategory.Authentication)]
    [InlineData("logout", ActivityCategory.Authentication)]
    [InlineData("create_product", ActivityCategory.Create)]
    [InlineData("add_user", ActivityCategory.Create)]
    [InlineData("insert_record", ActivityCategory.Create)]
    [InlineData("update_profile", ActivityCategory.Update)]
    [InlineData("edit_settings", ActivityCategory.Configuration)]
    [InlineData("modify_data", ActivityCategory.Update)]
    [InlineData("delete_item", ActivityCategory.Delete)]
    [InlineData("remove_user", ActivityCategory.Delete)]
    [InlineData("read_report", ActivityCategory.Read)]
    [InlineData("view_dashboard", ActivityCategory.Read)]
    [InlineData("get_list", ActivityCategory.Read)]
    [InlineData("export_data", ActivityCategory.DataTransfer)]
    [InlineData("import_csv", ActivityCategory.DataTransfer)]
    [InlineData("config_change", ActivityCategory.Configuration)]
    [InlineData("setting_update", ActivityCategory.Configuration)]
    [InlineData("security_audit", ActivityCategory.Security)]
    [InlineData("permission_change", ActivityCategory.Security)]
    [InlineData("system_backup", ActivityCategory.System)]
    [InlineData("maintenance_task", ActivityCategory.System)]
    [InlineData("random_activity", ActivityCategory.Other)]
    public void DetermineCategory_ShouldCategorizeCorrectly(string activityType, ActivityCategory expectedCategory)
    {
        // Act
        var log = TenantActivityLog.Create(
            activityType,
            EntityType,
            Action,
            Description,
            _userId,
            UserName,
            UserEmail);

        // Assert
        log.Category.Should().Be(expectedCategory);
    }

    [Theory]
    [InlineData("delete", ActivitySeverity.High)]
    [InlineData("remove", ActivitySeverity.High)]
    [InlineData("create", ActivitySeverity.Medium)]
    [InlineData("update", ActivitySeverity.Medium)]
    [InlineData("modify", ActivitySeverity.Medium)]
    [InlineData("login", ActivitySeverity.Medium)]
    [InlineData("logout", ActivitySeverity.Medium)]
    [InlineData("read", ActivitySeverity.Low)]
    [InlineData("view", ActivitySeverity.Low)]
    [InlineData("list", ActivitySeverity.Low)]
    [InlineData("export", ActivitySeverity.Medium)]
    [InlineData("download", ActivitySeverity.Medium)]
    [InlineData("permission_grant", ActivitySeverity.High)]
    [InlineData("role_assign", ActivitySeverity.High)]
    [InlineData("security_change", ActivitySeverity.High)]
    [InlineData("info", ActivitySeverity.Info)]
    public void DetermineSeverity_ShouldSetSeverityCorrectly(string action, ActivitySeverity expectedSeverity)
    {
        // Act
        var log = TenantActivityLog.Create(
            ActivityType,
            EntityType,
            action,
            Description,
            _userId,
            UserName,
            UserEmail);

        // Assert
        log.Severity.Should().Be(expectedSeverity);
    }

    [Fact]
    public void CompleteActivityLog_WithAllInformation_ShouldHaveFullData()
    {
        // Arrange
        var log = TenantActivityLog.Create(
            "UserUpdate",
            "Customer",
            "Update",
            "Updated customer profile",
            _userId,
            UserName,
            UserEmail);
        
        var entityId = Guid.NewGuid();
        var oldData = "{\"name\":\"John\"}";
        var newData = "{\"name\":\"Jane\"}";
        var changes = "[{\"field\":\"name\",\"old\":\"John\",\"new\":\"Jane\"}]";
        var additionalData = "{\"reason\":\"Customer request\"}";
        var duration = TimeSpan.FromMilliseconds(250);

        // Act
        log.SetEntityReference(entityId);
        log.SetUserContext("Manager", "192.168.1.100", "Chrome/96.0", "sess-abc123");
        log.SetRequestContext("req-xyz789");
        log.SetAuditData(oldData, newData, changes);
        log.SetAdditionalData(additionalData);
        log.MarkAsSuccess(duration);
        log.SetHttpStatusCode(200);

        // Assert
        log.EntityId.Should().Be(entityId);
        log.UserRole.Should().Be("Manager");
        log.IpAddress.Should().Be("192.168.1.100");
        log.UserAgent.Should().Be("Chrome/96.0");
        log.SessionId.Should().Be("sess-abc123");
        log.RequestId.Should().Be("req-xyz789");
        log.OldData.Should().Be(oldData);
        log.NewData.Should().Be(newData);
        log.Changes.Should().Be(changes);
        log.AdditionalData.Should().Be(additionalData);
        log.IsSuccess.Should().BeTrue();
        log.Duration.Should().Be(duration);
        log.HttpStatusCode.Should().Be(200);
        log.Category.Should().Be(ActivityCategory.Update);
        log.Severity.Should().Be(ActivitySeverity.Medium);
    }

    [Fact]
    public void FailedActivityLog_ShouldHaveErrorInformation()
    {
        // Arrange
        var log = TenantActivityLog.Create(
            "DataImport",
            "Product",
            "Import",
            "Attempted to import products",
            _userId,
            UserName,
            UserEmail);

        // Act
        log.MarkAsFailure(
            "File format invalid",
            "Expected CSV, received XML",
            415);

        // Assert
        log.IsSuccess.Should().BeFalse();
        log.ErrorMessage.Should().Be("File format invalid");
        log.ErrorDetails.Should().Be("Expected CSV, received XML");
        log.HttpStatusCode.Should().Be(415);
        log.Severity.Should().Be(ActivitySeverity.Error);
    }

    [Fact]
    public void SystemActivity_ShouldHaveSystemProperties()
    {
        // Act
        var log = TenantActivityLog.CreateSystemActivity(
            "DatabaseMaintenance",
            "Index",
            "Rebuild",
            "Rebuilding database indexes");

        // Assert
        log.IsSystemGenerated.Should().BeTrue();
        log.UserId.Should().Be(Guid.Empty);
        log.UserName.Should().Be("System");
        log.UserEmail.Should().Be("system@stocker.com");
        log.Category.Should().Be(ActivityCategory.System);
    }

    [Fact]
    public void Create_WithLongStrings_ShouldCreateLog()
    {
        // Arrange
        var longActivityType = new string('A', 500);
        var longEntityType = new string('B', 500);
        var longAction = new string('C', 500);
        var longDescription = new string('D', 2000);
        var longUserName = new string('E', 200);
        var longUserEmail = new string('F', 300) + "@test.com";

        // Act
        var log = TenantActivityLog.Create(
            longActivityType,
            longEntityType,
            longAction,
            longDescription,
            _userId,
            longUserName,
            longUserEmail);

        // Assert
        log.ActivityType.Should().Be(longActivityType);
        log.EntityType.Should().Be(longEntityType);
        log.Action.Should().Be(longAction);
        log.Description.Should().Be(longDescription);
        log.UserName.Should().Be(longUserName);
        log.UserEmail.Should().Be(longUserEmail);
    }

    [Fact]
    public void SetAuditData_WithNullValues_ShouldAcceptNulls()
    {
        // Arrange
        var log = CreateActivityLog();

        // Act
        log.SetAuditData(null, null, null);

        // Assert
        log.OldData.Should().BeNull();
        log.NewData.Should().BeNull();
        log.Changes.Should().BeNull();
    }

    [Fact]
    public void SetUserContext_WithNullValues_ShouldAcceptNulls()
    {
        // Arrange
        var log = CreateActivityLog();

        // Act
        log.SetUserContext(null, null, null, null);

        // Assert
        log.UserRole.Should().BeNull();
        log.IpAddress.Should().BeNull();
        log.UserAgent.Should().BeNull();
        log.SessionId.Should().BeNull();
    }

    private TenantActivityLog CreateActivityLog()
    {
        return TenantActivityLog.Create(
            ActivityType,
            EntityType,
            Action,
            Description,
            _userId,
            UserName,
            UserEmail);
    }
}