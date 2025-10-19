namespace Stocker.Modules.CRM.Domain.Enums;

/// <summary>
/// Access levels for document permission control
/// </summary>
public enum AccessLevel
{
    /// <summary>
    /// Only the uploader can access
    /// </summary>
    Private = 0,

    /// <summary>
    /// Only assigned team members can access
    /// </summary>
    Team = 1,

    /// <summary>
    /// All users in the tenant can access
    /// </summary>
    Internal = 2,

    /// <summary>
    /// Can be shared with external parties (customers, partners)
    /// </summary>
    Public = 3,

    /// <summary>
    /// Restricted access requiring special permissions
    /// </summary>
    Confidential = 4
}
