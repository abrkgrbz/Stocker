using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class NoteConfiguration : IEntityTypeConfiguration<Note>
{
    public void Configure(EntityTypeBuilder<Note> builder)
    {
        builder.ToTable("Notes", "crm");

        // Explicitly configure relationships to prevent shadow properties
        builder.HasOne(n => n.Customer)
            .WithMany()
            .HasForeignKey(n => n.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(n => n.Contact)
            .WithMany()
            .HasForeignKey(n => n.ContactId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(n => n.Lead)
            .WithMany()
            .HasForeignKey(n => n.LeadId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(n => n.Opportunity)
            .WithMany()
            .HasForeignKey(n => n.OpportunityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.Deal)
            .WithMany()
            .HasForeignKey(n => n.DealId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(n => n.Activity)
            .WithMany()
            .HasForeignKey(n => n.ActivityId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
