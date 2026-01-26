using Stocker.SharedKernel.Common;

namespace Stocker.Infrastructure.Alerts.Domain;

/// <summary>
/// Central alert entity for all modules.
/// Stores user-specific alerts that can be triggered by any module.
/// </summary>
public class AlertEntity : BaseEntity
{
    /// <summary>
    /// User ID who should receive this alert (null = all users in tenant)
    /// </summary>
    public Guid? UserId { get; private set; }

    /// <summary>
    /// Role-based targeting (e.g., "SalesManager", "Admin")
    /// </summary>
    public string? TargetRole { get; private set; }

    /// <summary>
    /// Alert category for grouping and filtering
    /// </summary>
    public AlertCategory Category { get; private set; }

    /// <summary>
    /// Alert severity level
    /// </summary>
    public AlertSeverity Severity { get; private set; }

    /// <summary>
    /// Source module that generated this alert
    /// </summary>
    public string SourceModule { get; private set; } = string.Empty;

    /// <summary>
    /// Alert title (short, localized)
    /// </summary>
    public string Title { get; private set; } = string.Empty;

    /// <summary>
    /// Alert message (detailed, localized)
    /// </summary>
    public string Message { get; private set; } = string.Empty;

    /// <summary>
    /// Optional action URL for navigation
    /// </summary>
    public string? ActionUrl { get; private set; }

    /// <summary>
    /// Optional action label for the button
    /// </summary>
    public string? ActionLabel { get; private set; }

    /// <summary>
    /// Related entity type (e.g., "SalesOrder", "Invoice", "Contract")
    /// </summary>
    public string? RelatedEntityType { get; private set; }

    /// <summary>
    /// Related entity ID for deep linking
    /// </summary>
    public Guid? RelatedEntityId { get; private set; }

    /// <summary>
    /// Additional metadata as JSON
    /// </summary>
    public string? MetadataJson { get; private set; }

    /// <summary>
    /// Whether the alert has been read by the user
    /// </summary>
    public bool IsRead { get; private set; }

    /// <summary>
    /// When the alert was read
    /// </summary>
    public DateTime? ReadAt { get; private set; }

    /// <summary>
    /// Whether the alert has been dismissed
    /// </summary>
    public bool IsDismissed { get; private set; }

    /// <summary>
    /// When the alert was dismissed
    /// </summary>
    public DateTime? DismissedAt { get; private set; }

    /// <summary>
    /// Alert expiration date (null = never expires)
    /// </summary>
    public DateTime? ExpiresAt { get; private set; }

    /// <summary>
    /// Whether this alert should trigger a real-time notification
    /// </summary>
    public bool SendRealTime { get; private set; }

    /// <summary>
    /// Whether this alert should be sent via email
    /// </summary>
    public bool SendEmail { get; private set; }

    /// <summary>
    /// Whether the email has been sent
    /// </summary>
    public bool EmailSent { get; private set; }

    /// <summary>
    /// When the email was sent
    /// </summary>
    public DateTime? EmailSentAt { get; private set; }

    protected AlertEntity() { }

    private AlertEntity(
        Guid tenantId,
        AlertCategory category,
        AlertSeverity severity,
        string sourceModule,
        string title,
        string message)
    {
        SetTenantId(tenantId);
        Category = category;
        Severity = severity;
        SourceModule = sourceModule;
        Title = title;
        Message = message;
        IsRead = false;
        IsDismissed = false;
        SendRealTime = true;
        SendEmail = severity >= AlertSeverity.High;
    }

    public static AlertEntity Create(
        Guid tenantId,
        AlertCategory category,
        AlertSeverity severity,
        string sourceModule,
        string title,
        string message)
    {
        return new AlertEntity(tenantId, category, severity, sourceModule, title, message);
    }

    public AlertEntity ForUser(Guid userId)
    {
        UserId = userId;
        return this;
    }

    public AlertEntity ForRole(string role)
    {
        TargetRole = role;
        return this;
    }

    public AlertEntity WithAction(string url, string label)
    {
        ActionUrl = url;
        ActionLabel = label;
        return this;
    }

    public AlertEntity WithRelatedEntity(string entityType, Guid entityId)
    {
        RelatedEntityType = entityType;
        RelatedEntityId = entityId;
        return this;
    }

    public AlertEntity WithMetadata(string metadataJson)
    {
        MetadataJson = metadataJson;
        return this;
    }

    public AlertEntity WithExpiration(DateTime expiresAt)
    {
        ExpiresAt = expiresAt;
        return this;
    }

    public AlertEntity WithEmailNotification(bool sendEmail = true)
    {
        SendEmail = sendEmail;
        return this;
    }

    public AlertEntity WithRealTimeNotification(bool sendRealTime = true)
    {
        SendRealTime = sendRealTime;
        return this;
    }

    public void MarkAsRead()
    {
        if (!IsRead)
        {
            IsRead = true;
            ReadAt = DateTime.UtcNow;
        }
    }

    public void MarkAsUnread()
    {
        IsRead = false;
        ReadAt = null;
    }

    public void Dismiss()
    {
        if (!IsDismissed)
        {
            IsDismissed = true;
            DismissedAt = DateTime.UtcNow;
        }
    }

    public void MarkEmailSent()
    {
        EmailSent = true;
        EmailSentAt = DateTime.UtcNow;
    }

    public bool IsExpired => ExpiresAt.HasValue && ExpiresAt.Value < DateTime.UtcNow;
}

/// <summary>
/// Alert categories for filtering and grouping
/// </summary>
public enum AlertCategory
{
    /// <summary>General system alerts</summary>
    System = 0,

    // Sales Module
    /// <summary>Order-related alerts (new order, status change, approval needed)</summary>
    Order = 10,
    /// <summary>Quotation-related alerts (expiring, converted)</summary>
    Quotation = 11,
    /// <summary>Invoice-related alerts (overdue, payment received)</summary>
    Invoice = 12,
    /// <summary>Contract-related alerts (expiring, renewal needed)</summary>
    Contract = 13,
    /// <summary>Payment-related alerts (due date, received)</summary>
    Payment = 14,
    /// <summary>Shipment-related alerts (shipped, delivered)</summary>
    Shipment = 15,
    /// <summary>Return-related alerts (requested, processed)</summary>
    Return = 16,

    // Inventory Module
    /// <summary>Stock-related alerts (low stock, out of stock)</summary>
    Stock = 20,
    /// <summary>Warehouse-related alerts (transfer, adjustment)</summary>
    Warehouse = 21,
    /// <summary>Product-related alerts (expiring, discontinued)</summary>
    Product = 22,

    // CRM Module
    /// <summary>Customer-related alerts (new, inactive)</summary>
    Customer = 30,
    /// <summary>Lead-related alerts (new lead, follow-up)</summary>
    Lead = 31,
    /// <summary>Opportunity-related alerts (closing soon, won/lost)</summary>
    Opportunity = 32,

    // Finance Module
    /// <summary>Budget-related alerts (exceeded, approaching limit)</summary>
    Budget = 40,
    /// <summary>Credit-related alerts (limit exceeded, approaching limit)</summary>
    Credit = 41,

    // HR Module
    /// <summary>Employee-related alerts (leave request, attendance)</summary>
    Employee = 50,
    /// <summary>Payroll-related alerts (processing, completed)</summary>
    Payroll = 51
}

/// <summary>
/// Alert severity levels
/// </summary>
public enum AlertSeverity
{
    /// <summary>Informational - no action required</summary>
    Info = 0,

    /// <summary>Low priority - can be addressed later</summary>
    Low = 1,

    /// <summary>Medium priority - should be addressed soon</summary>
    Medium = 2,

    /// <summary>High priority - requires attention</summary>
    High = 3,

    /// <summary>Critical - immediate action required</summary>
    Critical = 4
}
