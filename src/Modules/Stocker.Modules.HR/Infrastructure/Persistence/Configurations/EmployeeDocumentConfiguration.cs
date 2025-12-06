using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.HR.Domain.Entities;

namespace Stocker.Modules.HR.Infrastructure.Persistence.Configurations;

/// <summary>
/// Entity configuration for EmployeeDocument
/// </summary>
public class EmployeeDocumentConfiguration : IEntityTypeConfiguration<EmployeeDocument>
{
    public void Configure(EntityTypeBuilder<EmployeeDocument> builder)
    {
        builder.ToTable("EmployeeDocuments", "hr");

        builder.HasKey(ed => ed.Id);

        builder.Property(ed => ed.TenantId)
            .IsRequired();

        builder.Property(ed => ed.DocumentType)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(ed => ed.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(ed => ed.Description)
            .HasMaxLength(1000);

        builder.Property(ed => ed.DocumentNumber)
            .HasMaxLength(100);

        builder.Property(ed => ed.IssuingAuthority)
            .HasMaxLength(200);

        builder.Property(ed => ed.FileUrl)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(ed => ed.FileName)
            .IsRequired()
            .HasMaxLength(255);

        builder.Property(ed => ed.FileType)
            .HasMaxLength(100);

        builder.Property(ed => ed.Notes)
            .HasMaxLength(1000);

        // Relationships
        builder.HasOne(ed => ed.Employee)
            .WithMany(e => e.Documents)
            .HasForeignKey(ed => ed.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ed => ed.VerifiedBy)
            .WithMany()
            .HasForeignKey(ed => ed.VerifiedById)
            .OnDelete(DeleteBehavior.SetNull);

        // Indexes
        builder.HasIndex(ed => ed.TenantId);
        builder.HasIndex(ed => new { ed.TenantId, ed.EmployeeId });
        builder.HasIndex(ed => new { ed.TenantId, ed.DocumentType });
        builder.HasIndex(ed => new { ed.TenantId, ed.ExpiryDate });
        builder.HasIndex(ed => new { ed.TenantId, ed.IsActive });
    }
}
