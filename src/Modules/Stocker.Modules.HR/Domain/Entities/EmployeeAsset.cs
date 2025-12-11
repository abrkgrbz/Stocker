using Stocker.SharedKernel.Common;

namespace Stocker.Modules.HR.Domain.Entities;

/// <summary>
/// Çalışan zimmet entity'si - Zimmetli varlık takibi
/// Employee Asset entity - Assigned asset tracking
/// </summary>
public class EmployeeAsset : BaseEntity
{
    #region Temel Bilgiler (Basic Information)

    /// <summary>
    /// Çalışan ID / Employee ID
    /// </summary>
    public int EmployeeId { get; private set; }

    /// <summary>
    /// Varlık türü / Asset type
    /// </summary>
    public AssetType AssetType { get; private set; }

    /// <summary>
    /// Durum / Status
    /// </summary>
    public AssetAssignmentStatus Status { get; private set; }

    #endregion

    #region Varlık Bilgileri (Asset Information)

    /// <summary>
    /// Varlık adı / Asset name
    /// </summary>
    public string AssetName { get; private set; } = string.Empty;

    /// <summary>
    /// Varlık kodu / Asset code
    /// </summary>
    public string? AssetCode { get; private set; }

    /// <summary>
    /// Seri numarası / Serial number
    /// </summary>
    public string? SerialNumber { get; private set; }

    /// <summary>
    /// Model / Model
    /// </summary>
    public string? Model { get; private set; }

    /// <summary>
    /// Marka / Brand
    /// </summary>
    public string? Brand { get; private set; }

    /// <summary>
    /// Açıklama / Description
    /// </summary>
    public string? Description { get; private set; }

    #endregion

    #region Değer Bilgileri (Value Information)

    /// <summary>
    /// Satın alma değeri / Purchase value
    /// </summary>
    public decimal? PurchaseValue { get; private set; }

    /// <summary>
    /// Güncel değer / Current value
    /// </summary>
    public decimal? CurrentValue { get; private set; }

    /// <summary>
    /// Para birimi / Currency
    /// </summary>
    public string Currency { get; private set; } = "TRY";

    /// <summary>
    /// Satın alma tarihi / Purchase date
    /// </summary>
    public DateTime? PurchaseDate { get; private set; }

    /// <summary>
    /// Garanti bitiş tarihi / Warranty end date
    /// </summary>
    public DateTime? WarrantyEndDate { get; private set; }

    #endregion

    #region Atama Bilgileri (Assignment Information)

    /// <summary>
    /// Atama tarihi / Assignment date
    /// </summary>
    public DateTime AssignmentDate { get; private set; }

    /// <summary>
    /// İade tarihi / Return date
    /// </summary>
    public DateTime? ReturnDate { get; private set; }

    /// <summary>
    /// Beklenen iade tarihi / Expected return date
    /// </summary>
    public DateTime? ExpectedReturnDate { get; private set; }

    /// <summary>
    /// Atayan kişi ID / Assigned by ID
    /// </summary>
    public int? AssignedById { get; private set; }

    /// <summary>
    /// Teslim alan kişi ID / Received by ID
    /// </summary>
    public int? ReceivedById { get; private set; }

    #endregion

    #region Lokasyon Bilgileri (Location Information)

    /// <summary>
    /// Lokasyon / Location
    /// </summary>
    public string? Location { get; private set; }

    /// <summary>
    /// Departman ID / Department ID
    /// </summary>
    public int? DepartmentId { get; private set; }

    /// <summary>
    /// Ofis / Office
    /// </summary>
    public string? Office { get; private set; }

    #endregion

    #region Durum Bilgileri (Condition Information)

    /// <summary>
    /// Atama anındaki durum / Condition at assignment
    /// </summary>
    public AssetCondition ConditionAtAssignment { get; private set; }

    /// <summary>
    /// İade anındaki durum / Condition at return
    /// </summary>
    public AssetCondition? ConditionAtReturn { get; private set; }

    /// <summary>
    /// Durum notları / Condition notes
    /// </summary>
    public string? ConditionNotes { get; private set; }

    /// <summary>
    /// Hasar var mı? / Has damage?
    /// </summary>
    public bool HasDamage { get; private set; }

    /// <summary>
    /// Hasar açıklaması / Damage description
    /// </summary>
    public string? DamageDescription { get; private set; }

    /// <summary>
    /// Hasar maliyeti / Damage cost
    /// </summary>
    public decimal? DamageCost { get; private set; }

    #endregion

    #region IT Varlıkları (IT Assets)

    /// <summary>
    /// IP adresi / IP address
    /// </summary>
    public string? IpAddress { get; private set; }

    /// <summary>
    /// MAC adresi / MAC address
    /// </summary>
    public string? MacAddress { get; private set; }

    /// <summary>
    /// Hostname</summary>
    public string? Hostname { get; private set; }

    /// <summary>
    /// İşletim sistemi / Operating system
    /// </summary>
    public string? OperatingSystem { get; private set; }

    /// <summary>
    /// Yazılım lisansları / Software licenses
    /// </summary>
    public string? SoftwareLicenses { get; private set; }

    #endregion

    #region Mobil Varlıklar (Mobile Assets)

    /// <summary>
    /// IMEI numarası / IMEI number
    /// </summary>
    public string? Imei { get; private set; }

    /// <summary>
    /// SIM kart numarası / SIM card number
    /// </summary>
    public string? SimCardNumber { get; private set; }

    /// <summary>
    /// Telefon numarası / Phone number
    /// </summary>
    public string? PhoneNumber { get; private set; }

    #endregion

    #region Araç Varlıkları (Vehicle Assets)

    /// <summary>
    /// Plaka / License plate
    /// </summary>
    public string? LicensePlate { get; private set; }

    /// <summary>
    /// Kilometre (atama) / Mileage at assignment
    /// </summary>
    public int? MileageAtAssignment { get; private set; }

    /// <summary>
    /// Kilometre (iade) / Mileage at return
    /// </summary>
    public int? MileageAtReturn { get; private set; }

    /// <summary>
    /// Yakıt kartı numarası / Fuel card number
    /// </summary>
    public string? FuelCardNumber { get; private set; }

    #endregion

    #region Belgeler (Documents)

    /// <summary>
    /// Zimmet formu imzalandı mı? / Assignment form signed?
    /// </summary>
    public bool AssignmentFormSigned { get; private set; }

    /// <summary>
    /// Zimmet formu URL / Assignment form URL
    /// </summary>
    public string? AssignmentFormUrl { get; private set; }

    /// <summary>
    /// İade formu URL / Return form URL
    /// </summary>
    public string? ReturnFormUrl { get; private set; }

    /// <summary>
    /// Fotoğraflar / Photos
    /// </summary>
    public string? PhotosJson { get; private set; }

    #endregion

    #region Ek Bilgiler (Additional Information)

    /// <summary>
    /// Notlar / Notes
    /// </summary>
    public string? Notes { get; private set; }

    /// <summary>
    /// Etiketler / Tags
    /// </summary>
    public string? Tags { get; private set; }

    /// <summary>
    /// Envanter ID / Inventory ID
    /// </summary>
    public int? InventoryItemId { get; private set; }

    #endregion

    // Navigation Properties
    public virtual Employee Employee { get; private set; } = null!;
    public virtual Employee? AssignedBy { get; private set; }
    public virtual Department? Department { get; private set; }

    protected EmployeeAsset() { }

    public EmployeeAsset(
        int employeeId,
        AssetType assetType,
        string assetName,
        AssetCondition condition = AssetCondition.New)
    {
        EmployeeId = employeeId;
        AssetType = assetType;
        AssetName = assetName;
        ConditionAtAssignment = condition;
        Status = AssetAssignmentStatus.Assigned;
        AssignmentDate = DateTime.UtcNow;
        Currency = "TRY";
    }

    public void Return(AssetCondition condition, string? notes = null)
    {
        Status = AssetAssignmentStatus.Returned;
        ReturnDate = DateTime.UtcNow;
        ConditionAtReturn = condition;
        if (!string.IsNullOrEmpty(notes))
            ConditionNotes = notes;
    }

    public void ReportLost()
    {
        Status = AssetAssignmentStatus.Lost;
    }

    public void ReportDamaged(string description, decimal? cost = null)
    {
        Status = AssetAssignmentStatus.Damaged;
        HasDamage = true;
        DamageDescription = description;
        DamageCost = cost;
    }

    public void MarkAsDisposed()
    {
        Status = AssetAssignmentStatus.Disposed;
    }

    public void SignAssignmentForm(string formUrl)
    {
        AssignmentFormSigned = true;
        AssignmentFormUrl = formUrl;
    }

    public void Transfer(int newEmployeeId)
    {
        // Current assignment should be closed first
        if (Status != AssetAssignmentStatus.Returned)
        {
            Return(ConditionAtAssignment, "Transfer edildi");
        }
    }

    public void SetAssetDetails(string? code, string? serialNumber, string? model, string? brand)
    {
        AssetCode = code;
        SerialNumber = serialNumber;
        Model = model;
        Brand = brand;
    }

    public void SetValueInfo(decimal? purchaseValue, decimal? currentValue, DateTime? purchaseDate, DateTime? warrantyEnd)
    {
        PurchaseValue = purchaseValue;
        CurrentValue = currentValue;
        PurchaseDate = purchaseDate;
        WarrantyEndDate = warrantyEnd;
    }

    public void SetItDetails(string? ipAddress, string? macAddress, string? hostname, string? os, string? licenses)
    {
        IpAddress = ipAddress;
        MacAddress = macAddress;
        Hostname = hostname;
        OperatingSystem = os;
        SoftwareLicenses = licenses;
    }

    public void SetMobileDetails(string? imei, string? simCard, string? phoneNumber)
    {
        Imei = imei;
        SimCardNumber = simCard;
        PhoneNumber = phoneNumber;
    }

    public void SetVehicleDetails(string? licensePlate, int? mileage, string? fuelCard)
    {
        LicensePlate = licensePlate;
        MileageAtAssignment = mileage;
        FuelCardNumber = fuelCard;
    }

    public void SetLocation(string? location, int? departmentId, string? office)
    {
        Location = location;
        DepartmentId = departmentId;
        Office = office;
    }

    public void SetAssignedBy(int? userId) => AssignedById = userId;
    public void SetReceivedBy(int? userId) => ReceivedById = userId;
    public void SetExpectedReturnDate(DateTime? date) => ExpectedReturnDate = date;
    public void SetDescription(string? description) => Description = description;
    public void SetNotes(string? notes) => Notes = notes;
    public void SetTags(string? tags) => Tags = tags;
    public void SetPhotos(string? photosJson) => PhotosJson = photosJson;
    public void SetReturnFormUrl(string? url) => ReturnFormUrl = url;
    public void SetMileageAtReturn(int? mileage) => MileageAtReturn = mileage;
    public void SetInventoryItemId(int? itemId) => InventoryItemId = itemId;

    public bool IsUnderWarranty() => WarrantyEndDate.HasValue && WarrantyEndDate.Value > DateTime.UtcNow;
}

#region Enums

public enum AssetType
{
    /// <summary>Laptop</summary>
    Laptop = 1,

    /// <summary>Masaüstü bilgisayar / Desktop</summary>
    Desktop = 2,

    /// <summary>Monitör / Monitor</summary>
    Monitor = 3,

    /// <summary>Cep telefonu / Mobile phone</summary>
    MobilePhone = 4,

    /// <summary>Tablet</summary>
    Tablet = 5,

    /// <summary>Yazıcı / Printer</summary>
    Printer = 6,

    /// <summary>Klavye / Keyboard</summary>
    Keyboard = 7,

    /// <summary>Mouse</summary>
    Mouse = 8,

    /// <summary>Kulaklık / Headset</summary>
    Headset = 9,

    /// <summary>Web kamera / Webcam</summary>
    Webcam = 10,

    /// <summary>Şirket aracı / Company vehicle</summary>
    Vehicle = 11,

    /// <summary>Kartlı giriş / Access card</summary>
    AccessCard = 12,

    /// <summary>Anahtar / Key</summary>
    Key = 13,

    /// <summary>Kredi kartı / Credit card</summary>
    CreditCard = 14,

    /// <summary>Üniform / Uniform</summary>
    Uniform = 15,

    /// <summary>Kişisel koruyucu ekipman / PPE</summary>
    PPE = 16,

    /// <summary>Mobilya / Furniture</summary>
    Furniture = 17,

    /// <summary>Yazılım lisansı / Software license</summary>
    SoftwareLicense = 18,

    /// <summary>Diğer / Other</summary>
    Other = 99
}

public enum AssetAssignmentStatus
{
    /// <summary>Atandı / Assigned</summary>
    Assigned = 1,

    /// <summary>İade edildi / Returned</summary>
    Returned = 2,

    /// <summary>Kayıp / Lost</summary>
    Lost = 3,

    /// <summary>Hasarlı / Damaged</summary>
    Damaged = 4,

    /// <summary>İmha edildi / Disposed</summary>
    Disposed = 5,

    /// <summary>Transfer edildi / Transferred</summary>
    Transferred = 6
}

public enum AssetCondition
{
    /// <summary>Yeni / New</summary>
    New = 1,

    /// <summary>Mükemmel / Excellent</summary>
    Excellent = 2,

    /// <summary>İyi / Good</summary>
    Good = 3,

    /// <summary>Kabul edilebilir / Fair</summary>
    Fair = 4,

    /// <summary>Kötü / Poor</summary>
    Poor = 5,

    /// <summary>Kullanılamaz / Unusable</summary>
    Unusable = 6
}

#endregion
