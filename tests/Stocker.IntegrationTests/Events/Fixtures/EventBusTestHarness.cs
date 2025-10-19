using MassTransit;
using MassTransit.Testing;
using Microsoft.Extensions.DependencyInjection;
using Stocker.Shared.Events.CRM;

namespace Stocker.IntegrationTests.Events.Fixtures;

/// <summary>
/// Test harness for event bus integration testing
/// </summary>
public class EventBusTestHarness : IAsyncDisposable
{
    private readonly ServiceProvider _serviceProvider;
    private readonly ITestHarness _testHarness;

    public EventBusTestHarness()
    {
        var services = new ServiceCollection();

        // Configure MassTransit for testing
        services.AddMassTransitTestHarness(cfg =>
        {
            // Add all consumers that we want to test
            cfg.AddConsumer<TestDealWonEventConsumer>();
            cfg.AddConsumer<TestCustomerCreatedEventConsumer>();
            cfg.AddConsumer<TestCustomerUpdatedEventConsumer>();
        });

        _serviceProvider = services.BuildServiceProvider(true);
        _testHarness = _serviceProvider.GetRequiredService<ITestHarness>();
    }

    /// <summary>
    /// Start the test harness
    /// </summary>
    public async Task StartAsync(CancellationToken cancellationToken = default)
    {
        await _testHarness.Start();
    }

    /// <summary>
    /// Stop the test harness
    /// </summary>
    public async Task StopAsync(CancellationToken cancellationToken = default)
    {
        await _testHarness.Stop();
    }

    /// <summary>
    /// Publish an event to the test bus
    /// </summary>
    public async Task PublishAsync<T>(T message, CancellationToken cancellationToken = default)
        where T : class
    {
        await _testHarness.Bus.Publish(message, cancellationToken);
    }

    /// <summary>
    /// Get consumer test harness
    /// </summary>
    public IConsumerTestHarness<TConsumer> GetConsumerHarness<TConsumer>()
        where TConsumer : class, IConsumer
    {
        return _testHarness.GetConsumerHarness<TConsumer>();
    }

    /// <summary>
    /// Check if a message was published
    /// </summary>
    public Task<bool> Published<T>(CancellationToken cancellationToken = default)
        where T : class
    {
        return _testHarness.Published.Any<T>(cancellationToken);
    }

    /// <summary>
    /// Check if a message was consumed
    /// </summary>
    public Task<bool> Consumed<T>(CancellationToken cancellationToken = default)
        where T : class
    {
        return _testHarness.Consumed.Any<T>(cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        await _testHarness.Stop();
        await _serviceProvider.DisposeAsync();
    }
}

/// <summary>
/// Test consumer for DealWonEvent
/// </summary>
public class TestDealWonEventConsumer : IConsumer<DealWonEvent>
{
    public Task Consume(ConsumeContext<DealWonEvent> context)
    {
        // Test consumer - just receives the message
        return Task.CompletedTask;
    }
}

/// <summary>
/// Test consumer for CustomerCreatedEvent
/// </summary>
public class TestCustomerCreatedEventConsumer : IConsumer<CustomerCreatedEvent>
{
    public Task Consume(ConsumeContext<CustomerCreatedEvent> context)
    {
        // Test consumer - just receives the message
        return Task.CompletedTask;
    }
}

/// <summary>
/// Test consumer for CustomerUpdatedEvent
/// </summary>
public class TestCustomerUpdatedEventConsumer : IConsumer<CustomerUpdatedEvent>
{
    public Task Consume(ConsumeContext<CustomerUpdatedEvent> context)
    {
        // Test consumer - just receives the message
        return Task.CompletedTask;
    }
}
