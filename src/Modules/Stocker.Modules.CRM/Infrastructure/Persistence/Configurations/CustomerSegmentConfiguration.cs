using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class CustomerSegmentConfiguration : IEntityTypeConfiguration<CustomerSegment>
{
    public void Configure(EntityTypeBuilder<CustomerSegment> builder)
    {
        builder.ToTable("CustomerSegments", "crm");

        builder.HasKey(cs => cs.Id);

        builder.Property(cs => cs.Id)
            .ValueGeneratedNever();

        builder.Property(cs => cs.TenantId)
            .IsRequired();

        builder.Property(cs => cs.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(cs => cs.Description)
            .HasMaxLength(1000);

        builder.Property(cs => cs.Type)
            .IsRequired();

        builder.Property(cs => cs.Criteria)
            .HasColumnType("text");

        builder.Property(cs => cs.Color)
            .IsRequired();

        builder.Property(cs => cs.IsActive)
            .IsRequired();

        builder.Property(cs => cs.MemberCount)
            .IsRequired();

        builder.Property(cs => cs.CreatedBy)
            .IsRequired();

        builder.Property(cs => cs.LastModifiedBy);

        // Relationships
        builder.HasMany(cs => cs.Members)
            .WithOne(m => m.Segment)
            .HasForeignKey(m => m.SegmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(cs => cs.TenantId);
        builder.HasIndex(cs => new { cs.TenantId, cs.IsActive });
        builder.HasIndex(cs => new { cs.TenantId, cs.Type });
    }
}
