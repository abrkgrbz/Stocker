# Stocker Data Migration Architecture

## Overview

Bu dokuman, on-premise ERP/CRM sistemlerinden (Logo, ETA, Mikro, Netsis, Parasut) Stocker SaaS uygulamasina veri aktarimi icin mimarisi tasarimi icerir.

## Problem Statement

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER ON-PREMISE                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Logo      │    │    ETA      │    │   Mikro     │            │
│  │  SQL Server │    │  SQL Server │    │  SQL Server │            │
│  └─────────────┘    └─────────────┘    └─────────────┘            │
│         │                 │                  │                     │
│         └─────────────────┼──────────────────┘                     │
│                           │                                        │
│                    ❌ NO DIRECT ACCESS                             │
│                    (Firewall, NAT, VPN)                            │
└───────────────────────────┼────────────────────────────────────────┘
                            │
                            ❌
                            │
┌───────────────────────────┼────────────────────────────────────────┐
│                     STOCKER CLOUD                                  │
│                           │                                        │
│                    ┌──────┴──────┐                                 │
│                    │  Stocker    │                                 │
│                    │    API      │                                 │
│                    └─────────────┘                                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Solution: Desktop Connector Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CUSTOMER ON-PREMISE                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐            │
│  │   Logo      │    │    ETA      │    │   Mikro     │            │
│  │  SQL Server │    │  SQL Server │    │  SQL Server │            │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘            │
│         │                  │                  │                    │
│         └──────────────────┼──────────────────┘                    │
│                            │                                       │
│                   ┌────────┴────────┐                              │
│                   │    DESKTOP      │                              │
│                   │   CONNECTOR     │                              │
│                   │   (Windows)     │                              │
│                   └────────┬────────┘                              │
│                            │                                       │
│                     JSON/HTTPS                                     │
└────────────────────────────┼───────────────────────────────────────┘
                             │
                             ▼
┌────────────────────────────┼───────────────────────────────────────┐
│                     STOCKER CLOUD                                  │
│                            │                                       │
│                   ┌────────┴────────┐                              │
│                   │   Migration     │                              │
│                   │   Gateway API   │                              │
│                   └────────┬────────┘                              │
│                            │                                       │
│              ┌─────────────┼─────────────┐                         │
│              │             │             │                         │
│        ┌─────┴─────┐ ┌─────┴─────┐ ┌─────┴─────┐                  │
│        │ Validation│ │ Transform │ │  Import   │                  │
│        │  Engine   │ │  Engine   │ │  Service  │                  │
│        └───────────┘ └───────────┘ └───────────┘                  │
│                            │                                       │
│                   ┌────────┴────────┐                              │
│                   │    Hangfire     │                              │
│                   │  Background     │                              │
│                   └────────┬────────┘                              │
│                            │                                       │
│                   ┌────────┴────────┐                              │
│                   │   Tenant DB     │                              │
│                   └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Desktop Connector (Windows Application)

Musterinin bilgisayarina kurulan hafif Windows uygulamasi.

#### Technology Stack
- **.NET 8 WPF/WinForms** veya **Electron + Node.js**
- **SQLClient** for SQL Server connections
- **HTTPS** for secure API communication
- **JSON** for data serialization

#### Features
```
┌─────────────────────────────────────────────────────────────┐
│                    DESKTOP CONNECTOR                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │  Connection     │  │   Source        │                  │
│  │  Manager        │  │   Adapters      │                  │
│  │                 │  │                 │                  │
│  │  - Logo         │  │  - Logo Adapter │                  │
│  │  - ETA          │  │  - ETA Adapter  │                  │
│  │  - Mikro        │  │  - Mikro Adapter│                  │
│  │  - Custom SQL   │  │  - Generic SQL  │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   Extraction    │  │   Upload        │                  │
│  │   Engine        │  │   Manager       │                  │
│  │                 │  │                 │                  │
│  │  - Query Exec   │  │  - Chunking     │                  │
│  │  - Batching     │  │  - Compression  │                  │
│  │  - Progress     │  │  - Resume       │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  Status Bar                         │   │
│  │  [████████████████░░░░] 78% - Uploading Customers   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

#### Source Adapter Interface
```csharp
public interface ISourceAdapter
{
    string SourceName { get; }  // "Logo", "ETA", "Mikro"

    Task<bool> TestConnectionAsync(ConnectionSettings settings);
    Task<SourceMetadata> GetMetadataAsync();  // Tables, row counts

    Task<IEnumerable<CustomerDto>> ExtractCustomersAsync(ExtractOptions options);
    Task<IEnumerable<ProductDto>> ExtractProductsAsync(ExtractOptions options);
    Task<IEnumerable<StockDto>> ExtractStockAsync(ExtractOptions options);
    Task<IEnumerable<InvoiceDto>> ExtractInvoicesAsync(ExtractOptions options);
    Task<IEnumerable<AccountingEntryDto>> ExtractAccountingAsync(ExtractOptions options);
}

public class ConnectionSettings
{
    public string Server { get; set; }
    public string Database { get; set; }
    public string Username { get; set; }
    public string Password { get; set; }
    public int Port { get; set; } = 1433;
    public bool TrustedConnection { get; set; }
}

public class ExtractOptions
{
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int BatchSize { get; set; } = 1000;
    public bool IncludeInactive { get; set; }
}
```

#### Logo Adapter SQL Mappings
```sql
-- Logo Customers (CARI KARTLAR)
SELECT
    CODE as CustomerCode,
    DEFINITION_ as Name,
    ADDR1 as Address,
    CITY as City,
    TELNRS1 as Phone,
    EMAILADDR as Email,
    TAXNR as TaxNumber,
    TAXOFFICE as TaxOffice
FROM LG_XXX_CLCARD  -- XXX = Firma kodu
WHERE ACTIVE = 0    -- Logo'da 0 = Aktif

-- Logo Products (STOK KARTLARI)
SELECT
    CODE as ProductCode,
    NAME as ProductName,
    STGRPCODE as CategoryCode,
    UNITSETCODE as UnitCode,
    VAT as VatRate,
    MINLEVEL as MinStock,
    MAXLEVEL as MaxStock
FROM LG_XXX_ITEMS
WHERE ACTIVE = 0

-- Logo Stock (STOK MIKTARLARI)
SELECT
    i.CODE as ProductCode,
    w.CODE as WarehouseCode,
    ISNULL(st.ONHAND, 0) as Quantity
FROM LG_XXX_ITEMS i
CROSS JOIN LG_XXX_WAREHOUSE w
LEFT JOIN LG_XXX_STINVTOT st ON st.STOCKREF = i.LOGICALREF
    AND st.INVENNO = w.NR
```

---

### 2. Migration Gateway API

Stocker API'da yeni endpoint grubu.

#### Endpoints
```
POST   /api/migration/sessions              # Start new migration session
GET    /api/migration/sessions/{id}         # Get session status
DELETE /api/migration/sessions/{id}         # Cancel migration

POST   /api/migration/sessions/{id}/upload  # Upload data chunk
POST   /api/migration/sessions/{id}/validate # Validate uploaded data
GET    /api/migration/sessions/{id}/preview # Preview with errors
POST   /api/migration/sessions/{id}/commit  # Commit to database
POST   /api/migration/sessions/{id}/rollback # Rollback if needed
```

#### Migration Session Flow
```
┌──────────────────────────────────────────────────────────────────┐
│                    MIGRATION SESSION                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CREATE SESSION                                               │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ POST /api/migration/sessions                            │  │
│     │ {                                                       │  │
│     │   "sourceName": "Logo",                                 │  │
│     │   "entities": ["Customers", "Products", "Stock"],       │  │
│     │   "options": { "updateExisting": true }                 │  │
│     │ }                                                       │  │
│     │ Response: { "sessionId": "abc-123", "uploadToken": "x" }│  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  2. UPLOAD DATA (Chunked)                                        │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ POST /api/migration/sessions/{id}/upload                │  │
│     │ {                                                       │  │
│     │   "entity": "Customers",                                │  │
│     │   "chunkIndex": 0,                                      │  │
│     │   "totalChunks": 5,                                     │  │
│     │   "data": [{ ... }, { ... }]   // Max 1000 records      │  │
│     │ }                                                       │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  3. VALIDATE                                                     │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ POST /api/migration/sessions/{id}/validate              │  │
│     │ Response: {                                             │  │
│     │   "status": "completed",                                │  │
│     │   "totalRecords": 5000,                                 │  │
│     │   "validRecords": 4850,                                 │  │
│     │   "errorRecords": 150,                                  │  │
│     │   "warningRecords": 200                                 │  │
│     │ }                                                       │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  4. PREVIEW (User reviews errors)                                │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ GET /api/migration/sessions/{id}/preview?page=1         │  │
│     │ Response: {                                             │  │
│     │   "items": [                                            │  │
│     │     {                                                   │  │
│     │       "row": 15,                                        │  │
│     │       "entity": "Customer",                             │  │
│     │       "data": { "Code": "C001", "Name": "" },           │  │
│     │       "errors": [{ "field": "Name", "message": "..." }],│  │
│     │       "warnings": [...],                                │  │
│     │       "status": "error"                                 │  │
│     │     }                                                   │  │
│     │   ]                                                     │  │
│     │ }                                                       │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  5. COMMIT (Background job)                                      │
│     ┌─────────────────────────────────────────────────────────┐  │
│     │ POST /api/migration/sessions/{id}/commit                │  │
│     │ { "skipErrors": true }                                  │  │
│     │ Response: { "jobId": "hangfire-job-id" }                │  │
│     └─────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

### 3. Validation & Transform Engine

Dirty data handling icin katmanli validasyon.

#### Validation Layers
```
┌─────────────────────────────────────────────────────────────────┐
│                   VALIDATION PIPELINE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: STRUCTURAL VALIDATION                                 │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ Required fields check                                        │
│  ✓ Data type validation                                         │
│  ✓ String length limits                                         │
│  ✓ Numeric range validation                                     │
│                                                                 │
│  Layer 2: REFERENTIAL VALIDATION                                │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ Foreign key existence (Category, Brand, Unit)                │
│  ✓ Duplicate detection (Code, Barcode)                          │
│  ✓ Circular reference check                                     │
│                                                                 │
│  Layer 3: BUSINESS VALIDATION                                   │
│  ─────────────────────────────────────────────────────────────  │
│  ✓ Price > 0 for sellable items                                 │
│  ✓ Stock quantity >= 0                                          │
│  ✓ Tax rate in valid range                                      │
│  ✓ Date logic (start < end)                                     │
│                                                                 │
│  Layer 4: TRANSFORMATION                                        │
│  ─────────────────────────────────────────────────────────────  │
│  → Trim whitespace                                              │
│  → Normalize phone numbers                                      │
│  → Convert Turkish chars (optional)                             │
│  → Default value injection                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Dynamic Mapping System

> **Kritik**: Her Logo/ETA/Mikro kurulumu farklidir. Firmalar ozel alanlar (Custom Fields)
> kullanir. Bu nedenle **statik mapping yetersizdir**. Kullanici arayuzunde dinamik
> eslestirme yapilmalidir.

##### Schema Discovery (Desktop Connector)
```csharp
public class SourceMetadata
{
    public string SourceName { get; set; }           // "Logo Tiger"
    public string DatabaseVersion { get; set; }       // "3.00.01"
    public List<TableMetadata> Tables { get; set; }
}

public class TableMetadata
{
    public string TableName { get; set; }             // "LG_001_CLCARD"
    public string FriendlyName { get; set; }          // "Cari Kartlar"
    public int RowCount { get; set; }                 // 2450
    public List<ColumnMetadata> Columns { get; set; }
}

public class ColumnMetadata
{
    public string ColumnName { get; set; }            // "OZEL_KOD1"
    public string DataType { get; set; }              // "nvarchar(50)"
    public bool IsNullable { get; set; }
    public string SampleValue { get; set; }           // "ISTANBUL" (ilk 5 kayittan ornek)
    public bool IsStandardField { get; set; }         // Logo standart mi, ozel mi?
}
```

##### Dynamic Mapping UI Flow
```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 4: FIELD MAPPING (Dynamic)                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Source: Logo LG_001_CLCARD (2,450 records)                        │
│  Target: Stocker Customers                                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Source Column      Sample          →  Target Field   Status   │ │
│  │ ─────────────────────────────────────────────────────────────│ │
│  │ CODE              "C001"           →  Code           ✓ Auto   │ │
│  │ DEFINITION_       "ABC Ltd"        →  Name           ✓ Auto   │ │
│  │ ADDR1             "Kadikoy..."     →  Address        ✓ Auto   │ │
│  │ TELNRS1           "02161234567"    →  Phone          ✓ Auto   │ │
│  │ TAXNR             "1234567890"     →  TaxNumber      ✓ Auto   │ │
│  │ ─────────────────────────────────────────────────────────────│ │
│  │ OZEL_KOD1         "ISTANBUL"       →  [Select... ▼]  ⚠ Map    │ │
│  │                                       ├─ City                 │ │
│  │                                       ├─ Region               │ │
│  │                                       ├─ Custom Field 1       │ │
│  │                                       └─ (Skip this field)    │ │
│  │ OZEL_KOD2         "PREMIUM"        →  [Select... ▼]  ⚠ Map    │ │
│  │ OZEL_KOD3         ""               →  (Skip)         ○ Empty  │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [Auto-Map Standard Fields]  [Save as Template]  [Load Template]   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

##### Mapping Template (User-Created, Reusable)
```json
{
  "templateName": "ABC Holding - Logo Mapping",
  "sourceName": "Logo",
  "createdBy": "user@abc.com",
  "createdAt": "2024-01-15",
  "entityMappings": {
    "Customer": {
      "sourceTable": "LG_001_CLCARD",
      "targetEntity": "Customer",
      "fieldMappings": [
        {
          "source": "CODE",
          "target": "Code",
          "required": true,
          "transform": "trim|uppercase",
          "autoMapped": true
        },
        {
          "source": "DEFINITION_",
          "target": "Name",
          "required": true,
          "transform": "trim",
          "autoMapped": true
        },
        {
          "source": "OZEL_KOD1",
          "target": "City",
          "required": false,
          "transform": "trim",
          "autoMapped": false,
          "userNote": "Firma sehir kodunu bu alanda tutuyor"
        },
        {
          "source": "OZEL_KOD2",
          "target": "CustomerSegment",
          "required": false,
          "customFieldId": "cf_segment",
          "autoMapped": false
        }
      ],
      "defaultValues": {
        "CustomerType": "Company",
        "Currency": "TRY",
        "IsActive": true
      },
      "skipColumns": ["OZEL_KOD3", "OZEL_KOD4", "OZEL_KOD5"]
    }
  }
}
```

##### Auto-Mapping Algorithm
```csharp
public class AutoMappingService
{
    // Bilinen Logo/ETA/Mikro standart alanlari
    private static readonly Dictionary<string, string> KnownMappings = new()
    {
        // Logo Standard Fields
        ["CODE"] = "Code",
        ["DEFINITION_"] = "Name",
        ["ADDR1"] = "Address",
        ["CITY"] = "City",
        ["TELNRS1"] = "Phone",
        ["EMAILADDR"] = "Email",
        ["TAXNR"] = "TaxNumber",
        ["TAXOFFICE"] = "TaxOffice",

        // ETA Standard Fields
        ["CARIKOD"] = "Code",
        ["CARIAD"] = "Name",
        ["ADRES"] = "Address",
        ["VERGINO"] = "TaxNumber",

        // Mikro Standard Fields
        ["cari_kod"] = "Code",
        ["cari_unvan"] = "Name",
    };

    public List<FieldMapping> AutoMap(List<ColumnMetadata> sourceColumns,
                                       List<TargetField> targetFields)
    {
        var mappings = new List<FieldMapping>();

        foreach (var source in sourceColumns)
        {
            // 1. Bilinen mapping var mi?
            if (KnownMappings.TryGetValue(source.ColumnName.ToUpper(), out var target))
            {
                mappings.Add(new FieldMapping
                {
                    Source = source.ColumnName,
                    Target = target,
                    AutoMapped = true,
                    Confidence = 1.0
                });
                continue;
            }

            // 2. Fuzzy matching dene (Levenshtein distance)
            var bestMatch = FindBestMatch(source.ColumnName, targetFields);
            if (bestMatch.Confidence > 0.8)
            {
                mappings.Add(new FieldMapping
                {
                    Source = source.ColumnName,
                    Target = bestMatch.FieldName,
                    AutoMapped = true,
                    Confidence = bestMatch.Confidence,
                    NeedsReview = true  // Kullaniciya "dogru mu?" diye sor
                });
            }
            else
            {
                // 3. Eslesme bulunamadi, kullanici secmeli
                mappings.Add(new FieldMapping
                {
                    Source = source.ColumnName,
                    Target = null,
                    AutoMapped = false,
                    SampleValue = source.SampleValue
                });
            }
        }

        return mappings;
    }
}
```

---

### 4. Preview & Error Handling UI

Frontend'de kullanicinin hatalari gorup duzeltebilecegi arayuz.

#### Migration Wizard Flow
```
┌─────────────────────────────────────────────────────────────────┐
│                    MIGRATION WIZARD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: SOURCE SELECTION                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ○ Logo Object                                          │   │
│  │  ○ ETA SQL                                              │   │
│  │  ○ Mikro                                                │   │
│  │  ○ Netsis                                               │   │
│  │  ○ Parasut (API)                                        │   │
│  │  ● Excel/CSV Dosyasi                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Step 2: UPLOAD / CONNECT                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Option A: Upload Excel/CSV                             │   │
│  │  [████████████████████] 100%                            │   │
│  │                                                         │   │
│  │  Option B: Desktop Connector                            │   │
│  │  [Download Connector] → Run on customer PC              │   │
│  │  Status: Connected ✓   Last sync: 2 min ago             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Step 3: ENTITY SELECTION                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ☑ Musteriler (Customers)        2,450 kayit           │   │
│  │  ☑ Urunler (Products)            8,320 kayit           │   │
│  │  ☑ Stok (Stock)                 12,100 kayit           │   │
│  │  ☐ Faturalar (Invoices)         45,000 kayit           │   │
│  │  ☐ Muhasebe (Accounting)       120,000 kayit           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Step 4: FIELD MAPPING                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Source Field     →    Target Field      Status         │   │
│  │  ─────────────────────────────────────────────────────  │   │
│  │  CODE             →    Musteri Kodu      ✓ Mapped       │   │
│  │  DEFINITION_      →    Musteri Adi       ✓ Mapped       │   │
│  │  ADDR1            →    Adres             ✓ Mapped       │   │
│  │  CUSTOM_FIELD     →    [Select...]       ⚠ Unmapped     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Step 5: VALIDATION PREVIEW                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Summary                                        │   │   │
│  │  │  ────────────────────────────────────────────   │   │   │
│  │  │  Total Records:      8,320                      │   │   │
│  │  │  ✓ Valid:            7,950  (95.5%)             │   │   │
│  │  │  ⚠ Warnings:           220  (2.6%)              │   │   │
│  │  │  ✗ Errors:             150  (1.8%)              │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Errors (150)                    [Filter ▼]     │   │   │
│  │  │  ─────────────────────────────────────────────  │   │   │
│  │  │  Row 15  | URN001 | Name is empty     [Fix]     │   │   │
│  │  │  Row 28  | URN014 | Invalid category  [Fix]     │   │   │
│  │  │  Row 156 | URN089 | Duplicate barcode [Skip]    │   │   │
│  │  │  ...                                            │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Step 6: IMPORT                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ☑ Skip records with errors (150 records)               │   │
│  │  ☐ Create missing categories automatically              │   │
│  │  ☑ Update existing records if code matches              │   │
│  │                                                         │   │
│  │  [Start Import]                                         │   │
│  │                                                         │   │
│  │  Progress:                                              │   │
│  │  [████████████████░░░░░░░░░░░░░░] 52%                   │   │
│  │  Importing Products... 4,320 / 8,320                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Security Considerations

#### Authentication Flow
```
┌────────────────────────────────────────────────────────────────┐
│                    SECURE AUTHENTICATION                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. User logs into Stocker Web App                             │
│  2. Generates one-time Migration Token (valid 24h)             │
│  3. Downloads Desktop Connector with embedded token            │
│  4. Connector uses token for API authentication                │
│                                                                │
│  Token Structure:                                              │
│  {                                                             │
│    "tenantId": "xxx",                                          │
│    "userId": "xxx",                                            │
│    "scope": "migration:write",                                 │
│    "expiresAt": "2024-01-15T23:59:59Z",                       │
│    "sessionId": "migration-session-id"                         │
│  }                                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

#### Data Protection
```
┌────────────────────────────────────────────────────────────────┐
│                    DATA PROTECTION                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ✓ HTTPS/TLS 1.3 for all API communication                    │
│  ✓ Data encrypted at rest (AES-256)                           │
│  ✓ Temporary data deleted after import                        │
│  ✓ No source database credentials stored in cloud             │
│  ✓ Audit log for all migration operations                     │
│  ✓ Rate limiting on upload endpoints                          │
│  ✓ File size limits (max 100MB per chunk)                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Excel/CSV Import (MVP)
- [x] Basic Excel import (already exists in Inventory module)
- [ ] Validation preview UI
- [ ] Error handling with row-level feedback
- [ ] Background job processing

### Phase 2: Migration Gateway API
- [ ] Session management endpoints
- [ ] Chunked upload support
- [ ] Validation engine
- [ ] Preview endpoints
- [ ] Commit/Rollback logic

### Phase 3: Desktop Connector
- [ ] Windows application skeleton
- [ ] Logo adapter
- [ ] ETA adapter
- [ ] Mikro adapter
- [ ] Secure token handling

### Phase 4: Advanced Features
- [ ] Scheduled migrations (nightly sync)
- [ ] Delta/incremental import
- [ ] Conflict resolution UI
- [ ] Rollback capabilities

---

## Database Schema

```sql
-- Migration Sessions
CREATE TABLE migration_sessions (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,
    created_by UUID NOT NULL,
    source_name VARCHAR(50) NOT NULL,  -- 'Logo', 'ETA', 'Excel'
    status VARCHAR(20) NOT NULL,        -- 'uploading', 'validating', 'ready', 'importing', 'completed', 'failed'

    -- Statistics
    total_records INT DEFAULT 0,
    valid_records INT DEFAULT 0,
    error_records INT DEFAULT 0,
    imported_records INT DEFAULT 0,

    -- Options
    options JSONB,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    validated_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,    -- Auto-cleanup after 7 days

    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Migration Chunks (Uploaded data)
CREATE TABLE migration_chunks (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL,   -- 'Customer', 'Product', 'Stock'
    chunk_index INT NOT NULL,
    total_chunks INT NOT NULL,

    -- Data
    raw_data JSONB NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'validated', 'imported'

    created_at TIMESTAMPTZ DEFAULT NOW(),

    FOREIGN KEY (session_id) REFERENCES migration_sessions(id) ON DELETE CASCADE
);

-- Migration Validation Results
CREATE TABLE migration_validation_results (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    chunk_id UUID NOT NULL,
    row_index INT NOT NULL,
    entity_type VARCHAR(50) NOT NULL,

    -- Original data
    original_data JSONB NOT NULL,

    -- Validation result
    status VARCHAR(20) NOT NULL,  -- 'valid', 'warning', 'error'
    errors JSONB,                 -- [{"field": "Name", "message": "Required"}]
    warnings JSONB,

    -- User actions
    user_action VARCHAR(20),      -- 'skip', 'fix', 'import'
    fixed_data JSONB,

    FOREIGN KEY (session_id) REFERENCES migration_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (chunk_id) REFERENCES migration_chunks(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_migration_sessions_tenant ON migration_sessions(tenant_id);
CREATE INDEX idx_migration_sessions_status ON migration_sessions(status);
CREATE INDEX idx_migration_chunks_session ON migration_chunks(session_id);
CREATE INDEX idx_migration_validation_session ON migration_validation_results(session_id);
CREATE INDEX idx_migration_validation_status ON migration_validation_results(status);
```

---

## API DTOs

```csharp
// Request DTOs
public record CreateMigrationSessionRequest
{
    public required string SourceName { get; init; }
    public required List<string> Entities { get; init; }
    public MigrationOptions? Options { get; init; }
}

public record UploadChunkRequest
{
    public required string Entity { get; init; }
    public required int ChunkIndex { get; init; }
    public required int TotalChunks { get; init; }
    public required List<Dictionary<string, object>> Data { get; init; }
}

public record CommitMigrationRequest
{
    public bool SkipErrors { get; init; } = true;
    public bool CreateMissingReferences { get; init; } = false;
    public bool UpdateExisting { get; init; } = false;
}

// Response DTOs
public record MigrationSessionResponse
{
    public Guid SessionId { get; init; }
    public string Status { get; init; }
    public int TotalRecords { get; init; }
    public int ValidRecords { get; init; }
    public int ErrorRecords { get; init; }
    public int ImportedRecords { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
}

public record ValidationPreviewResponse
{
    public int TotalRecords { get; init; }
    public int ValidCount { get; init; }
    public int WarningCount { get; init; }
    public int ErrorCount { get; init; }
    public List<ValidationResultItem> Items { get; init; }
}

public record ValidationResultItem
{
    public int RowIndex { get; init; }
    public string Entity { get; init; }
    public string Status { get; init; }
    public Dictionary<string, object> OriginalData { get; init; }
    public List<ValidationError> Errors { get; init; }
    public List<ValidationWarning> Warnings { get; init; }
}
```

---

## Hangfire Jobs

```csharp
public class MigrationImportJob
{
    [Queue("default")]
    [AutomaticRetry(Attempts = 3)]
    public async Task ExecuteImportAsync(
        Guid sessionId,
        CommitMigrationRequest options,
        CancellationToken cancellationToken)
    {
        // 1. Load session and chunks
        // 2. Filter valid records (or based on user selection)
        // 3. Process in batches
        // 4. Update progress in real-time (SignalR)
        // 5. Handle failures with rollback
    }
}

public class MigrationCleanupJob
{
    [Queue("maintenance")]
    public async Task CleanupExpiredSessionsAsync(CancellationToken cancellationToken)
    {
        // Delete sessions older than 7 days
        // Clean up temporary files
    }
}
```

---

## Estimated Effort

| Component | Estimated Days |
|-----------|----------------|
| Migration Gateway API | 5-7 days |
| Validation Engine | 3-4 days |
| Preview UI (React) | 4-5 days |
| Desktop Connector (MVP) | 7-10 days |
| Logo Adapter | 3-4 days |
| ETA Adapter | 2-3 days |
| Mikro Adapter | 2-3 days |
| Testing & Polish | 5-7 days |
| **Total** | **31-43 days** |

---

## Next Steps

1. **Immediate**: Enhance existing Excel import with validation preview
2. **Short-term**: Build Migration Gateway API endpoints
3. **Medium-term**: Develop Desktop Connector for Logo
4. **Long-term**: Add more ERP adapters and advanced features
