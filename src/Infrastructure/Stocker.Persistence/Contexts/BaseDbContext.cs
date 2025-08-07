using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Persistence.Contexts;
 

public abstract class BaseDbContext : DbContext
{
    protected BaseDbContext(DbContextOptions options) : base(options)
    {
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
         
        await DispatchDomainEventsAsync(domainEvents, cancellationToken);

        return result;
    }

    protected virtual Task DispatchDomainEventsAsync(List<IDomainEvent> domainEvents, CancellationToken cancellationToken)
    {
       
        return Task.CompletedTask;
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