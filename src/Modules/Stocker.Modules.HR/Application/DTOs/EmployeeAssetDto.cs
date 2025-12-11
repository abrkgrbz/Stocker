namespace Stocker.Modules.HR.Application.DTOs;

/// <summary>
/// Data transfer object for EmployeeAsset entity
/// </summary>
public record EmployeeAssetDto
{
    public int Id { get; init; }
    public int EmployeeId { get; init; }
    public string EmployeeName { get; init; } = string.Empty;
    public string AssetType { get; init; } = string.Empty;
    public string Status { get; init; } = string.Empty;

    // Asset Information
    public string AssetName { get; init; } = string.Empty;
    public string? AssetCode { get; init; }
    public string? SerialNumber { get; init; }
    public string? Model { get; init; }
    public string? Brand { get; init; }
    public string? Description { get; init; }

    // Value Information
    public decimal? PurchaseValue { get; init; }
    public decimal? CurrentValue { get; init; }
    public string Currency { get; init; } = "TRY";
    public DateTime? PurchaseDate { get; init; }
    public DateTime? WarrantyEndDate { get; init; }

    // Assignment Information
    public DateTime AssignmentDate { get; init; }
    public DateTime? ReturnDate { get; init; }
    public DateTime? ExpectedReturnDate { get; init; }
    public int? AssignedById { get; init; }
    public string? AssignedByName { get; init; }
    public int? ReceivedById { get; init; }
    public string? ReceivedByName { get; init; }

    // Location Information
    public string? Location { get; init; }
    public int? DepartmentId { get; init; }
    public string? DepartmentName { get; init; }
    public string? Office { get; init; }

    // Condition Information
    public string ConditionAtAssignment { get; init; } = string.Empty;
    public string? ConditionAtReturn { get; init; }
    public string? ConditionNotes { get; init; }
    public bool HasDamage { get; init; }
    public string? DamageDescription { get; init; }
    public decimal? DamageCost { get; init; }

    // IT Assets
    public string? IpAddress { get; init; }
    public string? MacAddress { get; init; }
    public string? Hostname { get; init; }
    public string? OperatingSystem { get; init; }
    public string? SoftwareLicenses { get; init; }

    // Mobile Assets
    public string? Imei { get; init; }
    public string? SimCardNumber { get; init; }
    public string? PhoneNumber { get; init; }

    // Vehicle Assets
    public string? LicensePlate { get; init; }
    public int? MileageAtAssignment { get; init; }
    public int? MileageAtReturn { get; init; }
    public string? FuelCardNumber { get; init; }

    // Documents
    public bool AssignmentFormSigned { get; init; }
    public string? AssignmentFormUrl { get; init; }
    public string? ReturnFormUrl { get; init; }
    public string? PhotosJson { get; init; }

    // Additional Information
    public string? Notes { get; init; }
    public string? Tags { get; init; }
    public int? InventoryItemId { get; init; }

    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }

    // Computed Properties
    public bool IsUnderWarranty => WarrantyEndDate.HasValue && WarrantyEndDate.Value > DateTime.UtcNow;
}
