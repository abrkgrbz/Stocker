using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class SocialMediaProfileConfiguration : IEntityTypeConfiguration<SocialMediaProfile>
{
    public void Configure(EntityTypeBuilder<SocialMediaProfile> builder)
    {
        builder.ToTable("SocialMediaProfiles", "crm");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.ProfileUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(s => s.Username)
            .HasMaxLength(100);

        builder.Property(s => s.ProfileId)
            .HasMaxLength(100);

        builder.Property(s => s.DisplayName)
            .HasMaxLength(200);

        builder.Property(s => s.Bio)
            .HasMaxLength(2000);

        builder.Property(s => s.ProfileImageUrl)
            .HasMaxLength(500);

        builder.Property(s => s.CoverImageUrl)
            .HasMaxLength(500);

        builder.Property(s => s.Website)
            .HasMaxLength(500);

        builder.Property(s => s.Location)
            .HasMaxLength(200);

        builder.Property(s => s.EngagementRate)
            .HasPrecision(5, 2);

        builder.Property(s => s.AverageLikesPerPost)
            .HasPrecision(10, 2);

        builder.Property(s => s.AverageCommentsPerPost)
            .HasPrecision(10, 2);

        builder.Property(s => s.AverageSharesPerPost)
            .HasPrecision(10, 2);

        builder.Property(s => s.TargetAudience)
            .HasMaxLength(500);

        builder.Property(s => s.ContentCategories)
            .HasMaxLength(500);

        builder.Property(s => s.LastInteractionType)
            .HasMaxLength(50);

        builder.Property(s => s.Notes)
            .HasMaxLength(2000);

        builder.Property(s => s.Tags)
            .HasMaxLength(500);

        // Relationships
        builder.HasOne(s => s.Customer)
            .WithMany()
            .HasForeignKey(s => s.CustomerId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.Contact)
            .WithMany()
            .HasForeignKey(s => s.ContactId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.Lead)
            .WithMany()
            .HasForeignKey(s => s.LeadId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(s => s.Campaign)
            .WithMany()
            .HasForeignKey(s => s.CampaignId)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => new { s.TenantId, s.Platform });
        builder.HasIndex(s => new { s.TenantId, s.CustomerId });
        builder.HasIndex(s => new { s.TenantId, s.IsActive });
        builder.HasIndex(s => new { s.TenantId, s.InfluencerLevel });
        builder.HasIndex(s => new { s.TenantId, s.FollowsOurBrand });
    }
}
