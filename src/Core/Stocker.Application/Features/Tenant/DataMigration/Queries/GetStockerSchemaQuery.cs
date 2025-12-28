using MediatR;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetStockerSchemaQuery : IRequest<Result<StockerEntitySchemaDto>>
{
    public string EntityType { get; set; } = string.Empty;
}

public class GetStockerSchemaQueryHandler : IRequestHandler<GetStockerSchemaQuery, Result<StockerEntitySchemaDto>>
{
    public Task<Result<StockerEntitySchemaDto>> Handle(GetStockerSchemaQuery request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<MigrationEntityType>(request.EntityType, true, out var entityType))
        {
            return Task.FromResult(Result<StockerEntitySchemaDto>.Failure(
                Error.Validation("InvalidEntityType", $"Geçersiz veri türü: {request.EntityType}")));
        }

        var schema = GetSchemaForEntity(entityType);
        return Task.FromResult(Result<StockerEntitySchemaDto>.Success(schema));
    }

    private StockerEntitySchemaDto GetSchemaForEntity(MigrationEntityType entityType)
    {
        return entityType switch
        {
            MigrationEntityType.Product => new StockerEntitySchemaDto
            {
                EntityType = "Product",
                DisplayName = "Ürünler",
                Description = "Stok/Ürün kartları",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "Code", DisplayName = "Ürün Kodu", DataType = "string", IsRequired = true, MaxLength = 50, Description = "Benzersiz ürün kodu" },
                    new() { Name = "Name", DisplayName = "Ürün Adı", DataType = "string", IsRequired = true, MaxLength = 200, Description = "Ürün adı/açıklaması" },
                    new() { Name = "Description", DisplayName = "Detaylı Açıklama", DataType = "string", IsRequired = false, MaxLength = 500 },
                    new() { Name = "Barcode", DisplayName = "Barkod", DataType = "string", IsRequired = false, MaxLength = 50, Description = "EAN13, UPC veya özel barkod" },
                    new() { Name = "CategoryCode", DisplayName = "Kategori Kodu", DataType = "string", IsRequired = false, MaxLength = 50, Description = "Ürün kategori kodu" },
                    new() { Name = "Unit", DisplayName = "Birim", DataType = "string", IsRequired = true, MaxLength = 20, Description = "Adet, Kg, Lt, Mt vb.", DefaultValue = "Adet" },
                    new() { Name = "VatRate", DisplayName = "KDV Oranı (%)", DataType = "decimal", IsRequired = false, Description = "0, 1, 8, 10, 18, 20", DefaultValue = "18" },
                    new() { Name = "PurchasePrice", DisplayName = "Alış Fiyatı", DataType = "decimal", IsRequired = false, Description = "KDV hariç alış fiyatı" },
                    new() { Name = "SalePrice", DisplayName = "Satış Fiyatı", DataType = "decimal", IsRequired = false, Description = "KDV hariç satış fiyatı" },
                    new() { Name = "MinStock", DisplayName = "Minimum Stok", DataType = "decimal", IsRequired = false, Description = "Kritik stok seviyesi" },
                    new() { Name = "MaxStock", DisplayName = "Maksimum Stok", DataType = "decimal", IsRequired = false, Description = "Maksimum stok seviyesi" },
                    new() { Name = "ShelfLife", DisplayName = "Raf Ömrü (Gün)", DataType = "int", IsRequired = false, Description = "Son kullanma takibi için" },
                    new() { Name = "Weight", DisplayName = "Ağırlık (Kg)", DataType = "decimal", IsRequired = false },
                    new() { Name = "Volume", DisplayName = "Hacim (m³)", DataType = "decimal", IsRequired = false },
                }
            },
            MigrationEntityType.Customer => new StockerEntitySchemaDto
            {
                EntityType = "Customer",
                DisplayName = "Müşteriler",
                Description = "Müşteri/Cari kartları",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "Code", DisplayName = "Cari Kodu", DataType = "string", IsRequired = true, MaxLength = 50, Description = "Benzersiz cari kodu" },
                    new() { Name = "Name", DisplayName = "Firma/Kişi Adı", DataType = "string", IsRequired = true, MaxLength = 200 },
                    new() { Name = "TaxNumber", DisplayName = "Vergi/TC No", DataType = "string", IsRequired = false, MaxLength = 20, Description = "VKN (10 hane) veya TCKN (11 hane)" },
                    new() { Name = "TaxOffice", DisplayName = "Vergi Dairesi", DataType = "string", IsRequired = false, MaxLength = 100 },
                    new() { Name = "Phone", DisplayName = "Telefon", DataType = "string", IsRequired = false, MaxLength = 20 },
                    new() { Name = "Email", DisplayName = "E-posta", DataType = "string", IsRequired = false, MaxLength = 100 },
                    new() { Name = "Address", DisplayName = "Adres", DataType = "string", IsRequired = false, MaxLength = 500 },
                    new() { Name = "City", DisplayName = "İl", DataType = "string", IsRequired = false, MaxLength = 50 },
                    new() { Name = "District", DisplayName = "İlçe", DataType = "string", IsRequired = false, MaxLength = 50 },
                    new() { Name = "PostalCode", DisplayName = "Posta Kodu", DataType = "string", IsRequired = false, MaxLength = 10 },
                    new() { Name = "CreditLimit", DisplayName = "Kredi Limiti", DataType = "decimal", IsRequired = false, Description = "TL cinsinden kredi limiti" },
                    new() { Name = "PaymentTermDays", DisplayName = "Vade (Gün)", DataType = "int", IsRequired = false, Description = "Ödeme vadesi" },
                    new() { Name = "DiscountRate", DisplayName = "İskonto (%)", DataType = "decimal", IsRequired = false, Description = "Varsayılan iskonto oranı" },
                }
            },
            MigrationEntityType.Supplier => new StockerEntitySchemaDto
            {
                EntityType = "Supplier",
                DisplayName = "Tedarikçiler",
                Description = "Tedarikçi/Satıcı kartları",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "Code", DisplayName = "Tedarikçi Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "Name", DisplayName = "Firma Adı", DataType = "string", IsRequired = true, MaxLength = 200 },
                    new() { Name = "TaxNumber", DisplayName = "Vergi No", DataType = "string", IsRequired = false, MaxLength = 20 },
                    new() { Name = "TaxOffice", DisplayName = "Vergi Dairesi", DataType = "string", IsRequired = false, MaxLength = 100 },
                    new() { Name = "Phone", DisplayName = "Telefon", DataType = "string", IsRequired = false, MaxLength = 20 },
                    new() { Name = "Email", DisplayName = "E-posta", DataType = "string", IsRequired = false, MaxLength = 100 },
                    new() { Name = "Address", DisplayName = "Adres", DataType = "string", IsRequired = false, MaxLength = 500 },
                    new() { Name = "ContactPerson", DisplayName = "İlgili Kişi", DataType = "string", IsRequired = false, MaxLength = 100 },
                    new() { Name = "PaymentTermDays", DisplayName = "Vade (Gün)", DataType = "int", IsRequired = false },
                }
            },
            MigrationEntityType.Category => new StockerEntitySchemaDto
            {
                EntityType = "Category",
                DisplayName = "Kategoriler",
                Description = "Ürün kategorileri",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "Code", DisplayName = "Kategori Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "Name", DisplayName = "Kategori Adı", DataType = "string", IsRequired = true, MaxLength = 100 },
                    new() { Name = "ParentCode", DisplayName = "Üst Kategori Kodu", DataType = "string", IsRequired = false, MaxLength = 50, Description = "Hiyerarşik yapı için" },
                    new() { Name = "Description", DisplayName = "Açıklama", DataType = "string", IsRequired = false, MaxLength = 500 },
                    new() { Name = "SortOrder", DisplayName = "Sıra No", DataType = "int", IsRequired = false },
                }
            },
            MigrationEntityType.Warehouse => new StockerEntitySchemaDto
            {
                EntityType = "Warehouse",
                DisplayName = "Depolar",
                Description = "Depo tanımları",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "Code", DisplayName = "Depo Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "Name", DisplayName = "Depo Adı", DataType = "string", IsRequired = true, MaxLength = 100 },
                    new() { Name = "Address", DisplayName = "Adres", DataType = "string", IsRequired = false, MaxLength = 500 },
                    new() { Name = "City", DisplayName = "İl", DataType = "string", IsRequired = false, MaxLength = 50 },
                    new() { Name = "IsDefault", DisplayName = "Varsayılan Depo", DataType = "bool", IsRequired = false, DefaultValue = "false" },
                    new() { Name = "IsActive", DisplayName = "Aktif", DataType = "bool", IsRequired = false, DefaultValue = "true" },
                }
            },
            MigrationEntityType.OpeningBalance => new StockerEntitySchemaDto
            {
                EntityType = "OpeningBalance",
                DisplayName = "Açılış Stokları",
                Description = "Başlangıç stok miktarları",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "ProductCode", DisplayName = "Ürün Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "WarehouseCode", DisplayName = "Depo Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "Quantity", DisplayName = "Miktar", DataType = "decimal", IsRequired = true },
                    new() { Name = "UnitCost", DisplayName = "Birim Maliyet", DataType = "decimal", IsRequired = false, Description = "Ortalama maliyet için" },
                    new() { Name = "LotNumber", DisplayName = "Lot/Parti No", DataType = "string", IsRequired = false, MaxLength = 50 },
                    new() { Name = "ExpiryDate", DisplayName = "Son Kullanma Tarihi", DataType = "date", IsRequired = false },
                }
            },
            MigrationEntityType.StockMovement => new StockerEntitySchemaDto
            {
                EntityType = "StockMovement",
                DisplayName = "Stok Hareketleri",
                Description = "Geçmiş stok hareketleri",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "ProductCode", DisplayName = "Ürün Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "WarehouseCode", DisplayName = "Depo Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "Quantity", DisplayName = "Miktar", DataType = "decimal", IsRequired = true, Description = "Giriş için pozitif, çıkış için negatif" },
                    new() { Name = "MovementType", DisplayName = "Hareket Tipi", DataType = "string", IsRequired = true, MaxLength = 20, Description = "Giris, Cikis, Transfer, Sayim" },
                    new() { Name = "Date", DisplayName = "İşlem Tarihi", DataType = "datetime", IsRequired = true },
                    new() { Name = "DocumentNo", DisplayName = "Belge No", DataType = "string", IsRequired = false, MaxLength = 50 },
                    new() { Name = "Description", DisplayName = "Açıklama", DataType = "string", IsRequired = false, MaxLength = 500 },
                    new() { Name = "UnitPrice", DisplayName = "Birim Fiyat", DataType = "decimal", IsRequired = false },
                }
            },
            MigrationEntityType.PriceList => new StockerEntitySchemaDto
            {
                EntityType = "PriceList",
                DisplayName = "Fiyat Listeleri",
                Description = "Ürün fiyat listeleri",
                Fields = new List<TargetFieldDto>
                {
                    new() { Name = "ProductCode", DisplayName = "Ürün Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "PriceListCode", DisplayName = "Fiyat Listesi Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                    new() { Name = "Price", DisplayName = "Fiyat", DataType = "decimal", IsRequired = true },
                    new() { Name = "Currency", DisplayName = "Para Birimi", DataType = "string", IsRequired = false, MaxLength = 3, DefaultValue = "TRY" },
                    new() { Name = "ValidFrom", DisplayName = "Geçerlilik Başlangıcı", DataType = "date", IsRequired = false },
                    new() { Name = "ValidTo", DisplayName = "Geçerlilik Bitişi", DataType = "date", IsRequired = false },
                }
            },
            _ => new StockerEntitySchemaDto
            {
                EntityType = entityType.ToString(),
                DisplayName = entityType.ToString(),
                Description = "Şema tanımlı değil",
                Fields = new List<TargetFieldDto>()
            }
        };
    }
}
