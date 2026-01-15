using ClosedXML.Excel;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;

namespace Stocker.Infrastructure.Services.Migration;

/// <summary>
/// ClosedXML implementation of IExcelTemplateGenerator
/// Generates Excel templates for data migration with proper headers, validation, and examples
/// </summary>
public class ExcelTemplateGenerator : IExcelTemplateGenerator
{
    public (byte[] FileContent, string FileName, string ContentType) GenerateTemplate(MigrationEntityType entityType)
    {
        using var workbook = new XLWorkbook();

        // Create main data sheet
        var dataSheet = workbook.Worksheets.Add("Veri");

        // Create instructions sheet
        var instructionsSheet = workbook.Worksheets.Add("Açıklamalar");

        // Get schema for entity type
        var schema = GetSchemaForEntity(entityType);

        // Add headers and formatting to data sheet
        AddHeadersAndFormatting(dataSheet, schema);

        // Add example data
        AddExampleData(dataSheet, schema, entityType);

        // Add instructions
        AddInstructions(instructionsSheet, schema, entityType);

        // Adjust column widths
        dataSheet.Columns().AdjustToContents();
        instructionsSheet.Columns().AdjustToContents();

        // Save to memory stream
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);

        var fileName = $"stocker_{entityType.ToString().ToLower()}_template.xlsx";
        var contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

        return (stream.ToArray(), fileName, contentType);
    }

    private void AddHeadersAndFormatting(IXLWorksheet sheet, EntitySchema schema)
    {
        var headerRow = sheet.Row(1);

        for (int i = 0; i < schema.Fields.Count; i++)
        {
            var field = schema.Fields[i];
            var cell = sheet.Cell(1, i + 1);

            // Set header text
            cell.Value = field.DisplayName;

            // Mark required fields with asterisk
            if (field.IsRequired)
            {
                cell.Value = $"{field.DisplayName} *";
            }

            // Header styling
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.LightSteelBlue;
            cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;

            // Add comment with field info
            var comment = $"Alan Adı: {field.Name}\n" +
                         $"Veri Tipi: {field.DataType}\n" +
                         $"Zorunlu: {(field.IsRequired ? "Evet" : "Hayır")}";

            if (field.MaxLength.HasValue)
            {
                comment += $"\nMaksimum Uzunluk: {field.MaxLength}";
            }

            if (!string.IsNullOrEmpty(field.Description))
            {
                comment += $"\nAçıklama: {field.Description}";
            }

            if (!string.IsNullOrEmpty(field.DefaultValue))
            {
                comment += $"\nVarsayılan: {field.DefaultValue}";
            }

            cell.CreateComment().AddText(comment);

            // Set column validation based on data type
            SetColumnValidation(sheet, i + 1, field);
        }
    }

    private void SetColumnValidation(IXLWorksheet sheet, int columnIndex, FieldSchema field)
    {
        var range = sheet.Range(2, columnIndex, 1000, columnIndex);

        switch (field.DataType.ToLower())
        {
            case "decimal":
                range.Style.NumberFormat.Format = "#,##0.00";
                break;
            case "int":
                range.Style.NumberFormat.Format = "#,##0";
                break;
            case "datetime":
            case "date":
                range.Style.NumberFormat.Format = "dd.MM.yyyy";
                break;
            case "bool":
                var boolValidation = range.CreateDataValidation();
                boolValidation.List("Evet,Hayır", true);
                break;
        }

        // Add max length validation for string fields
        if (field.DataType.ToLower() == "string" && field.MaxLength.HasValue)
        {
            var validation = range.CreateDataValidation();
            validation.TextLength.EqualOrLessThan(field.MaxLength.Value);
            validation.ErrorMessage = $"Bu alan en fazla {field.MaxLength} karakter olabilir";
        }
    }

    private void AddExampleData(IXLWorksheet sheet, EntitySchema schema, MigrationEntityType entityType)
    {
        var examples = GetExampleData(entityType);

        for (int rowIndex = 0; rowIndex < examples.Count; rowIndex++)
        {
            var example = examples[rowIndex];
            for (int colIndex = 0; colIndex < schema.Fields.Count; colIndex++)
            {
                var field = schema.Fields[colIndex];
                if (example.TryGetValue(field.Name, out var value))
                {
                    sheet.Cell(rowIndex + 2, colIndex + 1).Value = value;
                }
            }
        }

        // Style example rows
        for (int rowIndex = 2; rowIndex <= examples.Count + 1; rowIndex++)
        {
            sheet.Row(rowIndex).Style.Font.Italic = true;
            sheet.Row(rowIndex).Style.Font.FontColor = XLColor.Gray;
        }

        // Add note about example data
        if (examples.Count > 0)
        {
            var noteCell = sheet.Cell(examples.Count + 3, 1);
            noteCell.Value = "⚠️ Yukarıdaki veriler örnek olarak eklenmiştir. Lütfen kendi verilerinizle değiştirin.";
            noteCell.Style.Font.Bold = true;
            noteCell.Style.Font.FontColor = XLColor.OrangeRed;
        }
    }

    private void AddInstructions(IXLWorksheet sheet, EntitySchema schema, MigrationEntityType entityType)
    {
        // Title
        sheet.Cell(1, 1).Value = $"Stocker {schema.DisplayName} Import Şablonu";
        sheet.Cell(1, 1).Style.Font.Bold = true;
        sheet.Cell(1, 1).Style.Font.FontSize = 14;

        // Description
        sheet.Cell(3, 1).Value = schema.Description;

        // Instructions
        sheet.Cell(5, 1).Value = "Kullanım Talimatları:";
        sheet.Cell(5, 1).Style.Font.Bold = true;

        var instructions = new[]
        {
            "1. 'Veri' sayfasındaki örnek verileri silin ve kendi verilerinizi girin.",
            "2. * ile işaretli alanlar zorunludur, mutlaka doldurulmalıdır.",
            "3. Her satır bir kayıt olarak sisteme aktarılacaktır.",
            "4. Tarih alanları için GG.AA.YYYY formatını kullanın (örn: 25.12.2024).",
            "5. Sayısal alanlarda virgül (,) ondalık ayracı olarak kullanın.",
            "6. Boş bırakılan opsiyonel alanlar varsayılan değerlerle doldurulacaktır.",
            "7. Kodlar benzersiz olmalıdır, tekrar eden kodlar hata verecektir.",
            "8. Dosyayı .xlsx formatında kaydedin."
        };

        for (int i = 0; i < instructions.Length; i++)
        {
            sheet.Cell(6 + i, 1).Value = instructions[i];
        }

        // Field reference table
        int startRow = 15;
        sheet.Cell(startRow, 1).Value = "Alan Açıklamaları:";
        sheet.Cell(startRow, 1).Style.Font.Bold = true;

        // Header row
        sheet.Cell(startRow + 1, 1).Value = "Alan Adı";
        sheet.Cell(startRow + 1, 2).Value = "Veri Tipi";
        sheet.Cell(startRow + 1, 3).Value = "Zorunlu";
        sheet.Cell(startRow + 1, 4).Value = "Açıklama";
        sheet.Cell(startRow + 1, 5).Value = "Örnek";

        var headerRange = sheet.Range(startRow + 1, 1, startRow + 1, 5);
        headerRange.Style.Font.Bold = true;
        headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

        // Field rows
        for (int i = 0; i < schema.Fields.Count; i++)
        {
            var field = schema.Fields[i];
            var row = startRow + 2 + i;

            sheet.Cell(row, 1).Value = field.DisplayName;
            sheet.Cell(row, 2).Value = GetDataTypeDisplayName(field.DataType);
            sheet.Cell(row, 3).Value = field.IsRequired ? "Evet" : "Hayır";
            sheet.Cell(row, 4).Value = field.Description ?? "";
            sheet.Cell(row, 5).Value = GetExampleValue(field);

            // Highlight required fields
            if (field.IsRequired)
            {
                sheet.Range(row, 1, row, 5).Style.Fill.BackgroundColor = XLColor.LightYellow;
            }
        }

        // Add borders to table
        var tableRange = sheet.Range(startRow + 1, 1, startRow + 1 + schema.Fields.Count, 5);
        tableRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
        tableRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
    }

    private string GetDataTypeDisplayName(string dataType)
    {
        return dataType.ToLower() switch
        {
            "string" => "Metin",
            "int" => "Tam Sayı",
            "decimal" => "Ondalık Sayı",
            "datetime" => "Tarih/Saat",
            "date" => "Tarih",
            "bool" => "Evet/Hayır",
            _ => dataType
        };
    }

    private string GetExampleValue(FieldSchema field)
    {
        return field.Name switch
        {
            "Code" => "PRD-001",
            "Name" => "Örnek Ürün Adı",
            "TaxNumber" => "1234567890",
            "Phone" => "0212 555 1234",
            "Email" => "ornek@firma.com",
            "Quantity" => "100",
            "Price" => "99,90",
            "Date" => "01.01.2024",
            "VatRate" => "18",
            _ => field.DefaultValue ?? ""
        };
    }

    private List<Dictionary<string, string>> GetExampleData(MigrationEntityType entityType)
    {
        return entityType switch
        {
            MigrationEntityType.Product => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["Code"] = "PRD-001",
                    ["Name"] = "Örnek Ürün 1",
                    ["Unit"] = "Adet",
                    ["VatRate"] = "18",
                    ["SalePrice"] = "150,00",
                    ["PurchasePrice"] = "100,00"
                },
                new()
                {
                    ["Code"] = "PRD-002",
                    ["Name"] = "Örnek Ürün 2",
                    ["Unit"] = "Kg",
                    ["VatRate"] = "8",
                    ["SalePrice"] = "45,50",
                    ["PurchasePrice"] = "30,00"
                }
            },
            MigrationEntityType.Customer => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["Name"] = "Örnek Müşteri A.Ş.",
                    ["Email"] = "info@ornek.com",
                    ["Phone"] = "0216 555 1234",
                    ["TaxNumber"] = "1234567890",
                    ["TaxOffice"] = "Kadıköy",
                    ["Address"] = "Atatürk Cad. No:123",
                    ["City"] = "İstanbul",
                    ["District"] = "Kadıköy",
                    ["Website"] = "www.ornek.com",
                    ["Industry"] = "Perakende",
                    ["ContactPerson"] = "Mehmet Yılmaz",
                    ["CreditLimit"] = "50000",
                    ["Description"] = "Kurumsal müşteri"
                },
                new()
                {
                    ["Name"] = "Ahmet Yılmaz",
                    ["Email"] = "ahmet@email.com",
                    ["Phone"] = "0532 555 4321",
                    ["TaxNumber"] = "12345678901",
                    ["City"] = "Ankara",
                    ["Industry"] = "Bilişim"
                }
            },
            MigrationEntityType.Supplier => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["Code"] = "TED-001",
                    ["Name"] = "Tedarikçi Firma Ltd.",
                    ["TaxNumber"] = "9876543210",
                    ["TaxOffice"] = "Beşiktaş",
                    ["Phone"] = "0212 444 5678"
                }
            },
            MigrationEntityType.Category => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["Code"] = "KAT-001",
                    ["Name"] = "Elektronik"
                },
                new()
                {
                    ["Code"] = "KAT-002",
                    ["Name"] = "Bilgisayar",
                    ["ParentCode"] = "KAT-001"
                }
            },
            MigrationEntityType.Brand => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["Code"] = "MRK-001",
                    ["Name"] = "Samsung",
                    ["Description"] = "Güney Kore elektronik markası"
                },
                new()
                {
                    ["Code"] = "MRK-002",
                    ["Name"] = "Apple",
                    ["Description"] = "ABD teknoloji markası"
                }
            },
            MigrationEntityType.Unit => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["Code"] = "AD",
                    ["Name"] = "Adet",
                    ["Description"] = "Sayılabilir birim"
                },
                new()
                {
                    ["Code"] = "KG",
                    ["Name"] = "Kilogram",
                    ["Description"] = "Ağırlık birimi"
                },
                new()
                {
                    ["Code"] = "LT",
                    ["Name"] = "Litre",
                    ["Description"] = "Hacim birimi"
                }
            },
            MigrationEntityType.Warehouse => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["Code"] = "DEP-01",
                    ["Name"] = "Ana Depo",
                    ["IsDefault"] = "Evet"
                },
                new()
                {
                    ["Code"] = "DEP-02",
                    ["Name"] = "Şube Deposu"
                }
            },
            MigrationEntityType.OpeningBalance => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["ProductCode"] = "PRD-001",
                    ["WarehouseCode"] = "DEP-01",
                    ["Quantity"] = "100",
                    ["UnitCost"] = "95,00"
                }
            },
            MigrationEntityType.StockMovement => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["ProductCode"] = "PRD-001",
                    ["WarehouseCode"] = "DEP-01",
                    ["Quantity"] = "50",
                    ["MovementType"] = "Giris",
                    ["Date"] = "15.01.2024"
                }
            },
            MigrationEntityType.Stock => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["ProductCode"] = "PRD-001",
                    ["WarehouseCode"] = "DEP-01",
                    ["Quantity"] = "100",
                    ["UnitCost"] = "95,00"
                }
            },
            MigrationEntityType.Invoice => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["InvoiceNo"] = "FTR-2024-001",
                    ["InvoiceType"] = "Satis",
                    ["CustomerCode"] = "MUS-001",
                    ["Date"] = "15.01.2024",
                    ["TotalAmount"] = "1.180,00",
                    ["VatAmount"] = "180,00"
                }
            },
            MigrationEntityType.InvoiceItem => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["InvoiceNo"] = "FTR-2024-001",
                    ["ProductCode"] = "PRD-001",
                    ["Quantity"] = "10",
                    ["UnitPrice"] = "100,00",
                    ["VatRate"] = "18",
                    ["TotalPrice"] = "1.180,00"
                }
            },
            MigrationEntityType.AccountingEntry => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["EntryNo"] = "YEV-2024-001",
                    ["Date"] = "15.01.2024",
                    ["AccountCode"] = "100.01",
                    ["Description"] = "Kasa girişi",
                    ["Debit"] = "1.000,00",
                    ["Credit"] = "0,00"
                }
            },
            MigrationEntityType.PriceList => new List<Dictionary<string, string>>
            {
                new()
                {
                    ["ProductCode"] = "PRD-001",
                    ["PriceListCode"] = "PERAKENDE",
                    ["Price"] = "150,00",
                    ["Currency"] = "TRY"
                }
            },
            _ => new List<Dictionary<string, string>>()
        };
    }

    private EntitySchema GetSchemaForEntity(MigrationEntityType entityType)
    {
        return entityType switch
        {
            MigrationEntityType.Product => new EntitySchema
            {
                DisplayName = "Ürünler",
                Description = "Stok/Ürün kartları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("Code", "Ürün Kodu", "string", true, 50, "Benzersiz ürün kodu"),
                    new("Name", "Ürün Adı", "string", true, 200, "Ürün adı/açıklaması"),
                    new("Description", "Detaylı Açıklama", "string", false, 500),
                    new("Barcode", "Barkod", "string", false, 50, "EAN13, UPC veya özel barkod"),
                    new("CategoryCode", "Kategori Kodu", "string", false, 50),
                    new("Unit", "Birim", "string", true, 20, "Adet, Kg, Lt, Mt vb.", "Adet"),
                    new("VatRate", "KDV Oranı (%)", "decimal", false, null, "0, 1, 8, 10, 18, 20", "18"),
                    new("PurchasePrice", "Alış Fiyatı", "decimal", false, null, "KDV hariç alış fiyatı"),
                    new("SalePrice", "Satış Fiyatı", "decimal", false, null, "KDV hariç satış fiyatı"),
                    new("MinStock", "Minimum Stok", "decimal", false, null, "Kritik stok seviyesi"),
                    new("MaxStock", "Maksimum Stok", "decimal", false, null, "Maksimum stok seviyesi"),
                }
            },
            MigrationEntityType.Customer => new EntitySchema
            {
                DisplayName = "Müşteriler",
                Description = "CRM müşteri kartları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("Name", "Firma/Kişi Adı", "string", true, 200, "Zorunlu - Müşteri veya firma adı"),
                    new("Email", "E-posta", "string", true, 100, "Zorunlu - Geçerli e-posta adresi"),
                    new("Phone", "Telefon", "string", false, 20, "İletişim telefon numarası"),
                    new("TaxNumber", "Vergi/TC No", "string", false, 20, "VKN (10 hane) veya TCKN (11 hane)"),
                    new("TaxOffice", "Vergi Dairesi", "string", false, 100, "Vergi dairesi adı"),
                    new("Address", "Adres", "string", false, 500, "Açık adres"),
                    new("City", "İl", "string", false, 50, "Şehir/İl"),
                    new("District", "İlçe", "string", false, 50, "İlçe"),
                    new("Country", "Ülke", "string", false, 50, "Ülke (varsayılan: Türkiye)", "Türkiye"),
                    new("PostalCode", "Posta Kodu", "string", false, 10, "Posta kodu"),
                    new("Website", "Web Sitesi", "string", false, 200, "Firma web sitesi"),
                    new("Industry", "Sektör", "string", false, 100, "Faaliyet sektörü"),
                    new("ContactPerson", "Yetkili Kişi", "string", false, 100, "İlgili/yetkili kişi adı"),
                    new("CreditLimit", "Kredi Limiti", "decimal", false, null, "TL cinsinden kredi limiti"),
                    new("Description", "Açıklama", "string", false, 500, "Müşteri hakkında notlar"),
                }
            },
            MigrationEntityType.Supplier => new EntitySchema
            {
                DisplayName = "Tedarikçiler",
                Description = "Tedarikçi/Satıcı kartları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("Code", "Tedarikçi Kodu", "string", true, 50),
                    new("Name", "Firma Adı", "string", true, 200),
                    new("TaxNumber", "Vergi No", "string", false, 20),
                    new("TaxOffice", "Vergi Dairesi", "string", false, 100),
                    new("Phone", "Telefon", "string", false, 20),
                    new("Email", "E-posta", "string", false, 100),
                    new("Address", "Adres", "string", false, 500),
                    new("ContactPerson", "İlgili Kişi", "string", false, 100),
                }
            },
            MigrationEntityType.Category => new EntitySchema
            {
                DisplayName = "Kategoriler",
                Description = "Ürün kategorileri için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("Code", "Kategori Kodu", "string", true, 50),
                    new("Name", "Kategori Adı", "string", true, 100),
                    new("ParentCode", "Üst Kategori Kodu", "string", false, 50, "Hiyerarşik yapı için"),
                    new("Description", "Açıklama", "string", false, 500),
                }
            },
            MigrationEntityType.Brand => new EntitySchema
            {
                DisplayName = "Markalar",
                Description = "Ürün markaları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("Code", "Marka Kodu", "string", true, 50, "Benzersiz marka kodu"),
                    new("Name", "Marka Adı", "string", true, 100, "Markanın tam adı"),
                    new("Description", "Açıklama", "string", false, 500, "Marka hakkında ek bilgi"),
                }
            },
            MigrationEntityType.Unit => new EntitySchema
            {
                DisplayName = "Birimler",
                Description = "Ürün birimleri için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("Code", "Birim Kodu", "string", true, 20, "Benzersiz birim kodu (örn: AD, KG, LT)"),
                    new("Name", "Birim Adı", "string", true, 50, "Birim adı (örn: Adet, Kilogram, Litre)"),
                    new("Description", "Açıklama", "string", false, 200),
                }
            },
            MigrationEntityType.Warehouse => new EntitySchema
            {
                DisplayName = "Depolar",
                Description = "Depo tanımları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("Code", "Depo Kodu", "string", true, 50),
                    new("Name", "Depo Adı", "string", true, 100),
                    new("Address", "Adres", "string", false, 500),
                    new("City", "İl", "string", false, 50),
                    new("IsDefault", "Varsayılan Depo", "bool", false, null, null, "Hayır"),
                }
            },
            MigrationEntityType.OpeningBalance => new EntitySchema
            {
                DisplayName = "Açılış Stokları",
                Description = "Başlangıç stok miktarları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("ProductCode", "Ürün Kodu", "string", true, 50),
                    new("WarehouseCode", "Depo Kodu", "string", true, 50),
                    new("Quantity", "Miktar", "decimal", true),
                    new("UnitCost", "Birim Maliyet", "decimal", false, null, "Ortalama maliyet için"),
                    new("LotNumber", "Lot/Parti No", "string", false, 50),
                    new("ExpiryDate", "Son Kullanma Tarihi", "date", false),
                }
            },
            MigrationEntityType.StockMovement => new EntitySchema
            {
                DisplayName = "Stok Hareketleri",
                Description = "Geçmiş stok hareketleri için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("ProductCode", "Ürün Kodu", "string", true, 50),
                    new("WarehouseCode", "Depo Kodu", "string", true, 50),
                    new("Quantity", "Miktar", "decimal", true, null, "Giriş için pozitif, çıkış için negatif"),
                    new("MovementType", "Hareket Tipi", "string", true, 20, "Giris, Cikis, Transfer, Sayim"),
                    new("Date", "İşlem Tarihi", "datetime", true),
                    new("DocumentNo", "Belge No", "string", false, 50),
                    new("Description", "Açıklama", "string", false, 500),
                }
            },
            MigrationEntityType.PriceList => new EntitySchema
            {
                DisplayName = "Fiyat Listeleri",
                Description = "Ürün fiyat listeleri için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("ProductCode", "Ürün Kodu", "string", true, 50),
                    new("PriceListCode", "Fiyat Listesi Kodu", "string", true, 50),
                    new("Price", "Fiyat", "decimal", true),
                    new("Currency", "Para Birimi", "string", false, 3, null, "TRY"),
                    new("ValidFrom", "Geçerlilik Başlangıcı", "date", false),
                    new("ValidTo", "Geçerlilik Bitişi", "date", false),
                }
            },
            MigrationEntityType.Stock => new EntitySchema
            {
                DisplayName = "Stok Miktarları",
                Description = "Mevcut stok miktarları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("ProductCode", "Ürün Kodu", "string", true, 50, "Sistemde kayıtlı ürün kodu"),
                    new("WarehouseCode", "Depo Kodu", "string", true, 50, "Sistemde kayıtlı depo kodu"),
                    new("Quantity", "Miktar", "decimal", true, null, "Stok miktarı"),
                    new("UnitCost", "Birim Maliyet", "decimal", false, null, "Ortalama birim maliyet"),
                    new("LotNumber", "Lot/Parti No", "string", false, 50),
                    new("ExpiryDate", "Son Kullanma Tarihi", "date", false),
                }
            },
            MigrationEntityType.Invoice => new EntitySchema
            {
                DisplayName = "Faturalar",
                Description = "Satış ve alış faturaları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("InvoiceNo", "Fatura No", "string", true, 50, "Benzersiz fatura numarası"),
                    new("InvoiceType", "Fatura Tipi", "string", true, 20, "Satis, Alis, Iade"),
                    new("CustomerCode", "Cari Kodu", "string", true, 50, "Müşteri veya tedarikçi kodu"),
                    new("Date", "Fatura Tarihi", "datetime", true),
                    new("DueDate", "Vade Tarihi", "datetime", false),
                    new("TotalAmount", "Toplam Tutar", "decimal", true, null, "KDV dahil toplam"),
                    new("VatAmount", "KDV Tutarı", "decimal", false),
                    new("DiscountAmount", "İskonto Tutarı", "decimal", false),
                    new("Description", "Açıklama", "string", false, 500),
                }
            },
            MigrationEntityType.InvoiceItem => new EntitySchema
            {
                DisplayName = "Fatura Kalemleri",
                Description = "Fatura detay satırları için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("InvoiceNo", "Fatura No", "string", true, 50, "İlgili fatura numarası"),
                    new("LineNo", "Satır No", "int", false, null, "Fatura satır sırası"),
                    new("ProductCode", "Ürün Kodu", "string", true, 50),
                    new("Quantity", "Miktar", "decimal", true),
                    new("UnitPrice", "Birim Fiyat", "decimal", true, null, "KDV hariç birim fiyat"),
                    new("VatRate", "KDV Oranı", "decimal", false, null, "0, 1, 8, 10, 18, 20"),
                    new("DiscountRate", "İskonto Oranı", "decimal", false),
                    new("TotalPrice", "Toplam Tutar", "decimal", false, null, "KDV dahil satır toplamı"),
                    new("WarehouseCode", "Depo Kodu", "string", false, 50),
                }
            },
            MigrationEntityType.AccountingEntry => new EntitySchema
            {
                DisplayName = "Muhasebe Kayıtları",
                Description = "Yevmiye/muhasebe fişleri için import şablonu",
                Fields = new List<FieldSchema>
                {
                    new("EntryNo", "Fiş No", "string", true, 50, "Benzersiz fiş numarası"),
                    new("Date", "Fiş Tarihi", "datetime", true),
                    new("AccountCode", "Hesap Kodu", "string", true, 50, "Muhasebe hesap kodu"),
                    new("Description", "Açıklama", "string", false, 500, "İşlem açıklaması"),
                    new("Debit", "Borç", "decimal", false, null, "Borç tutarı"),
                    new("Credit", "Alacak", "decimal", false, null, "Alacak tutarı"),
                    new("DocumentNo", "Belge No", "string", false, 50, "İlişkili belge numarası"),
                    new("DocumentType", "Belge Tipi", "string", false, 20, "Fatura, Makbuz, Virman vb."),
                }
            },
            _ => new EntitySchema
            {
                DisplayName = entityType.ToString(),
                Description = "Şablon tanımlı değil",
                Fields = new List<FieldSchema>()
            }
        };
    }

    private class EntitySchema
    {
        public string DisplayName { get; set; } = "";
        public string Description { get; set; } = "";
        public List<FieldSchema> Fields { get; set; } = new();
    }

    private class FieldSchema
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string DataType { get; set; }
        public bool IsRequired { get; set; }
        public int? MaxLength { get; set; }
        public string? Description { get; set; }
        public string? DefaultValue { get; set; }

        public FieldSchema(
            string name,
            string displayName,
            string dataType,
            bool isRequired,
            int? maxLength = null,
            string? description = null,
            string? defaultValue = null)
        {
            Name = name;
            DisplayName = displayName;
            DataType = dataType;
            IsRequired = isRequired;
            MaxLength = maxLength;
            Description = description;
            DefaultValue = defaultValue;
        }
    }
}
