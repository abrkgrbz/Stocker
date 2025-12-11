using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class CallLogConfiguration : IEntityTypeConfiguration<CallLog>
{
    public void Configure(EntityTypeBuilder<CallLog> builder)
    {
        builder.ToTable("CallLogs", "crm");

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .ValueGeneratedNever();

        builder.Property(c => c.TenantId)
            .IsRequired();

        builder.Property(c => c.CallNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.CallerNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.CalledNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.Extension)
            .HasMaxLength(20);

        builder.Property(c => c.ForwardedTo)
            .HasMaxLength(50);

        builder.Property(c => c.AgentName)
            .HasMaxLength(200);

        builder.Property(c => c.QueueName)
            .HasMaxLength(100);

        builder.Property(c => c.OutcomeDescription)
            .HasMaxLength(500);

        builder.Property(c => c.FollowUpNote)
            .HasMaxLength(1000);

        builder.Property(c => c.RecordingUrl)
            .HasMaxLength(500);

        builder.Property(c => c.Transcript)
            .HasColumnType("nvarchar(max)");

        builder.Property(c => c.QualityNotes)
            .HasMaxLength(2000);

        builder.Property(c => c.Notes)
            .HasMaxLength(2000);

        builder.Property(c => c.Summary)
            .HasMaxLength(1000);

        builder.Property(c => c.Tags)
            .HasMaxLength(500);

        builder.Property(c => c.ExternalCallId)
            .HasMaxLength(100);

        builder.Property(c => c.PbxType)
            .HasMaxLength(50);

        // Relationships
        builder.HasOne(c => c.Customer)
            .WithMany()
            .HasForeignKey(c => c.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.Contact)
            .WithMany()
            .HasForeignKey(c => c.ContactId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.Lead)
            .WithMany()
            .HasForeignKey(c => c.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.Opportunity)
            .WithMany()
            .HasForeignKey(c => c.OpportunityId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(c => c.Campaign)
            .WithMany()
            .HasForeignKey(c => c.CampaignId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(c => c.TenantId);
        builder.HasIndex(c => new { c.TenantId, c.CallNumber }).IsUnique();
        builder.HasIndex(c => new { c.TenantId, c.StartTime });
        builder.HasIndex(c => new { c.TenantId, c.Status });
        builder.HasIndex(c => new { c.TenantId, c.Direction });
        builder.HasIndex(c => new { c.TenantId, c.CustomerId });
        builder.HasIndex(c => new { c.TenantId, c.AgentUserId });
    }
}
