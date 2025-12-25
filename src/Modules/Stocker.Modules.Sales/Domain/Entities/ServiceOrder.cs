using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Domain.Entities;

/// <summary>
/// Represents a post-sales service order for repairs, maintenance, or installations.
/// Tracks service requests, technician assignments, and billing.
/// Can be linked to warranties for covered repairs.
/// </summary>
public class ServiceOrder : TenantAggregateRoot
{
    private readonly List<ServiceOrderItem> _items = new();
    private readonly List<ServiceOrderNote> _notes = new();

    #region Properties

    public string ServiceOrderNumber { get; private set; } = string.Empty;
    public DateTime OrderDate { get; private set; }
    public ServiceOrderType Type { get; private set; }
    public ServiceOrderPriority Priority { get; private set; }

    // Customer
    public Guid? CustomerId { get; private set; }
    public string CustomerName { get; private set; } = string.Empty;
    public string? CustomerEmail { get; private set; }
    public string? CustomerPhone { get; private set; }
    public string? CustomerAddress { get; private set; }

    // Product/Asset being serviced
    public Guid? ProductId { get; private set; }
    public string? ProductCode { get; private set; }
    public string? ProductName { get; private set; }
    public string? SerialNumber { get; private set; }
    public string? AssetTag { get; private set; }

    // Source Documents
    public Guid? SalesOrderId { get; private set; }
    public string? SalesOrderNumber { get; private set; }
    public Guid? InvoiceId { get; private set; }
    public string? InvoiceNumber { get; private set; }
    public Guid? WarrantyId { get; private set; }
    public string? WarrantyNumber { get; private set; }
    public bool IsCoveredByWarranty { get; private set; }

    // Issue Description
    public string? ReportedIssue { get; private set; }
    public string? DiagnosisNotes { get; private set; }
    public string? RepairNotes { get; private set; }
    public ServiceCategory? IssueCategory { get; private set; }

    // Scheduling
    public DateTime? ScheduledDate { get; private set; }
    public DateTime? ScheduledEndDate { get; private set; }
    public TimeSpan? EstimatedDuration { get; private set; }
    public ServiceLocation Location { get; private set; }
    public string? ServiceAddress { get; private set; }

    // Technician Assignment
    public Guid? TechnicianId { get; private set; }
    public string? TechnicianName { get; private set; }
    public Guid? AssignedTeamId { get; private set; }
    public string? AssignedTeamName { get; private set; }
    public DateTime? AssignedDate { get; private set; }

    // Status & Timeline
    public ServiceOrderStatus Status { get; private set; }
    public DateTime? StartedDate { get; private set; }
    public DateTime? CompletedDate { get; private set; }
    public DateTime? CancelledDate { get; private set; }
    public string? CancellationReason { get; private set; }
    public TimeSpan? ActualDuration { get; private set; }

    // Billing
    public bool IsBillable { get; private set; } = true;
    public decimal LaborCost { get; private set; }
    public decimal PartsCost { get; private set; }
    public decimal TravelCost { get; private set; }
    public decimal OtherCost { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal TotalAmount => LaborCost + PartsCost + TravelCost + OtherCost - DiscountAmount + TaxAmount;
    public string Currency { get; private set; } = "TRY";

    // Invoice
    public bool IsInvoiced { get; private set; }
    public Guid? ServiceInvoiceId { get; private set; }
    public string? ServiceInvoiceNumber { get; private set; }
    public DateTime? InvoicedDate { get; private set; }

    // Customer Satisfaction
    public int? CustomerRating { get; private set; } // 1-5
    public string? CustomerFeedback { get; private set; }
    public DateTime? FeedbackDate { get; private set; }

    // Audit
    public Guid? CreatedBy { get; private set; }
    public string? CreatedByName { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    public IReadOnlyCollection<ServiceOrderItem> Items => _items.AsReadOnly();
    public IReadOnlyCollection<ServiceOrderNote> Notes => _notes.AsReadOnly();

    #endregion

    #region Constructors

    private ServiceOrder() { }

    private ServiceOrder(
        Guid tenantId,
        string serviceOrderNumber,
        Guid? customerId,
        string customerName,
        ServiceOrderType type) : base(Guid.NewGuid(), tenantId)
    {
        ServiceOrderNumber = serviceOrderNumber;
        CustomerId = customerId;
        CustomerName = customerName;
        Type = type;
        Priority = ServiceOrderPriority.Normal;
        Status = ServiceOrderStatus.Open;
        Location = ServiceLocation.InHouse;
        OrderDate = DateTime.UtcNow;
        CreatedAt = DateTime.UtcNow;
    }

    #endregion

    #region Factory Methods

    public static Result<ServiceOrder> Create(
        Guid tenantId,
        string serviceOrderNumber,
        Guid? customerId,
        string customerName,
        ServiceOrderType type)
    {
        if (string.IsNullOrWhiteSpace(serviceOrderNumber))
            return Result<ServiceOrder>.Failure(Error.Validation("ServiceOrder.NumberRequired", "Service order number is required"));

        if (string.IsNullOrWhiteSpace(customerName))
            return Result<ServiceOrder>.Failure(Error.Validation("ServiceOrder.CustomerRequired", "Customer name is required"));

        return Result<ServiceOrder>.Success(new ServiceOrder(tenantId, serviceOrderNumber, customerId, customerName, type));
    }

    /// <summary>
    /// Creates a warranty-covered service order
    /// </summary>
    public static Result<ServiceOrder> CreateWarrantyService(
        Guid tenantId,
        string serviceOrderNumber,
        Guid? customerId,
        string customerName,
        Guid warrantyId,
        string warrantyNumber,
        string reportedIssue)
    {
        var result = Create(tenantId, serviceOrderNumber, customerId, customerName, ServiceOrderType.Repair);
        if (!result.IsSuccess)
            return result;

        var order = result.Value;
        order.WarrantyId = warrantyId;
        order.WarrantyNumber = warrantyNumber;
        order.IsCoveredByWarranty = true;
        order.IsBillable = false;
        order.ReportedIssue = reportedIssue;

        return Result<ServiceOrder>.Success(order);
    }

    #endregion

    #region Customer & Product

    public Result SetCustomerContact(string? email, string? phone, string? address)
    {
        CustomerEmail = email;
        CustomerPhone = phone;
        CustomerAddress = address;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetProduct(Guid? productId, string? productCode, string? productName, string? serialNumber, string? assetTag)
    {
        ProductId = productId;
        ProductCode = productCode;
        ProductName = productName;
        SerialNumber = serialNumber;
        AssetTag = assetTag;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetSourceDocuments(Guid? salesOrderId, string? salesOrderNumber, Guid? invoiceId, string? invoiceNumber)
    {
        SalesOrderId = salesOrderId;
        SalesOrderNumber = salesOrderNumber;
        InvoiceId = invoiceId;
        InvoiceNumber = invoiceNumber;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result LinkToWarranty(Guid warrantyId, string warrantyNumber, bool isCovered)
    {
        WarrantyId = warrantyId;
        WarrantyNumber = warrantyNumber;
        IsCoveredByWarranty = isCovered;
        if (isCovered)
            IsBillable = false;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Issue & Diagnosis

    public Result SetIssue(string reportedIssue, ServiceCategory? category = null)
    {
        if (string.IsNullOrWhiteSpace(reportedIssue))
            return Result.Failure(Error.Validation("ServiceOrder.IssueRequired", "Issue description is required"));

        ReportedIssue = reportedIssue;
        IssueCategory = category;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetDiagnosis(string diagnosisNotes)
    {
        DiagnosisNotes = diagnosisNotes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetRepairNotes(string repairNotes)
    {
        RepairNotes = repairNotes;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Scheduling

    public Result Schedule(DateTime scheduledDate, TimeSpan? estimatedDuration = null, DateTime? endDate = null)
    {
        if (Status == ServiceOrderStatus.Completed || Status == ServiceOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("ServiceOrder.CannotSchedule", "Cannot schedule completed or cancelled orders"));

        ScheduledDate = scheduledDate;
        EstimatedDuration = estimatedDuration;
        ScheduledEndDate = endDate ?? (estimatedDuration.HasValue ? scheduledDate.Add(estimatedDuration.Value) : null);
        Status = ServiceOrderStatus.Scheduled;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Reschedule(DateTime newDate, string? reason = null)
    {
        if (Status == ServiceOrderStatus.InProgress)
            return Result.Failure(Error.Validation("ServiceOrder.InProgress", "Cannot reschedule service in progress"));

        var oldDate = ScheduledDate;
        ScheduledDate = newDate;
        if (EstimatedDuration.HasValue)
            ScheduledEndDate = newDate.Add(EstimatedDuration.Value);

        if (!string.IsNullOrEmpty(reason))
            AddNote($"Rescheduled from {oldDate:yyyy-MM-dd HH:mm} to {newDate:yyyy-MM-dd HH:mm}: {reason}", ServiceNoteType.Internal);

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetLocation(ServiceLocation location, string? serviceAddress = null)
    {
        Location = location;
        ServiceAddress = serviceAddress;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Technician Assignment

    public Result AssignTechnician(Guid technicianId, string? technicianName)
    {
        if (Status == ServiceOrderStatus.Completed || Status == ServiceOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("ServiceOrder.CannotAssign", "Cannot assign technician to completed or cancelled orders"));

        TechnicianId = technicianId;
        TechnicianName = technicianName;
        AssignedDate = DateTime.UtcNow;

        if (Status == ServiceOrderStatus.Open)
            Status = ServiceOrderStatus.Assigned;

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result AssignTeam(Guid teamId, string? teamName)
    {
        AssignedTeamId = teamId;
        AssignedTeamName = teamName;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ReassignTechnician(Guid newTechnicianId, string? newTechnicianName, string? reason = null)
    {
        var oldTechnician = TechnicianName;
        TechnicianId = newTechnicianId;
        TechnicianName = newTechnicianName;
        AssignedDate = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(reason))
            AddNote($"Reassigned from {oldTechnician} to {newTechnicianName}: {reason}", ServiceNoteType.Internal);

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Status Management

    public Result StartService()
    {
        if (Status == ServiceOrderStatus.InProgress)
            return Result.Failure(Error.Validation("ServiceOrder.AlreadyStarted", "Service is already in progress"));

        if (Status == ServiceOrderStatus.Completed || Status == ServiceOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("ServiceOrder.CannotStart", "Cannot start completed or cancelled orders"));

        if (!TechnicianId.HasValue)
            return Result.Failure(Error.Validation("ServiceOrder.NoTechnician", "Assign a technician before starting service"));

        Status = ServiceOrderStatus.InProgress;
        StartedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result PauseService(string reason)
    {
        if (Status != ServiceOrderStatus.InProgress)
            return Result.Failure(Error.Validation("ServiceOrder.NotInProgress", "Can only pause services in progress"));

        Status = ServiceOrderStatus.OnHold;
        AddNote($"Service paused: {reason}", ServiceNoteType.Internal);
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result ResumeService()
    {
        if (Status != ServiceOrderStatus.OnHold)
            return Result.Failure(Error.Validation("ServiceOrder.NotOnHold", "Can only resume paused services"));

        Status = ServiceOrderStatus.InProgress;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result CompleteService(string? completionNotes = null)
    {
        if (Status != ServiceOrderStatus.InProgress && Status != ServiceOrderStatus.OnHold)
            return Result.Failure(Error.Validation("ServiceOrder.CannotComplete", "Service must be in progress to complete"));

        Status = ServiceOrderStatus.Completed;
        CompletedDate = DateTime.UtcNow;

        if (StartedDate.HasValue)
            ActualDuration = CompletedDate.Value - StartedDate.Value;

        if (!string.IsNullOrEmpty(completionNotes))
            RepairNotes = completionNotes;

        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result Cancel(string reason)
    {
        if (Status == ServiceOrderStatus.Completed)
            return Result.Failure(Error.Validation("ServiceOrder.AlreadyCompleted", "Cannot cancel completed service"));

        if (Status == ServiceOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("ServiceOrder.AlreadyCancelled", "Service is already cancelled"));

        Status = ServiceOrderStatus.Cancelled;
        CancelledDate = DateTime.UtcNow;
        CancellationReason = reason;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetPriority(ServiceOrderPriority priority)
    {
        Priority = priority;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Items & Parts

    public Result AddItem(ServiceOrderItem item)
    {
        if (Status == ServiceOrderStatus.Cancelled)
            return Result.Failure(Error.Validation("ServiceOrder.Cancelled", "Cannot add items to cancelled orders"));

        _items.Add(item);
        RecalculateCosts();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result RemoveItem(Guid itemId)
    {
        var item = _items.FirstOrDefault(i => i.Id == itemId);
        if (item == null)
            return Result.Failure(Error.NotFound("ServiceOrder.ItemNotFound", "Item not found"));

        _items.Remove(item);
        RecalculateCosts();
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    private void RecalculateCosts()
    {
        PartsCost = _items.Where(i => i.ItemType == ServiceItemType.Part).Sum(i => i.TotalPrice);
        LaborCost = _items.Where(i => i.ItemType == ServiceItemType.Labor).Sum(i => i.TotalPrice);
    }

    #endregion

    #region Notes

    public Result AddNote(string content, ServiceNoteType type = ServiceNoteType.General)
    {
        if (string.IsNullOrWhiteSpace(content))
            return Result.Failure(Error.Validation("ServiceOrder.NoteRequired", "Note content is required"));

        var note = ServiceOrderNote.Create(TenantId, Id, content, type);
        if (note.IsSuccess)
            _notes.Add(note.Value);

        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    #endregion

    #region Billing

    public Result SetBillingDetails(
        decimal laborCost,
        decimal partsCost,
        decimal travelCost = 0,
        decimal otherCost = 0,
        decimal discountAmount = 0,
        decimal taxAmount = 0)
    {
        LaborCost = laborCost;
        PartsCost = partsCost;
        TravelCost = travelCost;
        OtherCost = otherCost;
        DiscountAmount = discountAmount;
        TaxAmount = taxAmount;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetBillable(bool isBillable)
    {
        IsBillable = isBillable;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result BillToCustomer(Guid invoiceId, string invoiceNumber)
    {
        if (!IsBillable)
            return Result.Failure(Error.Validation("ServiceOrder.NotBillable", "This service order is not billable"));

        if (Status != ServiceOrderStatus.Completed)
            return Result.Failure(Error.Validation("ServiceOrder.NotCompleted", "Service must be completed before billing"));

        IsInvoiced = true;
        ServiceInvoiceId = invoiceId;
        ServiceInvoiceNumber = invoiceNumber;
        InvoicedDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Customer Feedback

    public Result RecordFeedback(int rating, string? feedback = null)
    {
        if (rating < 1 || rating > 5)
            return Result.Failure(Error.Validation("ServiceOrder.InvalidRating", "Rating must be between 1 and 5"));

        if (Status != ServiceOrderStatus.Completed)
            return Result.Failure(Error.Validation("ServiceOrder.NotCompleted", "Can only record feedback for completed services"));

        CustomerRating = rating;
        CustomerFeedback = feedback;
        FeedbackDate = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;

        return Result.Success();
    }

    #endregion

    #region Metadata

    public Result SetCreator(Guid userId, string? userName)
    {
        CreatedBy = userId;
        CreatedByName = userName;
        return Result.Success();
    }

    #endregion
}

/// <summary>
/// Line item for a service order (parts, labor, etc.)
/// </summary>
public class ServiceOrderItem : TenantEntity
{
    public Guid ServiceOrderId { get; private set; }
    public int LineNumber { get; private set; }
    public ServiceItemType ItemType { get; private set; }

    // Product/Part
    public Guid? ProductId { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Unit { get; private set; } = "Adet";

    // Quantities & Pricing
    public decimal Quantity { get; private set; }
    public decimal UnitPrice { get; private set; }
    public decimal DiscountRate { get; private set; }
    public decimal DiscountAmount => Quantity * UnitPrice * (DiscountRate / 100);
    public decimal TotalPrice => (Quantity * UnitPrice) - DiscountAmount;

    // Labor specific
    public decimal? HoursWorked { get; private set; }
    public decimal? HourlyRate { get; private set; }

    // Warranty
    public bool IsCoveredByWarranty { get; private set; }

    // Audit
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private ServiceOrderItem() { }

    private ServiceOrderItem(
        Guid tenantId,
        Guid serviceOrderId,
        int lineNumber,
        ServiceItemType itemType,
        string code,
        string name,
        decimal quantity,
        decimal unitPrice) : base(Guid.NewGuid(), tenantId)
    {
        ServiceOrderId = serviceOrderId;
        LineNumber = lineNumber;
        ItemType = itemType;
        Code = code;
        Name = name;
        Quantity = quantity;
        UnitPrice = unitPrice;
        CreatedAt = DateTime.UtcNow;
    }

    public static Result<ServiceOrderItem> Create(
        Guid tenantId,
        Guid serviceOrderId,
        int lineNumber,
        ServiceItemType itemType,
        string code,
        string name,
        decimal quantity,
        decimal unitPrice)
    {
        if (string.IsNullOrWhiteSpace(code))
            return Result<ServiceOrderItem>.Failure(Error.Validation("ServiceItem.CodeRequired", "Item code is required"));

        if (quantity <= 0)
            return Result<ServiceOrderItem>.Failure(Error.Validation("ServiceItem.InvalidQuantity", "Quantity must be greater than zero"));

        return Result<ServiceOrderItem>.Success(
            new ServiceOrderItem(tenantId, serviceOrderId, lineNumber, itemType, code, name, quantity, unitPrice));
    }

    public static Result<ServiceOrderItem> CreateLabor(
        Guid tenantId,
        Guid serviceOrderId,
        int lineNumber,
        string name,
        decimal hours,
        decimal hourlyRate)
    {
        var result = Create(tenantId, serviceOrderId, lineNumber, ServiceItemType.Labor, "LABOR", name, hours, hourlyRate);
        if (!result.IsSuccess)
            return result;

        result.Value.HoursWorked = hours;
        result.Value.HourlyRate = hourlyRate;
        result.Value.Unit = "Saat";

        return result;
    }

    public Result SetProduct(Guid productId, string? description)
    {
        ProductId = productId;
        Description = description;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result ApplyDiscount(decimal discountRate)
    {
        if (discountRate < 0 || discountRate > 100)
            return Result.Failure(Error.Validation("ServiceItem.InvalidDiscount", "Discount must be between 0 and 100"));

        DiscountRate = discountRate;
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }

    public Result SetWarrantyCoverage(bool isCovered)
    {
        IsCoveredByWarranty = isCovered;
        if (isCovered)
            UnitPrice = 0; // Zero out price for warranty-covered items
        UpdatedAt = DateTime.UtcNow;
        return Result.Success();
    }
}

/// <summary>
/// Notes and comments for service orders
/// </summary>
public class ServiceOrderNote : TenantEntity
{
    public Guid ServiceOrderId { get; private set; }
    public ServiceNoteType Type { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public Guid? CreatedBy { get; private set; }
    public string? CreatedByName { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private ServiceOrderNote() { }

    private ServiceOrderNote(
        Guid tenantId,
        Guid serviceOrderId,
        string content,
        ServiceNoteType type) : base(Guid.NewGuid(), tenantId)
    {
        ServiceOrderId = serviceOrderId;
        Content = content;
        Type = type;
        CreatedAt = DateTime.UtcNow;
    }

    public static Result<ServiceOrderNote> Create(
        Guid tenantId,
        Guid serviceOrderId,
        string content,
        ServiceNoteType type = ServiceNoteType.General)
    {
        if (string.IsNullOrWhiteSpace(content))
            return Result<ServiceOrderNote>.Failure(Error.Validation("Note.ContentRequired", "Note content is required"));

        return Result<ServiceOrderNote>.Success(new ServiceOrderNote(tenantId, serviceOrderId, content, type));
    }

    public Result SetCreator(Guid userId, string? userName)
    {
        CreatedBy = userId;
        CreatedByName = userName;
        return Result.Success();
    }
}

#region Enums

public enum ServiceOrderType
{
    Repair = 0,
    Maintenance = 1,
    Installation = 2,
    Inspection = 3,
    Calibration = 4,
    Upgrade = 5,
    Training = 6,
    Consultation = 7,
    Other = 99
}

public enum ServiceOrderStatus
{
    Open = 0,
    Assigned = 1,
    Scheduled = 2,
    InProgress = 3,
    OnHold = 4,
    Completed = 5,
    Cancelled = 6
}

public enum ServiceOrderPriority
{
    Low = 0,
    Normal = 1,
    High = 2,
    Urgent = 3,
    Critical = 4
}

public enum ServiceLocation
{
    InHouse = 0,        // Customer brings to service center
    OnSite = 1,         // Technician goes to customer
    Remote = 2,         // Remote support
    PickupDelivery = 3  // Pickup, service, and deliver back
}

public enum ServiceCategory
{
    Hardware = 0,
    Software = 1,
    Mechanical = 2,
    Electrical = 3,
    Cosmetic = 4,
    Performance = 5,
    Safety = 6,
    Other = 99
}

public enum ServiceItemType
{
    Part = 0,
    Labor = 1,
    Travel = 2,
    Other = 99
}

public enum ServiceNoteType
{
    General = 0,
    Internal = 1,
    CustomerVisible = 2,
    Technical = 3,
    Billing = 4
}

#endregion
