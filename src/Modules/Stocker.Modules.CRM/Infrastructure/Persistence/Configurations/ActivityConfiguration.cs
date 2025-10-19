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
        builder.HasOne<Customer>()
            .WithMany()
            .HasForeignKey(a => a.CustomerId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne<Contact>()
            .WithMany()
            .HasForeignKey(a => a.ContactId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne<Lead>()
            .WithMany()
            .HasForeignKey(a => a.LeadId)
            .OnDelete(DeleteBehavior.NoAction);

        builder.HasOne<Opportunity>()
            .WithMany()
            .HasForeignKey(a => a.OpportunityId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<Deal>()
            .WithMany()
            .HasForeignKey(a => a.DealId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
