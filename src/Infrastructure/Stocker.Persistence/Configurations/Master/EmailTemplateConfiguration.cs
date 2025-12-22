using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Master.Entities;

namespace Stocker.Persistence.Configurations.Master;

public class EmailTemplateConfiguration : BaseEntityTypeConfiguration<EmailTemplate>
{
    public override void Configure(EntityTypeBuilder<EmailTemplate> builder)
    {
        base.Configure(builder);

        builder.ToTable("EmailTemplates", "master");

        // Properties
        builder.Property(e => e.TenantId)
            .IsRequired(false);

        builder.Property(e => e.TemplateKey)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(500);

        builder.Property(e => e.Subject)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(e => e.HtmlBody)
            .IsRequired()
            .HasColumnType("text");

        builder.Property(e => e.PlainTextBody)
            .HasColumnType("text");

        builder.Property(e => e.Language)
            .IsRequired()
            .HasMaxLength(10)
            .HasDefaultValue("tr");

        builder.Property(e => e.Category)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(e => e.Variables)
            .IsRequired()
            .HasColumnType("jsonb")
            .HasDefaultValue("[]");

        builder.Property(e => e.SampleData)
            .HasColumnType("jsonb");

        builder.Property(e => e.IsActive)
            .IsRequired()
            .HasDefaultValue(true);

        builder.Property(e => e.IsSystem)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(e => e.Version)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(e => e.CreatedAt)
            .IsRequired();

        builder.Property(e => e.UpdatedAt);

        builder.Property(e => e.CreatedBy)
            .HasMaxLength(256);

        builder.Property(e => e.UpdatedBy)
            .HasMaxLength(256);

        // Indexes
        // Unique index for template key + language + tenant (null tenant = system template)
        builder.HasIndex(e => new { e.TemplateKey, e.Language, e.TenantId })
            .IsUnique()
            .HasDatabaseName("IX_EmailTemplates_TemplateKey_Language_TenantId");

        // Index for finding templates by tenant
        builder.HasIndex(e => e.TenantId)
            .HasDatabaseName("IX_EmailTemplates_TenantId");

        // Index for finding active templates
        builder.HasIndex(e => e.IsActive)
            .HasDatabaseName("IX_EmailTemplates_IsActive");

        // Index for finding system templates
        builder.HasIndex(e => e.IsSystem)
            .HasDatabaseName("IX_EmailTemplates_IsSystem");

        // Index for category filtering
        builder.HasIndex(e => e.Category)
            .HasDatabaseName("IX_EmailTemplates_Category");
    }
}
