using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class MeetingConfiguration : IEntityTypeConfiguration<Meeting>
{
    public void Configure(EntityTypeBuilder<Meeting> builder)
    {
        builder.ToTable("Meetings", "crm");

        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .ValueGeneratedNever();

        builder.Property(m => m.TenantId)
            .IsRequired();

        builder.Property(m => m.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(m => m.Description)
            .HasMaxLength(2000);

        builder.Property(m => m.Timezone)
            .HasMaxLength(50);

        builder.Property(m => m.Location)
            .HasMaxLength(500);

        builder.Property(m => m.MeetingRoom)
            .HasMaxLength(100);

        builder.Property(m => m.OnlineMeetingLink)
            .HasMaxLength(500);

        builder.Property(m => m.OnlineMeetingPlatform)
            .HasMaxLength(50);

        builder.Property(m => m.MeetingPassword)
            .HasMaxLength(50);

        builder.Property(m => m.DialInNumber)
            .HasMaxLength(50);

        builder.Property(m => m.OrganizerName)
            .HasMaxLength(200);

        builder.Property(m => m.OrganizerEmail)
            .HasMaxLength(255);

        builder.Property(m => m.Agenda)
            .HasColumnType("text");

        builder.Property(m => m.Notes)
            .HasColumnType("text");

        builder.Property(m => m.Outcome)
            .HasMaxLength(2000);

        builder.Property(m => m.ActionItems)
            .HasColumnType("text");

        builder.Property(m => m.RecurrencePattern)
            .HasMaxLength(500);

        builder.Property(m => m.RecordingUrl)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(m => m.Customer)
            .WithMany()
            .HasForeignKey(m => m.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.Contact)
            .WithMany()
            .HasForeignKey(m => m.ContactId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.Lead)
            .WithMany()
            .HasForeignKey(m => m.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.Opportunity)
            .WithMany()
            .HasForeignKey(m => m.OpportunityId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.Deal)
            .WithMany()
            .HasForeignKey(m => m.DealId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.Campaign)
            .WithMany()
            .HasForeignKey(m => m.CampaignId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(m => m.ParentMeeting)
            .WithMany()
            .HasForeignKey(m => m.ParentMeetingId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(m => m.Attendees)
            .WithOne(a => a.Meeting)
            .HasForeignKey(a => a.MeetingId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(m => m.TenantId);
        builder.HasIndex(m => new { m.TenantId, m.StartTime });
        builder.HasIndex(m => new { m.TenantId, m.Status });
        builder.HasIndex(m => new { m.TenantId, m.OrganizerId });
        builder.HasIndex(m => new { m.TenantId, m.CustomerId });
    }
}

public class MeetingAttendeeConfiguration : IEntityTypeConfiguration<MeetingAttendee>
{
    public void Configure(EntityTypeBuilder<MeetingAttendee> builder)
    {
        builder.ToTable("MeetingAttendees", "crm");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .ValueGeneratedNever();

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.Email)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(a => a.Name)
            .HasMaxLength(200);

        builder.Property(a => a.ResponseNote)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(a => a.Contact)
            .WithMany()
            .HasForeignKey(a => a.ContactId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.MeetingId, a.Email }).IsUnique();
    }
}
