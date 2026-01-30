namespace Stocker.SignalR.Models.Notifications;

/// <summary>
/// Types of notifications
/// </summary>
public enum NotificationType
{
    /// <summary>
    /// Informational notification
    /// </summary>
    Info,

    /// <summary>
    /// Success notification
    /// </summary>
    Success,

    /// <summary>
    /// Warning notification
    /// </summary>
    Warning,

    /// <summary>
    /// Error notification
    /// </summary>
    Error,

    /// <summary>
    /// System notification
    /// </summary>
    System,

    /// <summary>
    /// Payment-related notification
    /// </summary>
    Payment,

    /// <summary>
    /// Order-related notification
    /// </summary>
    Order,

    /// <summary>
    /// Stock-related notification
    /// </summary>
    Stock,

    /// <summary>
    /// User-related notification
    /// </summary>
    User,

    /// <summary>
    /// CRM-related notification (leads, deals, customers, activities)
    /// </summary>
    CRM,

    /// <summary>
    /// Inventory-related notification (stock levels, transfers, adjustments)
    /// </summary>
    Inventory,

    /// <summary>
    /// HR-related notification (employees, leaves, attendance, payroll)
    /// </summary>
    HR,

    /// <summary>
    /// Sales-related notification (orders, quotations, invoices, shipments, payments)
    /// </summary>
    Sales
}
