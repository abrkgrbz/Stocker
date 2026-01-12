using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Manufacturing.Domain.Entities;

namespace Stocker.Modules.Manufacturing.Infrastructure.Data.Configurations;

public class QualityInspectionConfiguration : IEntityTypeConfiguration<QualityInspection>
{
    public void Configure(EntityTypeBuilder<QualityInspection> builder)
    {
        builder.ToTable("QualityInspections");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.InspectionNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.InspectionType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.LotNumber)
            .HasMaxLength(100);

        builder.Property(x => x.SampleSize)
            .HasPrecision(18, 6);

        builder.Property(x => x.InspectedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.AcceptedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.RejectedQuantity)
            .HasPrecision(18, 6);

        builder.Property(x => x.SamplingMethod)
            .HasMaxLength(50);

        builder.Property(x => x.AcceptanceCriteria)
            .HasMaxLength(200);

        builder.Property(x => x.QualityPlanCode)
            .HasMaxLength(50);

        builder.Property(x => x.Result)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.DefectRate)
            .HasPrecision(5, 2);

        builder.Property(x => x.MeasurementResults)
            .HasColumnType("jsonb");

        builder.Property(x => x.InspectorName)
            .HasMaxLength(100);

        builder.Property(x => x.InspectionDurationMinutes)
            .HasPrecision(10, 2);

        builder.Property(x => x.EquipmentUsed)
            .HasMaxLength(200);

        builder.Property(x => x.NonConformanceDescription)
            .HasMaxLength(1000);

        builder.Property(x => x.CorrectiveAction)
            .HasMaxLength(1000);

        builder.Property(x => x.PreventiveAction)
            .HasMaxLength(1000);

        builder.Property(x => x.DispositionDecision)
            .HasMaxLength(50);

        builder.Property(x => x.DispositionReason)
            .HasMaxLength(500);

        builder.Property(x => x.CertificateNumber)
            .HasMaxLength(100);

        builder.Property(x => x.Status)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.Notes)
            .HasMaxLength(1000);

        builder.Property(x => x.Attachments)
            .HasColumnType("jsonb");

        builder.HasOne(x => x.ProductionOrder)
            .WithMany()
            .HasForeignKey(x => x.ProductionOrderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductionOperation)
            .WithMany()
            .HasForeignKey(x => x.ProductionOperationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ProductionReceipt)
            .WithMany()
            .HasForeignKey(x => x.ProductionReceiptId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(x => new { x.TenantId, x.InspectionNumber }).IsUnique();
        builder.HasIndex(x => x.ProductionOrderId);
        builder.HasIndex(x => x.ProductId);
        builder.HasIndex(x => x.Result);
        builder.HasIndex(x => x.Status);
    }
}

public class QualityInspectionDetailConfiguration : IEntityTypeConfiguration<QualityInspectionDetail>
{
    public void Configure(EntityTypeBuilder<QualityInspectionDetail> builder)
    {
        builder.ToTable("QualityInspectionDetails");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.ParameterName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(x => x.ParameterCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.ParameterType)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.SpecificationValue)
            .HasMaxLength(200);

        builder.Property(x => x.NominalValue)
            .HasPrecision(18, 6);

        builder.Property(x => x.UpperLimit)
            .HasPrecision(18, 6);

        builder.Property(x => x.LowerLimit)
            .HasPrecision(18, 6);

        builder.Property(x => x.UpperTolerance)
            .HasPrecision(18, 6);

        builder.Property(x => x.LowerTolerance)
            .HasPrecision(18, 6);

        builder.Property(x => x.UnitOfMeasure)
            .HasMaxLength(20);

        builder.Property(x => x.MeasuredValue)
            .HasMaxLength(200);

        builder.Property(x => x.NumericValue)
            .HasPrecision(18, 6);

        builder.Property(x => x.Deviation)
            .HasPrecision(18, 6);

        builder.Property(x => x.Result)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(x => x.MeasurementMethod)
            .HasMaxLength(100);

        builder.Property(x => x.MeasurementEquipment)
            .HasMaxLength(100);

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.HasOne(x => x.QualityInspection)
            .WithMany(x => x.Details)
            .HasForeignKey(x => x.QualityInspectionId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.QualityInspectionId, x.SequenceNumber }).IsUnique();
    }
}
