namespace Stocker.SignalR.Constants;

/// <summary>
/// Centralized SignalR group name patterns and generators.
/// All group names should be generated through this class to ensure consistency.
/// </summary>
public static class SignalRGroups
{
    #region Admin Groups

    /// <summary>
    /// Group for admin notifications (tenant creation, system alerts)
    /// </summary>
    public const string AdminNotifications = "admin-notifications";

    /// <summary>
    /// Group for admin monitoring dashboard
    /// </summary>
    public const string AdminMonitoring = "admin-monitoring";

    /// <summary>
    /// Group for system-wide metrics updates
    /// </summary>
    public const string SystemMetrics = "system-metrics";

    /// <summary>
    /// Group for service health monitoring
    /// </summary>
    public const string ServiceHealth = "service-health";

    /// <summary>
    /// Group for monitoring alerts
    /// </summary>
    public const string MonitoringAlerts = "monitoring-alerts";

    #endregion

    #region Tenant Groups

    private const string TenantPrefix = "tenant-";
    private const string MonitoringTenantPrefix = "monitoring-tenant-";

    /// <summary>
    /// Generates a tenant-specific group name
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: tenant-{tenantId}</returns>
    public static string ForTenant(string tenantId) => $"{TenantPrefix}{tenantId}";

    /// <summary>
    /// Generates a tenant-specific group name
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: tenant-{tenantId}</returns>
    public static string ForTenant(Guid tenantId) => ForTenant(tenantId.ToString());

    /// <summary>
    /// Generates a monitoring-specific tenant group name
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: monitoring-tenant-{tenantId}</returns>
    public static string ForMonitoringTenant(string tenantId) => $"{MonitoringTenantPrefix}{tenantId}";

    /// <summary>
    /// Generates a monitoring-specific tenant group name
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: monitoring-tenant-{tenantId}</returns>
    public static string ForMonitoringTenant(Guid tenantId) => ForMonitoringTenant(tenantId.ToString());

    #endregion

    #region User Groups

    private const string UserPrefix = "user-";

    /// <summary>
    /// Generates a user-specific group name
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <returns>Group name in format: user-{userId}</returns>
    public static string ForUser(string userId) => $"{UserPrefix}{userId}";

    /// <summary>
    /// Generates a user-specific group name
    /// </summary>
    /// <param name="userId">The user identifier</param>
    /// <returns>Group name in format: user-{userId}</returns>
    public static string ForUser(Guid userId) => ForUser(userId.ToString());

    #endregion

    #region Role Groups

    private const string RolePrefix = "role-";
    private const string TenantRolePrefix = "tenant-role-";

    /// <summary>
    /// Generates a role-specific group name
    /// </summary>
    /// <param name="role">The role name</param>
    /// <returns>Group name in format: role-{role}</returns>
    public static string ForRole(string role) => $"{RolePrefix}{role}";

    /// <summary>
    /// Generates a tenant and role specific group name for targeting users with a specific role in a tenant
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="role">The role name</param>
    /// <returns>Group name in format: tenant-role-{tenantId}-{role}</returns>
    public static string ForTenantRole(string tenantId, string role) => $"{TenantRolePrefix}{tenantId}-{role}";

    /// <summary>
    /// Generates a tenant and role specific group name for targeting users with a specific role in a tenant
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="role">The role name</param>
    /// <returns>Group name in format: tenant-role-{tenantId}-{role}</returns>
    public static string ForTenantRole(Guid tenantId, string role) => ForTenantRole(tenantId.ToString(), role);

    #endregion

    #region Registration Groups

    private const string RegistrationPrefix = "registration-";

    /// <summary>
    /// Generates a registration-specific group name for tracking registration progress
    /// </summary>
    /// <param name="registrationId">The registration identifier</param>
    /// <returns>Group name in format: registration-{registrationId}</returns>
    public static string ForRegistration(string registrationId) => $"{RegistrationPrefix}{registrationId}";

    /// <summary>
    /// Generates a registration-specific group name for tracking registration progress
    /// </summary>
    /// <param name="registrationId">The registration identifier</param>
    /// <returns>Group name in format: registration-{registrationId}</returns>
    public static string ForRegistration(Guid registrationId) => ForRegistration(registrationId.ToString());

    /// <summary>
    /// Generates a registration group name by email for tracking registration progress
    /// Used when registration ID is not available but email is known
    /// </summary>
    /// <param name="email">The contact email</param>
    /// <returns>Group name in format: registration-{email}</returns>
    public static string ForRegistrationEmail(string email) => $"{RegistrationPrefix}{email}";

    #endregion

    #region Setup Groups

    private const string SetupPrefix = "setup-";

    /// <summary>
    /// Generates a setup progress group name for tracking tenant provisioning
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: setup-{tenantId}</returns>
    public static string ForSetup(string tenantId) => $"{SetupPrefix}{tenantId}";

    /// <summary>
    /// Generates a setup progress group name for tracking tenant provisioning
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: setup-{tenantId}</returns>
    public static string ForSetup(Guid tenantId) => ForSetup(tenantId.ToString());

    #endregion

    #region Sales Groups

    private const string SalesOrderPrefix = "sales-order-";
    private const string SalesDashboardPrefix = "sales-dashboard-";

    /// <summary>
    /// Generates a sales order-specific group name for tracking order updates
    /// </summary>
    /// <param name="salesOrderId">The sales order identifier</param>
    /// <returns>Group name in format: sales-order-{salesOrderId}</returns>
    public static string ForSalesOrder(string salesOrderId) => $"{SalesOrderPrefix}{salesOrderId}";

    /// <summary>
    /// Generates a sales order-specific group name for tracking order updates
    /// </summary>
    /// <param name="salesOrderId">The sales order identifier</param>
    /// <returns>Group name in format: sales-order-{salesOrderId}</returns>
    public static string ForSalesOrder(Guid salesOrderId) => ForSalesOrder(salesOrderId.ToString());

    /// <summary>
    /// Generates a sales dashboard group name for tenant-specific sales notifications
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: sales-dashboard-{tenantId}</returns>
    public static string ForSalesDashboard(string tenantId) => $"{SalesDashboardPrefix}{tenantId}";

    /// <summary>
    /// Generates a sales dashboard group name for tenant-specific sales notifications
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Group name in format: sales-dashboard-{tenantId}</returns>
    public static string ForSalesDashboard(Guid tenantId) => ForSalesDashboard(tenantId.ToString());

    #endregion

    #region Chat Room Groups

    private const string ChatRoomPrefix = "chat-room-";

    /// <summary>
    /// Generates a chat room group name
    /// </summary>
    /// <param name="roomName">The room name</param>
    /// <returns>Group name in format: chat-room-{roomName}</returns>
    public static string ForChatRoom(string roomName) => $"{ChatRoomPrefix}{roomName}";

    /// <summary>
    /// Generates the default chat room name for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <returns>Default room name for the tenant</returns>
    public static string DefaultChatRoom(string tenantId) => $"default-{tenantId}";

    #endregion
}
