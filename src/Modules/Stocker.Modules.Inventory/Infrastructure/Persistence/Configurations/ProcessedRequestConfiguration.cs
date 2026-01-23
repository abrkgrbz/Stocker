using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Infrastructure.Persistence.Configurations;

public class ProcessedRequestConfiguration : IEntityTypeConfiguration<ProcessedRequest>
{
    public void Configure(EntityTypeBuilder<ProcessedRequest> builder)
    {
        builder.ToTable("ProcessedRequests", "inventory");

        builder.HasKey(pr => pr.Id);

        builder.Property(pr => pr.CommandName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(pr => pr.ProcessedAt)
            .IsRequired();

        builder.HasIndex(pr => pr.ProcessedAt);
    }
}
