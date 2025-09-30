using FluentAssertions;
using Stocker.Domain.Tenant.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class AuditLogTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly string _entityName = "Product";
    private readonly string _entityId = Guid.NewGuid().ToString();
    private readonly string _action = "Update";
    private readonly string _userId = Guid.NewGuid().ToString();
    private readonly string _userName = "john.doe";
    private readonly string _userEmail = "john.doe@example.com";
    private readonly string _ipAddress = "192.168.1.1";
    private readonly string _userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0";

    [Fact]
    public void Create_WithValidData_ShouldCreateAuditLog()
    {
        // Act
        var auditLog = AuditLog.Create(
            _tenantId,
            _entityName,
            _entityId,
            _action,
            _userId,
            _userName);

        // Assert
        auditLog.Should().NotBeNull();
        auditLog.TenantId.Should().Be(_tenantId);
        auditLog.EntityName.Should().Be(_entityName);
        auditLog.EntityId.Should().Be(_entityId);
        auditLog.Action.Should().Be(_action);
        auditLog.UserId.Should().Be(_userId);
        auditLog.UserName.Should().Be(_userName);
        auditLog.Timestamp.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        auditLog.UserEmail.Should().BeNull();
        auditLog.IpAddress.Should().BeNull();
        auditLog.UserAgent.Should().BeNull();
        auditLog.OldValues.Should().BeNull();
        auditLog.NewValues.Should().BeNull();
        auditLog.Changes.Should().BeNull();
        auditLog.AdditionalData.Should().BeNull();
    }

    [Fact]
    public void Create_WithFullData_ShouldCreateCompleteAuditLog()
    {
        // Act
        var auditLog = AuditLog.Create(
            _tenantId,
            _entityName,
            _entityId,
            _action,
            _userId,
            _userName,
            _userEmail,
            _ipAddress,
            _userAgent);

        // Assert
        auditLog.UserEmail.Should().Be(_userEmail);
        auditLog.IpAddress.Should().Be(_ipAddress);
        auditLog.UserAgent.Should().Be(_userAgent);
    }

    [Fact]
    public void Constructor_ShouldGenerateUniqueId()
    {
        // Act
        var auditLog1 = CreateAuditLog();
        var auditLog2 = CreateAuditLog();

        // Assert
        auditLog1.Id.Should().NotBeEmpty();
        auditLog2.Id.Should().NotBeEmpty();
        auditLog1.Id.Should().NotBe(auditLog2.Id);
    }

    [Fact]
    public void SetOldValues_ShouldUpdateOldValues()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        var oldValues = "{\"Name\":\"Old Product\",\"Price\":100}";

        // Act
        auditLog.SetOldValues(oldValues);

        // Assert
        auditLog.OldValues.Should().Be(oldValues);
    }

    [Fact]
    public void SetOldValues_WithNull_ShouldClearOldValues()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        auditLog.SetOldValues("{\"Name\":\"Old Product\"}");

        // Act
        auditLog.SetOldValues(null);

        // Assert
        auditLog.OldValues.Should().BeNull();
    }

    [Fact]
    public void SetNewValues_ShouldUpdateNewValues()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        var newValues = "{\"Name\":\"New Product\",\"Price\":150}";

        // Act
        auditLog.SetNewValues(newValues);

        // Assert
        auditLog.NewValues.Should().Be(newValues);
    }

    [Fact]
    public void SetNewValues_WithNull_ShouldClearNewValues()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        auditLog.SetNewValues("{\"Name\":\"New Product\"}");

        // Act
        auditLog.SetNewValues(null);

        // Assert
        auditLog.NewValues.Should().BeNull();
    }

    [Fact]
    public void SetChanges_ShouldUpdateChanges()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        var changes = "[{\"Property\":\"Name\",\"Old\":\"Old Product\",\"New\":\"New Product\"}]";

        // Act
        auditLog.SetChanges(changes);

        // Assert
        auditLog.Changes.Should().Be(changes);
    }

    [Fact]
    public void SetChanges_WithNull_ShouldClearChanges()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        auditLog.SetChanges("[{\"Property\":\"Name\"}]");

        // Act
        auditLog.SetChanges(null);

        // Assert
        auditLog.Changes.Should().BeNull();
    }

    [Fact]
    public void SetAdditionalData_ShouldUpdateAdditionalData()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        var additionalData = "{\"Browser\":\"Chrome\",\"OS\":\"Windows 10\"}";

        // Act
        auditLog.SetAdditionalData(additionalData);

        // Assert
        auditLog.AdditionalData.Should().Be(additionalData);
    }

    [Fact]
    public void SetAdditionalData_WithNull_ShouldClearAdditionalData()
    {
        // Arrange
        var auditLog = CreateAuditLog();
        auditLog.SetAdditionalData("{\"Key\":\"Value\"}");

        // Act
        auditLog.SetAdditionalData(null);

        // Assert
        auditLog.AdditionalData.Should().BeNull();
    }

    [Fact]
    public void CompleteAuditWorkflow_Create_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var auditLog = AuditLog.Create(
            _tenantId,
            "Customer",
            Guid.NewGuid().ToString(),
            "Create",
            _userId,
            _userName,
            _userEmail,
            _ipAddress,
            _userAgent);

        // Set new values for creation
        var newValues = "{\"Name\":\"John Smith\",\"Email\":\"john@example.com\",\"Phone\":\"+1234567890\"}";
        auditLog.SetNewValues(newValues);

        // Set additional data
        var additionalData = "{\"Source\":\"Web Portal\",\"SessionId\":\"abc123\"}";
        auditLog.SetAdditionalData(additionalData);

        // Assert
        auditLog.EntityName.Should().Be("Customer");
        auditLog.Action.Should().Be("Create");
        auditLog.OldValues.Should().BeNull(); // No old values for create
        auditLog.NewValues.Should().Be(newValues);
        auditLog.AdditionalData.Should().Be(additionalData);
    }

    [Fact]
    public void CompleteAuditWorkflow_Update_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var entityId = Guid.NewGuid().ToString();
        var auditLog = AuditLog.Create(
            _tenantId,
            "Product",
            entityId,
            "Update",
            _userId,
            _userName,
            _userEmail,
            _ipAddress,
            _userAgent);

        // Set old and new values
        var oldValues = "{\"Name\":\"Product A\",\"Price\":100,\"Stock\":50}";
        var newValues = "{\"Name\":\"Product A Updated\",\"Price\":120,\"Stock\":45}";
        auditLog.SetOldValues(oldValues);
        auditLog.SetNewValues(newValues);

        // Set changes
        var changes = "[{\"Property\":\"Name\",\"Old\":\"Product A\",\"New\":\"Product A Updated\"},{\"Property\":\"Price\",\"Old\":100,\"New\":120},{\"Property\":\"Stock\",\"Old\":50,\"New\":45}]";
        auditLog.SetChanges(changes);

        // Assert
        auditLog.Action.Should().Be("Update");
        auditLog.OldValues.Should().Be(oldValues);
        auditLog.NewValues.Should().Be(newValues);
        auditLog.Changes.Should().Be(changes);
    }

    [Fact]
    public void CompleteAuditWorkflow_Delete_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var entityId = Guid.NewGuid().ToString();
        var auditLog = AuditLog.Create(
            _tenantId,
            "Invoice",
            entityId,
            "Delete",
            _userId,
            _userName,
            _userEmail,
            _ipAddress,
            _userAgent);

        // Set old values (the deleted entity data)
        var oldValues = "{\"InvoiceNumber\":\"INV-2024-001\",\"Amount\":1500,\"Status\":\"Paid\"}";
        auditLog.SetOldValues(oldValues);

        // Set additional data for delete reason
        var additionalData = "{\"DeleteReason\":\"Duplicate entry\",\"AuthorizedBy\":\"admin\"}";
        auditLog.SetAdditionalData(additionalData);

        // Assert
        auditLog.Action.Should().Be("Delete");
        auditLog.OldValues.Should().Be(oldValues);
        auditLog.NewValues.Should().BeNull(); // No new values for delete
        auditLog.AdditionalData.Should().Be(additionalData);
    }

    [Fact]
    public void DifferentActionTypes_ShouldStoreCorrectly()
    {
        // Create
        var createLog = AuditLog.Create(_tenantId, "Entity", "1", "Create", _userId, _userName);
        createLog.Action.Should().Be("Create");

        // Read
        var readLog = AuditLog.Create(_tenantId, "Entity", "2", "Read", _userId, _userName);
        readLog.Action.Should().Be("Read");

        // Update
        var updateLog = AuditLog.Create(_tenantId, "Entity", "3", "Update", _userId, _userName);
        updateLog.Action.Should().Be("Update");

        // Delete
        var deleteLog = AuditLog.Create(_tenantId, "Entity", "4", "Delete", _userId, _userName);
        deleteLog.Action.Should().Be("Delete");

        // Custom action
        var customLog = AuditLog.Create(_tenantId, "Entity", "5", "Approve", _userId, _userName);
        customLog.Action.Should().Be("Approve");
    }

    [Fact]
    public void DifferentEntityTypes_ShouldStoreCorrectly()
    {
        // Product
        var productLog = AuditLog.Create(_tenantId, "Product", "1", "Update", _userId, _userName);
        productLog.EntityName.Should().Be("Product");

        // Customer
        var customerLog = AuditLog.Create(_tenantId, "Customer", "2", "Create", _userId, _userName);
        customerLog.EntityName.Should().Be("Customer");

        // Invoice
        var invoiceLog = AuditLog.Create(_tenantId, "Invoice", "3", "Delete", _userId, _userName);
        invoiceLog.EntityName.Should().Be("Invoice");

        // Order
        var orderLog = AuditLog.Create(_tenantId, "Order", "4", "Approve", _userId, _userName);
        orderLog.EntityName.Should().Be("Order");
    }

    [Fact]
    public void JsonData_ShouldStoreCorrectly()
    {
        // Arrange
        var auditLog = CreateAuditLog();

        // Complex JSON for old values
        var oldValuesJson = @"{
            ""Id"": ""123"",
            ""Name"": ""Product A"",
            ""Details"": {
                ""Category"": ""Electronics"",
                ""Brand"": ""BrandX""
            },
            ""Tags"": [""tag1"", ""tag2""]
        }";

        // Complex JSON for new values
        var newValuesJson = @"{
            ""Id"": ""123"",
            ""Name"": ""Product A Updated"",
            ""Details"": {
                ""Category"": ""Electronics"",
                ""Brand"": ""BrandY""
            },
            ""Tags"": [""tag1"", ""tag2"", ""tag3""]
        }";

        // Act
        auditLog.SetOldValues(oldValuesJson);
        auditLog.SetNewValues(newValuesJson);

        // Assert
        auditLog.OldValues.Should().Be(oldValuesJson);
        auditLog.NewValues.Should().Be(newValuesJson);
    }

    [Fact]
    public void MultipleAuditLogs_ShouldHaveUniqueTimestamps()
    {
        // Act
        var log1 = CreateAuditLog();
        System.Threading.Thread.Sleep(10); // Small delay to ensure different timestamps
        var log2 = CreateAuditLog();

        // Assert
        log1.Timestamp.Should().BeBefore(log2.Timestamp);
    }

    private AuditLog CreateAuditLog()
    {
        return AuditLog.Create(
            _tenantId,
            _entityName,
            _entityId,
            _action,
            _userId,
            _userName);
    }
}