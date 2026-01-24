using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Infrastructure.Persistence.Configurations;

public class DeliveryNoteConfiguration : IEntityTypeConfiguration<DeliveryNote>
{
    public void Configure(EntityTypeBuilder<DeliveryNote> builder)
    {
        builder.ToTable("DeliveryNotes");

        builder.HasKey(d => d.Id);

        // Belge Bilgileri
        builder.Property(d => d.DeliveryNoteNumber)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(d => d.Series)
            .IsRequired()
            .HasMaxLength(10);

        builder.Property(d => d.DeliveryNoteType)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(d => d.Status)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(d => d.EDeliveryNoteStatus)
            .HasConversion<string>()
            .HasMaxLength(30);

        // Gönderen Bilgileri
        builder.Property(d => d.SenderTaxId)
            .IsRequired()
            .HasMaxLength(11);

        builder.Property(d => d.SenderName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(d => d.SenderTaxOffice)
            .HasMaxLength(100);

        builder.Property(d => d.SenderAddress)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.SenderCity)
            .HasMaxLength(100);

        builder.Property(d => d.SenderDistrict)
            .HasMaxLength(100);

        builder.Property(d => d.SenderCountry)
            .HasMaxLength(100);

        // Alıcı Bilgileri
        builder.Property(d => d.ReceiverTaxId)
            .IsRequired()
            .HasMaxLength(11);

        builder.Property(d => d.ReceiverName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(d => d.ReceiverTaxOffice)
            .HasMaxLength(100);

        builder.Property(d => d.ReceiverAddress)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(d => d.ReceiverCity)
            .HasMaxLength(100);

        builder.Property(d => d.ReceiverDistrict)
            .HasMaxLength(100);

        builder.Property(d => d.ReceiverCountry)
            .HasMaxLength(100);

        builder.Property(d => d.ReceiverPostalCode)
            .HasMaxLength(20);

        // Teslim Bilgileri
        builder.Property(d => d.DeliveryAddress)
            .HasMaxLength(500);

        builder.Property(d => d.DeliveryCity)
            .HasMaxLength(100);

        builder.Property(d => d.DeliveryDistrict)
            .HasMaxLength(100);

        // Taşıma Bilgileri
        builder.Property(d => d.TransportMode)
            .HasConversion<string>()
            .HasMaxLength(30);

        builder.Property(d => d.CarrierTaxId)
            .HasMaxLength(11);

        builder.Property(d => d.CarrierName)
            .HasMaxLength(300);

        builder.Property(d => d.VehiclePlate)
            .HasMaxLength(20);

        builder.Property(d => d.TrailerPlate)
            .HasMaxLength(20);

        builder.Property(d => d.DriverName)
            .HasMaxLength(200);

        builder.Property(d => d.DriverNationalId)
            .HasMaxLength(11);

        // Miktar Bilgileri
        builder.Property(d => d.TotalQuantity)
            .HasPrecision(18, 4);

        builder.Property(d => d.TotalGrossWeight)
            .HasPrecision(18, 4);

        builder.Property(d => d.TotalNetWeight)
            .HasPrecision(18, 4);

        builder.Property(d => d.TotalVolume)
            .HasPrecision(18, 4);

        builder.Property(d => d.PackageType)
            .HasMaxLength(50);

        // İlişkili Belgeler
        builder.Property(d => d.SalesOrderNumber)
            .HasMaxLength(50);

        builder.Property(d => d.InvoiceNumber)
            .HasMaxLength(50);

        // Durum ve İzleme
        builder.Property(d => d.ReceivedBy)
            .HasMaxLength(200);

        builder.Property(d => d.ReceiverSignature)
            .HasMaxLength(500);

        // Genel Bilgiler
        builder.Property(d => d.Description)
            .HasMaxLength(1000);

        builder.Property(d => d.Notes)
            .HasMaxLength(2000);

        // Items navigation
        builder.HasMany(d => d.Items)
            .WithOne()
            .HasForeignKey(i => i.DeliveryNoteId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(d => new { d.TenantId, d.DeliveryNoteNumber }).IsUnique();
        builder.HasIndex(d => new { d.TenantId, d.Status });
        builder.HasIndex(d => new { d.TenantId, d.DeliveryNoteDate });
        builder.HasIndex(d => d.SalesOrderId);
        builder.HasIndex(d => d.InvoiceId);
        builder.HasIndex(d => d.ShipmentId);
        builder.HasIndex(d => d.ReceiverId);
    }
}

public class DeliveryNoteItemConfiguration : IEntityTypeConfiguration<DeliveryNoteItem>
{
    public void Configure(EntityTypeBuilder<DeliveryNoteItem> builder)
    {
        builder.ToTable("DeliveryNoteItems");

        builder.HasKey(i => i.Id);

        builder.Property(i => i.ProductCode)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(i => i.ProductName)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(i => i.ProductDescription)
            .HasMaxLength(500);

        builder.Property(i => i.Quantity)
            .HasPrecision(18, 4);

        builder.Property(i => i.Unit)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(i => i.UnitCode)
            .HasMaxLength(10);

        builder.Property(i => i.GrossWeight)
            .HasPrecision(18, 4);

        builder.Property(i => i.NetWeight)
            .HasPrecision(18, 4);

        builder.Property(i => i.Volume)
            .HasPrecision(18, 4);

        builder.Property(i => i.LotNumber)
            .HasMaxLength(50);

        builder.Property(i => i.SerialNumber)
            .HasMaxLength(100);

        builder.Property(i => i.HsCode)
            .HasMaxLength(20);

        builder.Property(i => i.CountryOfOrigin)
            .HasMaxLength(100);

        builder.Property(i => i.Notes)
            .HasMaxLength(500);

        // Indexes
        builder.HasIndex(i => i.DeliveryNoteId);
        builder.HasIndex(i => i.ProductId);
    }
}
