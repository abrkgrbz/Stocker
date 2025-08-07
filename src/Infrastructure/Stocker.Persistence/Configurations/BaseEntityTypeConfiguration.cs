using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Persistence.Configurations;

public abstract class BaseEntityTypeConfiguration<TEntity, TId> : IEntityTypeConfiguration<TEntity>
    where TEntity : Entity<TId>
    where TId : notnull
{
    public virtual void Configure(EntityTypeBuilder<TEntity> builder)
    {
        // Configure primary key
        builder.HasKey(e => e.Id);

        // Configure Id property
        builder.Property(e => e.Id)
            .ValueGeneratedNever(); // We generate IDs in domain

        // Ignore domain events (not persisted)
        builder.Ignore(e => e.DomainEvents);
    }
}

public abstract class BaseEntityTypeConfiguration<TEntity> : BaseEntityTypeConfiguration<TEntity, Guid>
    where TEntity : Entity<Guid>
{
}