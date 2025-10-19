using FluentAssertions;
using MassTransit.Testing;
using Stocker.IntegrationTests.Events.Fixtures;
using Stocker.Shared.Events.CRM;
using Xunit;

namespace Stocker.IntegrationTests.Events.CRM;

/// <summary>
/// Integration tests for DealWonEvent flow
/// </summary>
public class DealWonEventTests : IAsyncLifetime
{
    private readonly EventBusTestHarness _harness;

    public DealWonEventTests()
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
    public async Task DealWonEvent_ShouldBePublished_WhenDealIsClosed()
    {
        // Arrange
        var dealWonEvent = new DealWonEvent(
            DealId: Guid.NewGuid(),
            CustomerId: Guid.NewGuid(),
            TenantId: Guid.NewGuid(),
            Amount: 50000.00m,
            Currency: "USD",
            Products: new List<DealProductDto>
            {
                new DealProductDto(
                    ProductId: Guid.NewGuid(),
                    ProductName: "Enterprise License",
                    Quantity: 10,
                    UnitPrice: 5000.00m,
                    DiscountAmount: 0.00m
                )
            },
            ClosedDate: DateTime.UtcNow,
            WonBy: Guid.NewGuid()
        );

        // Act
        await _harness.PublishAsync(dealWonEvent);

        // Assert
        var published = await _harness.Published<DealWonEvent>();
        published.Should().BeTrue("DealWonEvent should be published");
    }

    [Fact]
    public async Task DealWonEvent_ShouldBeConsumed_ByAllModules()
    {
        // Arrange
        var dealWonEvent = new DealWonEvent(
            DealId: Guid.NewGuid(),
            CustomerId: Guid.NewGuid(),
            TenantId: Guid.NewGuid(),
            Amount: 100000.00m,
            Currency: "EUR",
            Products: new List<DealProductDto>
            {
                new DealProductDto(
                    ProductId: Guid.NewGuid(),
                    ProductName: "Premium Package",
                    Quantity: 5,
                    UnitPrice: 20000.00m,
                    DiscountAmount: 5000.00m
                )
            },
            ClosedDate: DateTime.UtcNow,
            WonBy: Guid.NewGuid()
        );

        var consumerHarness = _harness.GetConsumerHarness<TestDealWonEventConsumer>();

        // Act
        await _harness.PublishAsync(dealWonEvent);

        // Assert
        var consumed = await consumerHarness.Consumed.Any<DealWonEvent>();
        consumed.Should().BeTrue("DealWonEvent should be consumed by test consumer");
    }

    [Fact]
    public async Task DealWonEvent_WithMultipleProducts_ShouldBeProcessedCorrectly()
    {
        // Arrange
        var products = new List<DealProductDto>
        {
            new DealProductDto(
                ProductId: Guid.NewGuid(),
                ProductName: "Product A",
                Quantity: 10,
                UnitPrice: 1000.00m,
                DiscountAmount: 100.00m
            ),
            new DealProductDto(
                ProductId: Guid.NewGuid(),
                ProductName: "Product B",
                Quantity: 5,
                UnitPrice: 2000.00m,
                DiscountAmount: 0.00m
            ),
            new DealProductDto(
                ProductId: Guid.NewGuid(),
                ProductName: "Product C",
                Quantity: 20,
                UnitPrice: 500.00m,
                DiscountAmount: 500.00m
            )
        };

        var dealWonEvent = new DealWonEvent(
            DealId: Guid.NewGuid(),
            CustomerId: Guid.NewGuid(),
            TenantId: Guid.NewGuid(),
            Amount: 28400.00m, // (10*1000-100) + (5*2000) + (20*500-500)
            Currency: "USD",
            Products: products,
            ClosedDate: DateTime.UtcNow,
            WonBy: Guid.NewGuid()
        );

        var consumerHarness = _harness.GetConsumerHarness<TestDealWonEventConsumer>();

        // Act
        await _harness.PublishAsync(dealWonEvent);

        // Assert
        var consumed = await consumerHarness.Consumed.Any<DealWonEvent>();
        consumed.Should().BeTrue();

        var message = consumerHarness.Consumed.Select<DealWonEvent>().First().Context.Message;
        message.Products.Should().HaveCount(3);
        message.Products.Sum(p => p.Quantity * p.UnitPrice - p.DiscountAmount)
            .Should().Be(28400.00m);
    }

    [Fact]
    public async Task DealWonEvent_ShouldContainAllRequiredFields()
    {
        // Arrange
        var dealId = Guid.NewGuid();
        var customerId = Guid.NewGuid();
        var tenantId = Guid.NewGuid();
        var wonBy = Guid.NewGuid();
        var closedDate = DateTime.UtcNow;

        var dealWonEvent = new DealWonEvent(
            DealId: dealId,
            CustomerId: customerId,
            TenantId: tenantId,
            Amount: 75000.00m,
            Currency: "GBP",
            Products: new List<DealProductDto>(),
            ClosedDate: closedDate,
            WonBy: wonBy
        );

        var consumerHarness = _harness.GetConsumerHarness<TestDealWonEventConsumer>();

        // Act
        await _harness.PublishAsync(dealWonEvent);

        // Assert
        var consumed = await consumerHarness.Consumed.Any<DealWonEvent>();
        consumed.Should().BeTrue();

        var message = consumerHarness.Consumed.Select<DealWonEvent>().First().Context.Message;
        message.DealId.Should().Be(dealId);
        message.CustomerId.Should().Be(customerId);
        message.TenantId.Should().Be(tenantId);
        message.Amount.Should().Be(75000.00m);
        message.Currency.Should().Be("GBP");
        message.ClosedDate.Should().BeCloseTo(closedDate, TimeSpan.FromSeconds(1));
        message.WonBy.Should().Be(wonBy);
    }

    [Fact]
    public async Task MultipleEvents_ShouldBePublished_AndConsumed_InOrder()
    {
        // Arrange
        var events = Enumerable.Range(1, 5).Select(i => new DealWonEvent(
            DealId: Guid.NewGuid(),
            CustomerId: Guid.NewGuid(),
            TenantId: Guid.NewGuid(),
            Amount: i * 10000.00m,
            Currency: "USD",
            Products: new List<DealProductDto>(),
            ClosedDate: DateTime.UtcNow,
            WonBy: Guid.NewGuid()
        )).ToList();

        var consumerHarness = _harness.GetConsumerHarness<TestDealWonEventConsumer>();

        // Act
        foreach (var dealEvent in events)
        {
            await _harness.PublishAsync(dealEvent);
        }

        // Wait for all messages to be consumed
        await Task.Delay(1000);

        // Assert
        var consumedMessages = consumerHarness.Consumed.Select<DealWonEvent>().ToList();
        consumedMessages.Should().HaveCount(5);
    }
}
