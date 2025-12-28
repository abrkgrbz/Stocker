using MediatR;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetMappingTemplatesQuery : IRequest<Result<List<MappingTemplateDto>>>
{
    public Guid TenantId { get; set; }
    public string? SourceType { get; set; }
}

public class GetMappingTemplatesQueryHandler : IRequestHandler<GetMappingTemplatesQuery, Result<List<MappingTemplateDto>>>
{
    public Task<Result<List<MappingTemplateDto>>> Handle(GetMappingTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = GetBuiltInTemplates();

        // Filter by source type if specified
        if (!string.IsNullOrEmpty(request.SourceType))
        {
            templates = templates.Where(t => t.SourceType.Equals(request.SourceType, StringComparison.OrdinalIgnoreCase)).ToList();
        }

        return Task.FromResult(Result<List<MappingTemplateDto>>.Success(templates));
    }

    private List<MappingTemplateDto> GetBuiltInTemplates()
    {
        return new List<MappingTemplateDto>
        {
            // Logo Tiger Templates
            new()
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111101"),
                Name = "Logo Tiger - Ürünler (Standart)",
                Description = "Logo Tiger stok kartları için standart eşleştirme şablonu",
                SourceType = "Logo",
                EntityType = "Product",
                Mappings = new List<FieldMappingDto>
                {
                    new() { SourceField = "STOK_KODU", TargetField = "Code", Confidence = 1.0 },
                    new() { SourceField = "STOK_ADI", TargetField = "Name", Confidence = 1.0 },
                    new() { SourceField = "BARKOD1", TargetField = "Barcode", Confidence = 0.95 },
                    new() { SourceField = "BIRIM_ADI", TargetField = "Unit", Confidence = 1.0 },
                    new() { SourceField = "KDV_ORANI", TargetField = "VatRate", Confidence = 1.0 },
                    new() { SourceField = "ALIS_FIYATI", TargetField = "PurchasePrice", Confidence = 1.0 },
                    new() { SourceField = "SATIS_FIYATI", TargetField = "SalePrice", Confidence = 1.0 },
                    new() { SourceField = "MIN_STOK", TargetField = "MinStock", Confidence = 1.0 },
                    new() { SourceField = "MAX_STOK", TargetField = "MaxStock", Confidence = 1.0 },
                }
            },
            new()
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111102"),
                Name = "Logo Tiger - Cariler (Standart)",
                Description = "Logo Tiger cari kartları için standart eşleştirme şablonu",
                SourceType = "Logo",
                EntityType = "Customer",
                Mappings = new List<FieldMappingDto>
                {
                    new() { SourceField = "CARI_KOD", TargetField = "Code", Confidence = 1.0 },
                    new() { SourceField = "CARI_ADI", TargetField = "Name", Confidence = 1.0 },
                    new() { SourceField = "VERGI_NO", TargetField = "TaxNumber", Confidence = 1.0 },
                    new() { SourceField = "VERGI_DAIRESI", TargetField = "TaxOffice", Confidence = 1.0 },
                    new() { SourceField = "TELEFON1", TargetField = "Phone", Confidence = 0.95 },
                    new() { SourceField = "EMAIL", TargetField = "Email", Confidence = 1.0 },
                    new() { SourceField = "ADRES1", TargetField = "Address", Confidence = 0.95 },
                    new() { SourceField = "IL", TargetField = "City", Confidence = 1.0 },
                    new() { SourceField = "ILCE", TargetField = "District", Confidence = 1.0 },
                }
            },
            // ETA Templates
            new()
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222201"),
                Name = "ETA - Ürünler (Standart)",
                Description = "ETA stok kartları için standart eşleştirme şablonu",
                SourceType = "ETA",
                EntityType = "Product",
                Mappings = new List<FieldMappingDto>
                {
                    new() { SourceField = "KODU", TargetField = "Code", Confidence = 1.0 },
                    new() { SourceField = "ADI", TargetField = "Name", Confidence = 1.0 },
                    new() { SourceField = "BARKODU", TargetField = "Barcode", Confidence = 1.0 },
                    new() { SourceField = "BIRIMI", TargetField = "Unit", Confidence = 1.0 },
                    new() { SourceField = "KDVORANI", TargetField = "VatRate", Confidence = 1.0 },
                    new() { SourceField = "ALISFIYATI", TargetField = "PurchasePrice", Confidence = 1.0 },
                    new() { SourceField = "SATISFIYATI", TargetField = "SalePrice", Confidence = 1.0 },
                }
            },
            new()
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222202"),
                Name = "ETA - Cariler (Standart)",
                Description = "ETA cari kartları için standart eşleştirme şablonu",
                SourceType = "ETA",
                EntityType = "Customer",
                Mappings = new List<FieldMappingDto>
                {
                    new() { SourceField = "HESAPKODU", TargetField = "Code", Confidence = 1.0 },
                    new() { SourceField = "UNVANI", TargetField = "Name", Confidence = 1.0 },
                    new() { SourceField = "VERGINO", TargetField = "TaxNumber", Confidence = 1.0 },
                    new() { SourceField = "VERGIDAIRESI", TargetField = "TaxOffice", Confidence = 1.0 },
                    new() { SourceField = "TELEFON", TargetField = "Phone", Confidence = 1.0 },
                    new() { SourceField = "EPOSTA", TargetField = "Email", Confidence = 1.0 },
                    new() { SourceField = "ADRES", TargetField = "Address", Confidence = 1.0 },
                }
            },
            // Excel Generic Templates
            new()
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333301"),
                Name = "Excel - Ürünler (Genel)",
                Description = "Genel Excel ürün listesi için şablon",
                SourceType = "Excel",
                EntityType = "Product",
                Mappings = new List<FieldMappingDto>
                {
                    new() { SourceField = "Ürün Kodu", TargetField = "Code", Confidence = 0.9 },
                    new() { SourceField = "Ürün Adı", TargetField = "Name", Confidence = 0.9 },
                    new() { SourceField = "Barkod", TargetField = "Barcode", Confidence = 0.9 },
                    new() { SourceField = "Birim", TargetField = "Unit", Confidence = 0.9 },
                    new() { SourceField = "KDV %", TargetField = "VatRate", Confidence = 0.85 },
                    new() { SourceField = "Alış Fiyatı", TargetField = "PurchasePrice", Confidence = 0.9 },
                    new() { SourceField = "Satış Fiyatı", TargetField = "SalePrice", Confidence = 0.9 },
                }
            },
            new()
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333302"),
                Name = "Excel - Cariler (Genel)",
                Description = "Genel Excel cari listesi için şablon",
                SourceType = "Excel",
                EntityType = "Customer",
                Mappings = new List<FieldMappingDto>
                {
                    new() { SourceField = "Cari Kodu", TargetField = "Code", Confidence = 0.9 },
                    new() { SourceField = "Firma Adı", TargetField = "Name", Confidence = 0.9 },
                    new() { SourceField = "Vergi No", TargetField = "TaxNumber", Confidence = 0.9 },
                    new() { SourceField = "Vergi Dairesi", TargetField = "TaxOffice", Confidence = 0.9 },
                    new() { SourceField = "Telefon", TargetField = "Phone", Confidence = 0.9 },
                    new() { SourceField = "E-posta", TargetField = "Email", Confidence = 0.9 },
                    new() { SourceField = "Adres", TargetField = "Address", Confidence = 0.9 },
                }
            },
        };
    }
}
