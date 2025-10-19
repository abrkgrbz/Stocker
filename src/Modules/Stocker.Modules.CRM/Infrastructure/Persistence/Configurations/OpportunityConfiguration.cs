using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class OpportunityConfiguration : IEntityTypeConfiguration<Opportunity>
{
    public void Configure(EntityTypeBuilder<Opportunity> builder)
    {
        builder.ToTable("Opportunities", "crm");

        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .ValueGeneratedNever();

        builder.Property(o => o.TenantId)
            .IsRequired();

        builder.Property(o => o.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.Description)
            .HasMaxLength(2000);

        // Money value object
        builder.OwnsOne(o => o.Amount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("Amount")
                .HasPrecision(18, 2)
                .IsRequired();

            money.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .IsRequired();
        });

        // Foreign keys
        builder.Property(o => o.CustomerId);
        builder.Property(o => o.ContactId);
        builder.Property(o => o.LeadId);
        builder.Property(o => o.PipelineId).IsRequired();
        builder.Property(o => o.StageId).IsRequired();
        builder.Property(o => o.CampaignId);
        builder.Property(o => o.ParentOpportunityId);
        builder.Property(o => o.OwnerId).IsRequired();

        // Relationships
        builder.HasOne(o => o.Customer)
            .WithMany()
            .HasForeignKey(o => o.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Contact)
            .WithMany()
            .HasForeignKey(o => o.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Lead)
            .WithMany()
            .HasForeignKey(o => o.LeadId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Pipeline)
            .WithMany()
            .HasForeignKey(o => o.PipelineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Stage)
            .WithMany()
            .HasForeignKey(o => o.StageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.Campaign)
            .WithMany()
            .HasForeignKey(o => o.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(o => o.ParentOpportunity)
            .WithMany()
            .HasForeignKey(o => o.ParentOpportunityId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(o => o.Products)
            .WithOne(op => op.Opportunity)
            .HasForeignKey(op => op.OpportunityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.Activities)
            .WithOne(a => a.Opportunity)
            .HasForeignKey("OpportunityId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(o => o.Notes)
            .WithOne(n => n.Opportunity)
            .HasForeignKey("OpportunityId")
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(o => o.TenantId);
        builder.HasIndex(o => new { o.TenantId, o.PipelineId });
        builder.HasIndex(o => new { o.TenantId, o.StageId });
        builder.HasIndex(o => new { o.TenantId, o.CustomerId });
        builder.HasIndex(o => new { o.TenantId, o.LeadId });
        builder.HasIndex(o => new { o.TenantId, o.Status });
        builder.HasIndex(o => new { o.TenantId, o.ExpectedCloseDate });
    }
}
