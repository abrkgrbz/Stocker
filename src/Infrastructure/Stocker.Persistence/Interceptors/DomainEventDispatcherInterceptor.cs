using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Persistence.Interceptors;

/// <summary>
/// EF Core interceptor that dispatches domain events after successful SaveChanges.
/// This interceptor is compatible with DbContext pooling as it receives IDomainEventDispatcher via DI.
/// </summary>
public class DomainEventDispatcherInterceptor : SaveChangesInterceptor
{
    private readonly IDomainEventDispatcher _domainEventDispatcher;

    public DomainEventDispatcherInterceptor(IDomainEventDispatcher domainEventDispatcher)
    {
        _domainEventDispatcher = domainEventDispatcher;
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        await DispatchDomainEventsAsync(eventData.Context, cancellationToken);
        return await base.SavedChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        // Sync version - dispatch events synchronously
        DispatchDomainEventsAsync(eventData.Context, CancellationToken.None).GetAwaiter().GetResult();
        return base.SavedChanges(eventData, result);
    }

    private async Task DispatchDomainEventsAsync(DbContext? context, CancellationToken cancellationToken)
    {
        if (context == null) return;

        var domainEvents = context.ChangeTracker
            .Entries<Entity>()
            .Select(entry => entry.Entity)
            .SelectMany(entity =>
            {
                var events = entity.DomainEvents.ToList();
                entity.ClearDomainEvents();
                return events;
            })
            .ToList();

        if (domainEvents.Count > 0)
        {
            await _domainEventDispatcher.DispatchEventsAsync(domainEvents, cancellationToken);
        }
    }
}
