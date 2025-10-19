using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class DealConfiguration : IEntityTypeConfiguration<Deal>
{
    public void Configure(EntityTypeBuilder<Deal> builder)
    {
        builder.ToTable("Deals", "crm");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Id)
            .ValueGeneratedNever();

        builder.Property(d => d.TenantId)
            .IsRequired();

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Description)
            .HasMaxLength(2000);

        // Money value objects
        builder.OwnsOne(d => d.Value, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("Value")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        builder.OwnsOne(d => d.RecurringValue, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("RecurringValue")
                .HasPrecision(18, 2);

            money.Property(m => m.Currency)
                .HasColumnName("RecurringCurrency")
                .HasMaxLength(3);
        });

        // Foreign keys
        builder.Property(d => d.CustomerId);
        builder.Property(d => d.ContactId);
        builder.Property(d => d.PipelineId).IsRequired();
        builder.Property(d => d.StageId).IsRequired();
        builder.Property(d => d.OwnerId).IsRequired();

        // Relationships
        builder.HasOne(d => d.Customer)
            .WithMany()
            .HasForeignKey(d => d.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Contact)
            .WithMany()
            .HasForeignKey(d => d.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Pipeline)
            .WithMany()
            .HasForeignKey(d => d.PipelineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.Stage)
            .WithMany()
            .HasForeignKey(d => d.StageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(d => d.Products)
            .WithOne()
            .HasForeignKey(dp => dp.DealId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(d => d.Activities)
            .WithOne()
            .HasForeignKey("DealId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(d => d.Notes)
            .WithOne()
            .HasForeignKey("DealId")
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(d => d.TenantId);
        builder.HasIndex(d => new { d.TenantId, d.PipelineId });
        builder.HasIndex(d => new { d.TenantId, d.StageId });
        builder.HasIndex(d => new { d.TenantId, d.CustomerId });
        builder.HasIndex(d => new { d.TenantId, d.Status });
        builder.HasIndex(d => new { d.TenantId, d.ExpectedCloseDate });
    }
}
