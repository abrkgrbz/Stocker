using FluentAssertions;
using MassTransit.Testing;
using Stocker.IntegrationTests.Events.Fixtures;
using Stocker.Shared.Events.CRM;
using Xunit;

namespace Stocker.IntegrationTests.Events.CRM;

/// <summary>
/// Integration tests for Customer events (Created/Updated)
/// </summary>
public class CustomerEventTests : IAsyncLifetime
{
    private readonly EventBusTestHarness _harness;

    public CustomerEventTests()
    {
        _harness = new EventBusTestHarness();
    }

    public async Task InitializeAsync()
    {
        await _harness.StartAsync();
    }

    public async Task DisposeAsync()
    {
        await _harness.DisposeAsync();
    }

    [Fact]
    public async Task CustomerCreatedEvent_ShouldBePublished_WhenCustomerIsCreated()
    {
        // Arrange
        var customerCreatedEvent = new CustomerCreatedEvent(
            CustomerId: Guid.NewGuid(),
            TenantId: Guid.NewGuid(),
            CompanyName: "Acme Corporation",
            Email: "contact@acme.com",
            Phone: "+1-555-0123",
            Website: "https://acme.com",
            Industry: "Technology",
            AnnualRevenue: 5000000m,
            NumberOfEmployees: 100,
            CreatedAt: DateTime.UtcNow,
            CreatedBy: Guid.NewGuid()
        );

        // Act
        await _harness.PublishAsync(customerCreatedEvent);

        // Assert
        var published = await _harness.Published<CustomerCreatedEvent>();
        published.Should().BeTrue("CustomerCreatedEvent should be published");
    }

    [Fact]
    public async Task CustomerCreatedEvent_ShouldBeConsumed_ByTestConsumer()
    {
        // Arrange
        var customerCreatedEvent = new CustomerCreatedEvent(
            CustomerId: Guid.NewGuid(),
            TenantId: Guid.NewGuid(),
            CompanyName: "Tech Innovations Ltd",
            Email: "info@techinnovations.com",
            Phone: "+44-20-1234-5678",
            Website: "https://techinnovations.com",
            Industry: "Software",
            AnnualRevenue: 2500000m,
            NumberOfEmployees: 50,
            CreatedAt: DateTime.UtcNow,
            CreatedBy: Guid.NewGuid()
        );

        var consumerHarness = _harness.GetConsumerHarness<TestCustomerCreatedEventConsumer>();

        // Act
        await _harness.PublishAsync(customerCreatedEvent);

        // Assert
        var consumed = await consumerHarness.Consumed.Any<CustomerCreatedEvent>();
        consumed.Should().BeTrue("CustomerCreatedEvent should be consumed");

        var message = consumerHarness.Consumed.Select<CustomerCreatedEvent>().First().Context.Message;
        message.CompanyName.Should().Be("Tech Innovations Ltd");
        message.Email.Should().Be("info@techinnovations.com");
        message.Industry.Should().Be("Software");
    }

    [Fact]
    public async Task CustomerUpdatedEvent_ShouldBePublished_WhenCustomerIsUpdated()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();

        var customerUpdatedEvent = new CustomerUpdatedEvent(
            CustomerId: customerId,
            TenantId: tenantId,
            CompanyName: "Updated Company Name",
            Email: "updated@company.com",
            Phone: "+1-555-9999",
            Website: "https://updated.com",
            Industry: "Manufacturing",
            AnnualRevenue: 10000000m,
            NumberOfEmployees: 250,
            UpdatedAt: DateTime.UtcNow,
            UpdatedBy: Guid.NewGuid()
        );

        // Act
        await _harness.PublishAsync(customerUpdatedEvent);

        // Assert
        var published = await _harness.Published<CustomerUpdatedEvent>();
        published.Should().BeTrue("CustomerUpdatedEvent should be published");
    }

    [Fact]
    public async Task CustomerUpdatedEvent_ShouldBeConsumed_ByTestConsumer()
    {
        // Arrange
        var customerUpdatedEvent = new CustomerUpdatedEvent(
            CustomerId: Guid.NewGuid(),
            TenantId: Guid.NewGuid(),
            CompanyName: "Global Solutions Inc",
            Email: "contact@globalsolutions.com",
            Phone: "+1-800-GLOBAL",
            Website: "https://globalsolutions.com",
            Industry: "Consulting",
            AnnualRevenue: 15000000m,
            NumberOfEmployees: 500,
            UpdatedAt: DateTime.UtcNow,
            UpdatedBy: Guid.NewGuid()
        );

        var consumerHarness = _harness.GetConsumerHarness<TestCustomerUpdatedEventConsumer>();

        // Act
        await _harness.PublishAsync(customerUpdatedEvent);

        // Assert
        var consumed = await consumerHarness.Consumed.Any<CustomerUpdatedEvent>();
        consumed.Should().BeTrue("CustomerUpdatedEvent should be consumed");

        var message = consumerHarness.Consumed.Select<CustomerUpdatedEvent>().First().Context.Message;
        message.CompanyName.Should().Be("Global Solutions Inc");
        message.Email.Should().Be("contact@globalsolutions.com");
    }

    [Fact]
    public async Task MultipleCustomerEvents_ShouldBeProcessed_InSequence()
    {
        // Arrange
        var customerId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var userId = Guid.NewGuid();

        var createdEvent = new CustomerCreatedEvent(
            CustomerId: customerId,
            TenantId: tenantId,
            CompanyName: "Startup Inc",
            Email: "hello@startup.com",
            Phone: "+1-555-START",
            Website: "https://startup.com",
            Industry: "Technology",
            AnnualRevenue: 500000m,
            NumberOfEmployees: 10,
            CreatedAt: DateTime.UtcNow,
            CreatedBy: userId
        );

        var updatedEvent = new CustomerUpdatedEvent(
            CustomerId: customerId,
            TenantId: tenantId,
            CompanyName: "Startup Inc (Updated)",
            Email: "contact@startup.com",
            Phone: "+1-555-START",
            Website: "https://startup.com",
            Industry: "Technology",
            AnnualRevenue: 2000000m,
            NumberOfEmployees: 50,
            UpdatedAt: DateTime.UtcNow.AddMinutes(5),
            UpdatedBy: userId
        );

        var createdConsumerHarness = _harness.GetConsumerHarness<TestCustomerCreatedEventConsumer>();
        var updatedConsumerHarness = _harness.GetConsumerHarness<TestCustomerUpdatedEventConsumer>();

        // Act
        await _harness.PublishAsync(createdEvent);
        await _harness.PublishAsync(updatedEvent);

        // Wait for processing
        await Task.Delay(500);

        // Assert
        var createdConsumed = await createdConsumerHarness.Consumed.Any<CustomerCreatedEvent>();
        var updatedConsumed = await updatedConsumerHarness.Consumed.Any<CustomerUpdatedEvent>();

        createdConsumed.Should().BeTrue();
        updatedConsumed.Should().BeTrue();

        var createdMessage = createdConsumerHarness.Consumed.Select<CustomerCreatedEvent>().First().Context.Message;
        var updatedMessage = updatedConsumerHarness.Consumed.Select<CustomerUpdatedEvent>().First().Context.Message;

        createdMessage.CustomerId.Should().Be(customerId);
        updatedMessage.CustomerId.Should().Be(customerId);
        updatedMessage.AnnualRevenue.Should().Be(2000000m);
    }

    [Fact]
    public async Task CustomerEvents_ShouldMaintainTenantIsolation()
    {
        // Arrange
        var tenant1Id = Guid.NewGuid();
        var tenant2Id = Guid.NewGuid();

        var tenant1Event = new CustomerCreatedEvent(
            CustomerId: Guid.NewGuid(),
            TenantId: tenant1Id,
            CompanyName: "Tenant 1 Customer",
            Email: "tenant1@customer.com",
            Phone: "+1-111-1111",
            Website: null,
            Industry: "Retail",
            AnnualRevenue: 1000000m,
            NumberOfEmployees: 20,
            CreatedAt: DateTime.UtcNow,
            CreatedBy: Guid.NewGuid()
        );

        var tenant2Event = new CustomerCreatedEvent(
            CustomerId: Guid.NewGuid(),
            TenantId: tenant2Id,
            CompanyName: "Tenant 2 Customer",
            Email: "tenant2@customer.com",
            Phone: "+1-222-2222",
            Website: null,
            Industry: "Healthcare",
            AnnualRevenue: 3000000m,
            NumberOfEmployees: 100,
            CreatedAt: DateTime.UtcNow,
            CreatedBy: Guid.NewGuid()
        );

        var consumerHarness = _harness.GetConsumerHarness<TestCustomerCreatedEventConsumer>();

        // Act
        await _harness.PublishAsync(tenant1Event);
        await _harness.PublishAsync(tenant2Event);

        // Wait for processing
        await Task.Delay(500);

        // Assert
        var consumedMessages = consumerHarness.Consumed.Select<CustomerCreatedEvent>().ToList();
        consumedMessages.Should().HaveCount(2);

        var tenant1Message = consumedMessages.First(m => m.Context.Message.TenantId == tenant1Id);
        var tenant2Message = consumedMessages.First(m => m.Context.Message.TenantId == tenant2Id);

        tenant1Message.Context.Message.CompanyName.Should().Be("Tenant 1 Customer");
        tenant2Message.Context.Message.CompanyName.Should().Be("Tenant 2 Customer");
    }
}
