using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Infrastructure.Persistence.Configurations;

public class SurveyResponseConfiguration : IEntityTypeConfiguration<SurveyResponse>
{
    public void Configure(EntityTypeBuilder<SurveyResponse> builder)
    {
        builder.ToTable("SurveyResponses", "crm");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Id)
            .ValueGeneratedNever();

        builder.Property(s => s.TenantId)
            .IsRequired();

        builder.Property(s => s.SurveyName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.RespondentName)
            .HasMaxLength(200);

        builder.Property(s => s.RespondentEmail)
            .HasMaxLength(255);

        builder.Property(s => s.RespondentPhone)
            .HasMaxLength(50);

        builder.Property(s => s.OverallSatisfaction)
            .HasPrecision(3, 2);

        builder.Property(s => s.OverallComment)
            .HasColumnType("nvarchar(max)");

        builder.Property(s => s.ImprovementSuggestion)
            .HasColumnType("nvarchar(max)");

        builder.Property(s => s.Praise)
            .HasMaxLength(2000);

        builder.Property(s => s.Complaint)
            .HasColumnType("nvarchar(max)");

        builder.Property(s => s.FollowUpNote)
            .HasMaxLength(2000);

        builder.Property(s => s.DeviceType)
            .HasMaxLength(50);

        builder.Property(s => s.IpAddress)
            .HasMaxLength(50);

        builder.Property(s => s.Language)
            .HasMaxLength(10);

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

        builder.HasMany(s => s.Answers)
            .WithOne(a => a.SurveyResponse)
            .HasForeignKey(a => a.SurveyResponseId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(s => s.TenantId);
        builder.HasIndex(s => new { s.TenantId, s.SurveyType });
        builder.HasIndex(s => new { s.TenantId, s.Status });
        builder.HasIndex(s => new { s.TenantId, s.CustomerId });
        builder.HasIndex(s => new { s.TenantId, s.NpsCategory });
        builder.HasIndex(s => new { s.TenantId, s.CompletedDate });
        builder.HasIndex(s => new { s.TenantId, s.FollowUpRequired });
    }
}

public class SurveyAnswerConfiguration : IEntityTypeConfiguration<SurveyAnswer>
{
    public void Configure(EntityTypeBuilder<SurveyAnswer> builder)
    {
        builder.ToTable("SurveyAnswers", "crm");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .ValueGeneratedNever();

        builder.Property(a => a.TenantId)
            .IsRequired();

        builder.Property(a => a.QuestionId)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(a => a.Question)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(a => a.Answer)
            .HasColumnType("nvarchar(max)");

        builder.Property(a => a.AnswerType)
            .HasMaxLength(50);

        // Indexes
        builder.HasIndex(a => a.TenantId);
        builder.HasIndex(a => new { a.SurveyResponseId, a.QuestionId });
    }
}
