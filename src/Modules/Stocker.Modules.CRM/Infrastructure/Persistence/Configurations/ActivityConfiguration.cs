using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class ActivityConfiguration : IEntityTypeConfiguration<Activity>
{
    public void Configure(EntityTypeBuilder<Activity> builder)
    {
        builder.ToTable("Activities", "crm");

        // Explicitly configure relationships to prevent shadow properties
        builder.HasOne(a => a.Customer)
            .WithMany()
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(a => a.Contact)
            .WithMany()
            .HasForeignKey(a => a.ContactId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(a => a.Lead)
            .WithMany()
            .HasForeignKey(a => a.LeadId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne(a => a.Opportunity)
            .WithMany()
            .HasForeignKey(a => a.OpportunityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(a => a.Deal)
            .WithMany()
            .HasForeignKey(a => a.DealId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
