using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetMappingSuggestionsQuery : IRequest<Result<AutoMappingResultDto>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
    public string EntityType { get; set; } = string.Empty;
}

public class GetMappingSuggestionsQueryHandler : IRequestHandler<GetMappingSuggestionsQuery, Result<AutoMappingResultDto>>
{
    private readonly IMasterDbContext _context;

    public GetMappingSuggestionsQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AutoMappingResultDto>> Handle(GetMappingSuggestionsQuery request, CancellationToken cancellationToken)
    {
        // Validate session
        var session = await _context.MigrationSessions
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<AutoMappingResultDto>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        if (!Enum.TryParse<MigrationEntityType>(request.EntityType, true, out var entityType))
        {
            return Result<AutoMappingResultDto>.Failure(Error.Validation("InvalidEntityType", $"Geçersiz veri türü: {request.EntityType}"));
        }

        // Get sample data to analyze columns
        var sampleRecord = await _context.MigrationValidationResults
            .AsNoTracking()
            .Where(r => r.SessionId == request.SessionId && r.EntityType == entityType)
            .FirstOrDefaultAsync(cancellationToken);

        if (sampleRecord == null)
        {
            return Result<AutoMappingResultDto>.Failure(Error.NotFound("NoData", "Bu veri türü için yüklenmiş veri bulunamadı"));
        }

        // Parse sample data to get source columns
        var sampleData = JsonSerializer.Deserialize<Dictionary<string, object?>>(sampleRecord.OriginalDataJson);
        if (sampleData == null)
        {
            return Result<AutoMappingResultDto>.Failure(Error.Validation("InvalidData", "Veri formatı geçersiz"));
        }

        var sourceColumns = sampleData.Keys.ToList();

        // Get Stocker target fields for this entity type
        var targetFields = GetTargetFieldsForEntity(entityType);

        // Generate auto-mapping suggestions
        var suggestions = GenerateAutoMappingSuggestions(sourceColumns, targetFields);

        var result = new AutoMappingResultDto
        {
            EntityType = entityType.ToString(),
            SourceColumns = sourceColumns.Select(c => new SourceColumnDto
            {
                Name = c,
                SampleValue = sampleData[c]?.ToString()
            }).ToList(),
            TargetFields = targetFields,
            SuggestedMappings = suggestions,
            ConfidenceScore = CalculateConfidenceScore(suggestions, targetFields)
        };

        return Result<AutoMappingResultDto>.Success(result);
    }

    private List<TargetFieldDto> GetTargetFieldsForEntity(MigrationEntityType entityType)
    {
        return entityType switch
        {
            MigrationEntityType.Product => new List<TargetFieldDto>
            {
                new() { Name = "Code", DisplayName = "Ürün Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "Name", DisplayName = "Ürün Adı", DataType = "string", IsRequired = true, MaxLength = 200 },
                new() { Name = "Description", DisplayName = "Açıklama", DataType = "string", IsRequired = false, MaxLength = 500 },
                new() { Name = "Barcode", DisplayName = "Barkod", DataType = "string", IsRequired = false, MaxLength = 50 },
                new() { Name = "CategoryCode", DisplayName = "Kategori Kodu", DataType = "string", IsRequired = false, MaxLength = 50 },
                new() { Name = "Unit", DisplayName = "Birim", DataType = "string", IsRequired = true, MaxLength = 20 },
                new() { Name = "VatRate", DisplayName = "KDV Oranı", DataType = "decimal", IsRequired = false },
                new() { Name = "PurchasePrice", DisplayName = "Alış Fiyatı", DataType = "decimal", IsRequired = false },
                new() { Name = "SalePrice", DisplayName = "Satış Fiyatı", DataType = "decimal", IsRequired = false },
                new() { Name = "MinStock", DisplayName = "Min. Stok", DataType = "decimal", IsRequired = false },
                new() { Name = "MaxStock", DisplayName = "Max. Stok", DataType = "decimal", IsRequired = false },
            },
            MigrationEntityType.Customer => new List<TargetFieldDto>
            {
                new() { Name = "Code", DisplayName = "Cari Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "Name", DisplayName = "Cari Adı", DataType = "string", IsRequired = true, MaxLength = 200 },
                new() { Name = "TaxNumber", DisplayName = "Vergi No", DataType = "string", IsRequired = false, MaxLength = 20 },
                new() { Name = "TaxOffice", DisplayName = "Vergi Dairesi", DataType = "string", IsRequired = false, MaxLength = 100 },
                new() { Name = "Phone", DisplayName = "Telefon", DataType = "string", IsRequired = false, MaxLength = 20 },
                new() { Name = "Email", DisplayName = "E-posta", DataType = "string", IsRequired = false, MaxLength = 100 },
                new() { Name = "Address", DisplayName = "Adres", DataType = "string", IsRequired = false, MaxLength = 500 },
                new() { Name = "City", DisplayName = "İl", DataType = "string", IsRequired = false, MaxLength = 50 },
                new() { Name = "District", DisplayName = "İlçe", DataType = "string", IsRequired = false, MaxLength = 50 },
                new() { Name = "CreditLimit", DisplayName = "Kredi Limiti", DataType = "decimal", IsRequired = false },
            },
            MigrationEntityType.Supplier => new List<TargetFieldDto>
            {
                new() { Name = "Code", DisplayName = "Tedarikçi Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "Name", DisplayName = "Tedarikçi Adı", DataType = "string", IsRequired = true, MaxLength = 200 },
                new() { Name = "TaxNumber", DisplayName = "Vergi No", DataType = "string", IsRequired = false, MaxLength = 20 },
                new() { Name = "TaxOffice", DisplayName = "Vergi Dairesi", DataType = "string", IsRequired = false, MaxLength = 100 },
                new() { Name = "Phone", DisplayName = "Telefon", DataType = "string", IsRequired = false, MaxLength = 20 },
                new() { Name = "Email", DisplayName = "E-posta", DataType = "string", IsRequired = false, MaxLength = 100 },
                new() { Name = "Address", DisplayName = "Adres", DataType = "string", IsRequired = false, MaxLength = 500 },
            },
            MigrationEntityType.Category => new List<TargetFieldDto>
            {
                new() { Name = "Code", DisplayName = "Kategori Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "Name", DisplayName = "Kategori Adı", DataType = "string", IsRequired = true, MaxLength = 100 },
                new() { Name = "ParentCode", DisplayName = "Üst Kategori Kodu", DataType = "string", IsRequired = false, MaxLength = 50 },
                new() { Name = "Description", DisplayName = "Açıklama", DataType = "string", IsRequired = false, MaxLength = 500 },
            },
            MigrationEntityType.Warehouse => new List<TargetFieldDto>
            {
                new() { Name = "Code", DisplayName = "Depo Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "Name", DisplayName = "Depo Adı", DataType = "string", IsRequired = true, MaxLength = 100 },
                new() { Name = "Address", DisplayName = "Adres", DataType = "string", IsRequired = false, MaxLength = 500 },
                new() { Name = "IsDefault", DisplayName = "Varsayılan", DataType = "bool", IsRequired = false },
            },
            MigrationEntityType.StockMovement => new List<TargetFieldDto>
            {
                new() { Name = "ProductCode", DisplayName = "Ürün Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "WarehouseCode", DisplayName = "Depo Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "Quantity", DisplayName = "Miktar", DataType = "decimal", IsRequired = true },
                new() { Name = "MovementType", DisplayName = "Hareket Tipi", DataType = "string", IsRequired = true, MaxLength = 20 },
                new() { Name = "Date", DisplayName = "Tarih", DataType = "datetime", IsRequired = true },
                new() { Name = "Description", DisplayName = "Açıklama", DataType = "string", IsRequired = false, MaxLength = 500 },
            },
            MigrationEntityType.OpeningBalance => new List<TargetFieldDto>
            {
                new() { Name = "ProductCode", DisplayName = "Ürün Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "WarehouseCode", DisplayName = "Depo Kodu", DataType = "string", IsRequired = true, MaxLength = 50 },
                new() { Name = "Quantity", DisplayName = "Miktar", DataType = "decimal", IsRequired = true },
                new() { Name = "UnitCost", DisplayName = "Birim Maliyet", DataType = "decimal", IsRequired = false },
                new() { Name = "Date", DisplayName = "Tarih", DataType = "datetime", IsRequired = false },
            },
            _ => new List<TargetFieldDto>()
        };
    }

    private List<FieldMappingDto> GenerateAutoMappingSuggestions(List<string> sourceColumns, List<TargetFieldDto> targetFields)
    {
        var suggestions = new List<FieldMappingDto>();

        // Common field name mappings for Turkish ERP systems
        var commonMappings = new Dictionary<string, List<string>>(StringComparer.OrdinalIgnoreCase)
        {
            { "Code", new List<string> { "KOD", "STOK_KODU", "MALZEME_KODU", "CARI_KOD", "URUN_KODU", "STOKKOD", "CARIKOD", "CODE" } },
            { "Name", new List<string> { "AD", "ACIKLAMA", "STOK_ADI", "MALZEME_ADI", "CARI_ADI", "URUN_ADI", "STOKADI", "CARIAD", "NAME", "ISIM" } },
            { "Description", new List<string> { "ACIKLAMA", "TANIM", "DESCRIPTION", "DETAY" } },
            { "Barcode", new List<string> { "BARKOD", "BARCODE", "EAN", "UPC" } },
            { "Unit", new List<string> { "BIRIM", "OLCU_BIRIMI", "UNIT", "BR" } },
            { "VatRate", new List<string> { "KDV", "KDV_ORANI", "VERGI_ORANI", "VAT", "TAX_RATE" } },
            { "PurchasePrice", new List<string> { "ALIS_FIYATI", "MALIYET", "ALIS", "COST", "PURCHASE_PRICE" } },
            { "SalePrice", new List<string> { "SATIS_FIYATI", "FIYAT", "SATIS", "PRICE", "SALE_PRICE" } },
            { "TaxNumber", new List<string> { "VERGI_NO", "VKN", "TCKN", "TAX_NUMBER", "VERGINO" } },
            { "TaxOffice", new List<string> { "VERGI_DAIRESI", "VD", "TAX_OFFICE", "VERGIDAIRESI" } },
            { "Phone", new List<string> { "TELEFON", "TEL", "PHONE", "GSM", "MOBIL" } },
            { "Email", new List<string> { "EPOSTA", "EMAIL", "MAIL" } },
            { "Address", new List<string> { "ADRES", "ADDRESS", "ADRES1", "ADRES2" } },
            { "City", new List<string> { "IL", "SEHIR", "CITY" } },
            { "District", new List<string> { "ILCE", "DISTRICT" } },
            { "Quantity", new List<string> { "MIKTAR", "ADET", "QUANTITY", "QTY" } },
            { "Date", new List<string> { "TARIH", "DATE", "ISLEM_TARIHI" } },
            { "CategoryCode", new List<string> { "KATEGORI_KOD", "GRUP_KOD", "CATEGORY", "CATEGORY_CODE" } },
            { "WarehouseCode", new List<string> { "DEPO_KOD", "DEPO", "WAREHOUSE", "WAREHOUSE_CODE" } },
            { "ProductCode", new List<string> { "STOK_KODU", "URUN_KODU", "PRODUCT_CODE", "STOKKOD" } },
        };

        foreach (var targetField in targetFields)
        {
            var matchedSource = FindBestMatch(sourceColumns, targetField.Name, commonMappings);

            suggestions.Add(new FieldMappingDto
            {
                SourceField = matchedSource,
                TargetField = targetField.Name,
                Confidence = matchedSource != null ? CalculateMatchConfidence(matchedSource, targetField.Name, commonMappings) : 0
            });
        }

        return suggestions;
    }

    private string? FindBestMatch(List<string> sourceColumns, string targetField, Dictionary<string, List<string>> commonMappings)
    {
        // Exact match first
        var exactMatch = sourceColumns.FirstOrDefault(s => s.Equals(targetField, StringComparison.OrdinalIgnoreCase));
        if (exactMatch != null) return exactMatch;

        // Check common mappings
        if (commonMappings.TryGetValue(targetField, out var aliases))
        {
            foreach (var alias in aliases)
            {
                var aliasMatch = sourceColumns.FirstOrDefault(s => s.Equals(alias, StringComparison.OrdinalIgnoreCase));
                if (aliasMatch != null) return aliasMatch;

                // Partial match
                var partialMatch = sourceColumns.FirstOrDefault(s =>
                    s.Contains(alias, StringComparison.OrdinalIgnoreCase) ||
                    alias.Contains(s, StringComparison.OrdinalIgnoreCase));
                if (partialMatch != null) return partialMatch;
            }
        }

        return null;
    }

    private double CalculateMatchConfidence(string sourceField, string targetField, Dictionary<string, List<string>> commonMappings)
    {
        // Exact match
        if (sourceField.Equals(targetField, StringComparison.OrdinalIgnoreCase))
            return 1.0;

        // Known alias match
        if (commonMappings.TryGetValue(targetField, out var aliases))
        {
            if (aliases.Any(a => a.Equals(sourceField, StringComparison.OrdinalIgnoreCase)))
                return 0.95;

            // Partial alias match
            if (aliases.Any(a => sourceField.Contains(a, StringComparison.OrdinalIgnoreCase) ||
                                 a.Contains(sourceField, StringComparison.OrdinalIgnoreCase)))
                return 0.7;
        }

        return 0.5;
    }

    private double CalculateConfidenceScore(List<FieldMappingDto> suggestions, List<TargetFieldDto> targetFields)
    {
        if (suggestions.Count == 0) return 0;

        var requiredFields = targetFields.Where(f => f.IsRequired).Select(f => f.Name).ToList();
        var mappedRequiredCount = suggestions
            .Where(s => requiredFields.Contains(s.TargetField) && !string.IsNullOrEmpty(s.SourceField))
            .Count();

        var requiredCoverage = requiredFields.Count > 0 ? (double)mappedRequiredCount / requiredFields.Count : 1.0;
        var averageConfidence = suggestions.Where(s => !string.IsNullOrEmpty(s.SourceField)).Average(s => s.Confidence);

        return (requiredCoverage * 0.6 + averageConfidence * 0.4);
    }
}
