using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class OpportunityConfiguration : IEntityTypeConfiguration<Opportunity>
{
    public void Configure(EntityTypeBuilder<Opportunity> builder)
    {
        builder.ToTable("Opportunities", "sales");

        builder.HasKey(o => o.Id);

        // Link to CRM.Opportunity for synchronization when both modules are active
        builder.Property(o => o.CrmOpportunityId)
            .IsRequired(false);

        builder.HasIndex(o => new { o.TenantId, o.CrmOpportunityId })
            .HasFilter("\"CrmOpportunityId\" IS NOT NULL")
            .IsUnique();

        builder.Property(o => o.OpportunityNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(o => o.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(o => o.Description)
            .HasMaxLength(2000);

        // Customer
        builder.Property(o => o.CustomerName)
            .HasMaxLength(200);

        builder.Property(o => o.ContactName)
            .HasMaxLength(100);

        builder.Property(o => o.ContactEmail)
            .HasMaxLength(200);

        builder.Property(o => o.ContactPhone)
            .HasMaxLength(50);

        // Pipeline
        builder.Property(o => o.Stage)
            .HasConversion<string>()
            .HasMaxLength(20);

        builder.Property(o => o.Source)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(o => o.Priority)
            .HasConversion<string>()
            .HasMaxLength(20);

        // Dynamic Pipeline (Phase 2)
        // Note: PipelineId and PipelineStageId are Guid? - EF handles them automatically

        // Value
        builder.Property(o => o.EstimatedValue)
            .HasPrecision(18, 2);

        builder.Property(o => o.Currency)
            .HasMaxLength(3)
            .HasDefaultValue("TRY");

        // Outcome
        builder.Property(o => o.ClosedReason)
            .HasMaxLength(500);

        builder.Property(o => o.LostToCompetitor)
            .HasMaxLength(200);

        // Assignment
        builder.Property(o => o.SalesPersonName)
            .HasMaxLength(100);

        // Related Documents
        builder.Property(o => o.QuotationNumber)
            .HasMaxLength(50);

        builder.Property(o => o.SalesOrderNumber)
            .HasMaxLength(50);

        // Metadata
        builder.Property(o => o.Notes)
            .HasMaxLength(4000);

        builder.Property(o => o.Tags)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(o => o.TenantId);
        builder.HasIndex(o => o.OpportunityNumber);
        builder.HasIndex(o => new { o.TenantId, o.OpportunityNumber }).IsUnique();
        builder.HasIndex(o => o.CustomerId);
        builder.HasIndex(o => o.Stage);
        builder.HasIndex(o => o.SalesPersonId);
        builder.HasIndex(o => o.ExpectedCloseDate);
        builder.HasIndex(o => new { o.TenantId, o.Stage, o.IsWon, o.IsLost });
        builder.HasIndex(o => o.QuotationId);
        builder.HasIndex(o => o.SalesOrderId);

        // Dynamic Pipeline indexes (Phase 2)
        builder.HasIndex(o => o.PipelineId);
        builder.HasIndex(o => o.PipelineStageId);
        builder.HasIndex(o => new { o.TenantId, o.PipelineId, o.PipelineStageId });

        // Global Query Filter for Multi-tenancy
        // builder.HasQueryFilter(o => o.TenantId == CurrentTenantId);
    }
}
