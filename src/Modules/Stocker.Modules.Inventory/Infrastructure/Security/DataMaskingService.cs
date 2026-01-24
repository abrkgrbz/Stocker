using Microsoft.Extensions.Logging;

namespace Stocker.Modules.Inventory.Infrastructure.Security;

/// <summary>
/// Data masking service for protecting sensitive inventory data in logs and exports.
/// Applies field-level masking based on data classification.
/// </summary>
public class DataMaskingService
{
    private readonly ILogger<DataMaskingService> _logger;

    private static readonly HashSet<string> SensitiveFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "CostPrice", "PurchasePrice", "SupplierPrice", "UnitCost",
        "ProfitMargin", "Markup", "Discount", "TaxRate",
        "SupplierCode", "SupplierContact", "SupplierEmail"
    };

    private static readonly HashSet<string> PiiFields = new(StringComparer.OrdinalIgnoreCase)
    {
        "CreatedByEmail", "ModifiedByEmail", "ApprovedByName",
        "ContactPhone", "ContactEmail", "Address"
    };

    public DataMaskingService(ILogger<DataMaskingService> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Mask a value based on field classification.
    /// </summary>
    public string Mask(string fieldName, string? value)
    {
        if (string.IsNullOrEmpty(value)) return string.Empty;

        if (SensitiveFields.Contains(fieldName))
            return MaskFinancial(value);

        if (PiiFields.Contains(fieldName))
            return MaskPii(fieldName, value);

        return value;
    }

    /// <summary>
    /// Check if a field should be masked.
    /// </summary>
    public bool ShouldMask(string fieldName)
    {
        return SensitiveFields.Contains(fieldName) || PiiFields.Contains(fieldName);
    }

    /// <summary>
    /// Mask dictionary of field values for export/logging.
    /// </summary>
    public Dictionary<string, string?> MaskFields(Dictionary<string, string?> fields)
    {
        var masked = new Dictionary<string, string?>(fields.Count);
        foreach (var kvp in fields)
        {
            masked[kvp.Key] = ShouldMask(kvp.Key) ? Mask(kvp.Key, kvp.Value) : kvp.Value;
        }
        return masked;
    }

    /// <summary>
    /// Get data classification for a field.
    /// </summary>
    public DataClassification GetClassification(string fieldName)
    {
        if (SensitiveFields.Contains(fieldName)) return DataClassification.Confidential;
        if (PiiFields.Contains(fieldName)) return DataClassification.PersonalData;
        return DataClassification.Internal;
    }

    private static string MaskFinancial(string value)
    {
        // Show only magnitude: "1234.56" → "1,2**.**"
        if (decimal.TryParse(value, out var amount))
        {
            var intPart = (int)Math.Abs(amount);
            var digits = intPart.ToString();
            if (digits.Length <= 1) return "***";
            return $"{digits[0]},{"*".PadLeft(digits.Length - 1, '*')}.**";
        }
        return "***.**";
    }

    private static string MaskPii(string fieldName, string value)
    {
        if (fieldName.Contains("Email", StringComparison.OrdinalIgnoreCase))
            return MaskEmail(value);

        if (fieldName.Contains("Phone", StringComparison.OrdinalIgnoreCase))
            return MaskPhone(value);

        // Generic masking: show first and last char
        if (value.Length <= 4) return "****";
        return $"{value[0]}{"*".PadLeft(value.Length - 2, '*')}{value[^1]}";
    }

    private static string MaskEmail(string email)
    {
        var parts = email.Split('@');
        if (parts.Length != 2) return "***@***.***";
        var local = parts[0];
        var domain = parts[1];
        var maskedLocal = local.Length <= 2 ? "**" : $"{local[0]}{"*".PadLeft(local.Length - 2, '*')}{local[^1]}";
        return $"{maskedLocal}@{domain}";
    }

    private static string MaskPhone(string phone)
    {
        if (phone.Length <= 4) return "****";
        return $"{"*".PadLeft(phone.Length - 4, '*')}{phone[^4..]}";
    }
}

/// <summary>
/// Data classification levels for inventory fields.
/// </summary>
public enum DataClassification
{
    /// <summary>General internal data.</summary>
    Internal,
    /// <summary>Financial/competitive data requiring protection.</summary>
    Confidential,
    /// <summary>Personally identifiable information.</summary>
    PersonalData,
    /// <summary>Publicly available data.</summary>
    Public
}
