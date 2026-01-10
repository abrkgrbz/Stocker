using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Persistence.Contexts;


public abstract class BaseDbContext : DbContext
{
    private readonly IDomainEventDispatcher? _domainEventDispatcher;

    protected BaseDbContext(DbContextOptions options) : base(options)
    {
    }

    protected BaseDbContext(DbContextOptions options, IDomainEventDispatcher domainEventDispatcher) : base(options)
    {
        _domainEventDispatcher = domainEventDispatcher;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Configuration'lar her context tarafından kendi ihtiyacına göre uygulanacak
        // modelBuilder.ApplyConfigurationsFromAssembly(GetType().Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var domainEvents = ChangeTracker
            .Entries<Entity>()
            .Select(entry => entry.Entity)
            .SelectMany(entity =>
            {
                var domainEvents = entity.DomainEvents.ToList();
                entity.ClearDomainEvents();
                return domainEvents;
            })
            .ToList();

        var result = await base.SaveChangesAsync(cancellationToken);

        // Dispatch domain events after successful save
        if (domainEvents.Count > 0 && _domainEventDispatcher != null)
        {
            await _domainEventDispatcher.DispatchEventsAsync(domainEvents, cancellationToken);
        }

        return result;
    }

    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        base.ConfigureConventions(configurationBuilder);

        configurationBuilder.Properties<string>()
            .HaveMaxLength(256);

        configurationBuilder.Properties<decimal>()
            .HavePrecision(18, 2);
    }
}
