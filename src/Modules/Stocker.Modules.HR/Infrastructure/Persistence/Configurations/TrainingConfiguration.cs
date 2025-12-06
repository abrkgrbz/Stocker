using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for Training
/// </summary>
public class TrainingConfiguration : IEntityTypeConfiguration<Training>
{
    public void Configure(EntityTypeBuilder<Training> builder)
    {
        builder.ToTable("Trainings", "hr");

        builder.HasKey(t => t.Id);

        builder.Property(t => t.TenantId)
            .IsRequired();

        builder.Property(t => t.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(t => t.Description)
            .HasMaxLength(2000);

        builder.Property(t => t.Provider)
            .HasMaxLength(200);

        builder.Property(t => t.Instructor)
            .HasMaxLength(200);

        builder.Property(t => t.Location)
            .HasMaxLength(200);

        builder.Property(t => t.OnlineUrl)
            .HasMaxLength(500);

        builder.Property(t => t.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(t => t.Cost)
            .HasPrecision(18, 2);

        builder.Property(t => t.Currency)
            .HasMaxLength(10);

        builder.Property(t => t.CertificationName)
            .HasMaxLength(200);

        builder.Property(t => t.CancellationReason)
            .HasMaxLength(500);

        builder.Property(t => t.Notes)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(t => t.TenantId);
        builder.HasIndex(t => new { t.TenantId, t.Code }).IsUnique();
        builder.HasIndex(t => new { t.TenantId, t.Status });
        builder.HasIndex(t => new { t.TenantId, t.StartDate, t.EndDate });
        builder.HasIndex(t => new { t.TenantId, t.IsMandatory });
    }
}
