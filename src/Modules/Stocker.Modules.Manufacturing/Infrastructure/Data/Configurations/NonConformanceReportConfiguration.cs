using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class NonConformanceReportConfiguration : IEntityTypeConfiguration<NonConformanceReport>
{
    public void Configure(EntityTypeBuilder<NonConformanceReport> builder)
    {
        builder.ToTable("NonConformanceReports");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.NcrNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Source)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Severity)
            .IsRequired()
            .HasConversion<int>();

        // Ürün bilgileri
        builder.Property(x => x.ProductCode)
            .HasMaxLength(50);

        builder.Property(x => x.ProductName)
            .HasMaxLength(200);

        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.SerialNumber)
            .HasMaxLength(100);

        builder.Property(x => x.AffectedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.Unit)
            .IsRequired()
            .HasMaxLength(20);

        // Lokasyon
        builder.Property(x => x.DetectionLocation)
            .HasMaxLength(200);

        // Uygunsuzluk detayları
        builder.Property(x => x.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(x => x.DefectType)
            .HasMaxLength(100);

        builder.Property(x => x.DefectCode)
            .HasMaxLength(50);

        builder.Property(x => x.SpecificationReference)
            .HasMaxLength(200);

        builder.Property(x => x.ActualValue)
            .HasMaxLength(200);

        builder.Property(x => x.ExpectedValue)
            .HasMaxLength(200);

        // Tespit bilgileri
        builder.Property(x => x.DetectedBy)
            .HasMaxLength(100);

        // Soruşturma
        builder.Property(x => x.InvestigationNotes)
            .HasMaxLength(4000);

        builder.Property(x => x.InvestigatedBy)
            .HasMaxLength(100);

        // Kök neden analizi
        builder.Property(x => x.RootCauseCategory)
            .HasConversion<int?>();

        builder.Property(x => x.RootCauseDescription)
            .HasMaxLength(2000);

        builder.Property(x => x.FiveWhyAnalysis)
            .HasColumnType("jsonb");

        builder.Property(x => x.IshikawaDiagram)
            .HasColumnType("jsonb");

        // Karar (Disposition)
        builder.Property(x => x.Disposition)
            .HasConversion<int?>();

        builder.Property(x => x.DispositionReason)
            .HasMaxLength(1000);

        builder.Property(x => x.DispositionApprovedBy)
            .HasMaxLength(100);

        // Etkilenen taraflar
        builder.Property(x => x.CustomerName)
            .HasMaxLength(200);

        builder.Property(x => x.SupplierName)
            .HasMaxLength(200);

        // Maliyet
        builder.Property(x => x.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(x => x.ActualCost)
            .HasPrecision(18, 2);

        builder.Property(x => x.CostBreakdown)
            .HasColumnType("jsonb");

        // Kapatma
        builder.Property(x => x.ClosedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ClosureNotes)
            .HasMaxLength(2000);

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.Property(x => x.Attachments)
            .HasColumnType("jsonb");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        // Navigation properties
        builder.HasOne(x => x.ProductionOrder)
            .WithMany()
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductionOperation)
            .WithMany()
            .HasForeignKey(x => x.ProductionOperationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.WorkCenter)
            .WithMany()
            .HasForeignKey(x => x.WorkCenterId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => new { x.TenantId, x.NcrNumber }).IsUnique();
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.ProductionOrderId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Source);
        builder.HasIndex(x => x.Severity);
        builder.HasIndex(x => x.DetectionDate);
        builder.HasIndex(x => x.CustomerId);
        builder.HasIndex(x => x.SupplierId);
        builder.HasIndex(x => x.IsActive);
    }
}

public class NcrContainmentActionConfiguration : IEntityTypeConfiguration<NcrContainmentAction>
{
    public void Configure(EntityTypeBuilder<NcrContainmentAction> builder)
    {
        builder.ToTable("NcrContainmentActions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Action)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.ResponsiblePerson)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Result)
            .HasMaxLength(1000);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        // Navigation
        builder.HasOne(x => x.NonConformanceReport)
            .WithMany(x => x.ContainmentActions)
            .HasForeignKey(x => x.NonConformanceReportId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.NonConformanceReportId);
        builder.HasIndex(x => x.DueDate);
        builder.HasIndex(x => x.IsCompleted);
    }
}

public class CorrectivePreventiveActionConfiguration : IEntityTypeConfiguration<CorrectivePreventiveAction>
{
    public void Configure(EntityTypeBuilder<CorrectivePreventiveAction> builder)
    {
        builder.ToTable("CorrectivePreventiveActions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.CapaNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Type)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(x => x.Priority)
            .IsRequired()
            .HasConversion<int>();

        // Aksiyon detayları
        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(2000);

        builder.Property(x => x.ObjectiveStatement)
            .HasMaxLength(1000);

        builder.Property(x => x.ScopeDefinition)
            .HasMaxLength(1000);

        // Sorumluluk
        builder.Property(x => x.ResponsiblePerson)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ResponsibleDepartment)
            .HasMaxLength(100);

        // İlerleme
        builder.Property(x => x.CompletionPercent)
            .HasPrecision(5, 2);

        // Kök neden
        builder.Property(x => x.RootCauseCategory)
            .HasConversion<int?>();

        builder.Property(x => x.RootCauseDescription)
            .HasMaxLength(2000);

        // Uygulama
        builder.Property(x => x.ActionPlan)
            .HasMaxLength(4000);

        builder.Property(x => x.ImplementationNotes)
            .HasMaxLength(4000);

        builder.Property(x => x.ResourcesRequired)
            .HasMaxLength(1000);

        builder.Property(x => x.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(x => x.ActualCost)
            .HasPrecision(18, 2);

        // Doğrulama
        builder.Property(x => x.VerificationMethod)
            .HasMaxLength(500);

        builder.Property(x => x.VerificationResult)
            .HasMaxLength(2000);

        builder.Property(x => x.VerifiedBy)
            .HasMaxLength(100);

        // Etkinlik
        builder.Property(x => x.EffectivenessNotes)
            .HasMaxLength(2000);

        // Kapatma
        builder.Property(x => x.ClosedBy)
            .HasMaxLength(100);

        builder.Property(x => x.ClosureNotes)
            .HasMaxLength(2000);

        builder.Property(x => x.Notes)
            .HasMaxLength(2000);

        builder.Property(x => x.Attachments)
            .HasColumnType("jsonb");

        builder.Property(x => x.CreatedBy)
            .HasMaxLength(100);

        // Navigation
        builder.HasOne(x => x.NonConformanceReport)
            .WithMany(x => x.CapaActions)
            .HasForeignKey(x => x.NonConformanceReportId)
            .OnDelete(DeleteBehavior.Restrict);

        // Indexes
        builder.HasIndex(x => new { x.TenantId, x.CapaNumber }).IsUnique();
        builder.HasIndex(x => x.NonConformanceReportId);
        builder.HasIndex(x => x.Type);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Priority);
        builder.HasIndex(x => x.DueDate);
        builder.HasIndex(x => x.ResponsibleUserId);
        builder.HasIndex(x => x.IsActive);
    }
}

public class CapaTaskConfiguration : IEntityTypeConfiguration<CapaTask>
{
    public void Configure(EntityTypeBuilder<CapaTask> builder)
    {
        builder.ToTable("CapaTasks");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(x => x.AssignedTo)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.Result)
            .HasMaxLength(1000);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.EstimatedCost)
            .HasPrecision(18, 2);

        builder.Property(x => x.ActualCost)
            .HasPrecision(18, 2);

        // Navigation
        builder.HasOne(x => x.CorrectivePreventiveAction)
            .WithMany(x => x.Tasks)
            .HasForeignKey(x => x.CorrectivePreventiveActionId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(x => x.CorrectivePreventiveActionId);
        builder.HasIndex(x => new { x.CorrectivePreventiveActionId, x.SequenceNumber }).IsUnique();
        builder.HasIndex(x => x.DueDate);
        builder.HasIndex(x => x.AssignedUserId);
        builder.HasIndex(x => x.IsCompleted);
    }
}
