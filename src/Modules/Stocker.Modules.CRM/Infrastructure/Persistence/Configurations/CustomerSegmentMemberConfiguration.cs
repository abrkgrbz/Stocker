using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class CustomerSegmentMemberConfiguration : IEntityTypeConfiguration<CustomerSegmentMember>
{
    public void Configure(EntityTypeBuilder<CustomerSegmentMember> builder)
    {
        builder.ToTable("CustomerSegmentMembers", "crm");

        builder.HasKey(csm => csm.Id);

        builder.Property(csm => csm.Id)
            .ValueGeneratedNever();

        builder.Property(csm => csm.TenantId)
            .IsRequired();

        builder.Property(csm => csm.SegmentId)
            .IsRequired();

        builder.Property(csm => csm.CustomerId)
            .IsRequired();

        builder.Property(csm => csm.AddedAt)
            .IsRequired();

        builder.Property(csm => csm.Reason)
            .IsRequired();

        // Relationships
        builder.HasOne(csm => csm.Segment)
            .WithMany(s => s.Members)
            .HasForeignKey(csm => csm.SegmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(csm => csm.Customer)
            .WithMany()
            .HasForeignKey(csm => csm.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);

        // Indexes
        builder.HasIndex(csm => csm.TenantId);
        builder.HasIndex(csm => new { csm.TenantId, csm.SegmentId });
        builder.HasIndex(csm => new { csm.TenantId, csm.CustomerId });
        builder.HasIndex(csm => new { csm.SegmentId, csm.CustomerId })
            .IsUnique();
    }
}
