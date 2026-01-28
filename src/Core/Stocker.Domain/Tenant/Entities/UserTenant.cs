using Stocker.Domain.Constants;
using Stocker.SharedKernel.Primitives;
using System;

namespace Stocker.Domain.Tenant.Entities;

/// <summary>
/// Kullanıcı-Tenant ilişkisi - Kullanıcının bu tenant'taki rolü ve yetkileri
/// </summary>
public sealed class UserTenant : AggregateRoot<Guid>
{
    public Guid UserId { get; private set; }
    
    // User Information
    public string Username { get; private set; }
    public string Email { get; private set; }
    public string FirstName { get; private set; }
    public string LastName { get; private set; }
    public string? PhoneNumber { get; private set; }
    
    // Role and Permissions
    public UserType UserType { get; private set; }
    public Guid? RoleId { get; private set; }
    public string? RoleName { get; private set; }
    public string? Permissions { get; private set; } // JSON array of permission codes
    public string? CustomPermissions { get; private set; } // JSON array of additional permissions
    public string? RestrictedPermissions { get; private set; } // JSON array of restricted permissions
    
    // Access Control
    public bool IsActive { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsLocked { get; private set; }
    public DateTime? LockedUntil { get; private set; }
    public string? LockReason { get; private set; }
    public int FailedAccessAttempts { get; private set; }
    public DateTime? LastFailedAccess { get; private set; }
    
    // Department and Branch Assignment
    public Guid? DepartmentId { get; private set; }
    public string? DepartmentName { get; private set; }
    public Guid? BranchId { get; private set; }
    public string? BranchName { get; private set; }
    public Guid? ManagerId { get; private set; }
    public string? ManagerName { get; private set; }
    
    // Working Hours and Schedule
    public TimeSpan? WorkStartTime { get; private set; }
    public TimeSpan? WorkEndTime { get; private set; }
    public string? WorkingDays { get; private set; } // JSON array of working days
    public string? TimeZone { get; private set; }
    public bool AllowFlexibleHours { get; private set; }
    public bool AllowRemoteWork { get; private set; }
    
    // Access Restrictions
    public string? AllowedIpAddresses { get; private set; } // JSON array
    public string? BlockedIpAddresses { get; private set; } // JSON array
    public bool RequireTwoFactor { get; private set; }
    public bool RequirePasswordChange { get; private set; }
    public DateTime? PasswordExpiryDate { get; private set; }
    public bool CanAccessApi { get; private set; }
    public bool CanAccessMobile { get; private set; }
    public bool CanAccessWeb { get; private set; }
    
    // Session Management
    public string? CurrentSessionId { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public DateTime? LastActivityAt { get; private set; }
    public string? LastLoginIp { get; private set; }
    public string? LastLoginDevice { get; private set; }
    public int TotalLoginCount { get; private set; }
    public bool IsOnline { get; private set; }
    
    // Preferences
    public string? Language { get; private set; }
    public string? DateFormat { get; private set; }
    public string? NumberFormat { get; private set; }
    public string? Theme { get; private set; }
    public string? DashboardLayout { get; private set; } // JSON object
    public string? NotificationPreferences { get; private set; } // JSON object
    public bool EmailNotifications { get; private set; }
    public bool SmsNotifications { get; private set; }
    public bool PushNotifications { get; private set; }
    
    // Audit
    public DateTime AssignedAt { get; private set; }
    public string AssignedBy { get; private set; }
    public DateTime? ModifiedAt { get; private set; }
    public string? ModifiedBy { get; private set; }
    public DateTime? DeactivatedAt { get; private set; }
    public string? DeactivatedBy { get; private set; }
    public string? DeactivationReason { get; private set; }
    
    // Statistics
    public decimal? SalesQuota { get; private set; }
    public decimal? AchievedSales { get; private set; }
    public int? TasksAssigned { get; private set; }
    public int? TasksCompleted { get; private set; }
    public decimal? PerformanceScore { get; private set; }
    public DateTime? LastPerformanceReview { get; private set; }
    
    // Navigation
    public Role? Role { get; private set; }
    public Department? Department { get; private set; }
    public Branch? Branch { get; private set; }
    
    private UserTenant() { } // EF Constructor
    
    private UserTenant(
        Guid userId,
        string username,
        string email,
        string firstName,
        string lastName,
        UserType userType,
        string assignedBy)
    {
        Id = Guid.NewGuid();
        UserId = userId;
        Username = username;
        Email = email;
        FirstName = firstName;
        LastName = lastName;
        UserType = userType;
        AssignedAt = DateTime.UtcNow;
        AssignedBy = assignedBy;
        IsActive = true;
        IsDefault = false;
        IsLocked = false;
        FailedAccessAttempts = 0;
        AllowFlexibleHours = false;
        AllowRemoteWork = false;
        RequireTwoFactor = false;
        RequirePasswordChange = false;
        CanAccessApi = true;
        CanAccessMobile = true;
        CanAccessWeb = true;
        TotalLoginCount = 0;
        IsOnline = false;
        EmailNotifications = true;
        SmsNotifications = false;
        PushNotifications = false;
    }
    
    public static UserTenant Create(
        Guid userId,
        string username,
        string email,
        string firstName,
        string lastName,
        UserType userType,
        string assignedBy,
        string? phoneNumber = null)
    {
        if (userId == Guid.Empty)
            throw new ArgumentException("User ID cannot be empty.", nameof(userId));
        if (string.IsNullOrWhiteSpace(username))
            throw new ArgumentException("Username cannot be empty.", nameof(username));
        if (string.IsNullOrWhiteSpace(email))
            throw new ArgumentException("Email cannot be empty.", nameof(email));
        if (string.IsNullOrWhiteSpace(firstName))
            throw new ArgumentException("First name cannot be empty.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName))
            throw new ArgumentException("Last name cannot be empty.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(assignedBy))
            throw new ArgumentException("Assigned by cannot be empty.", nameof(assignedBy));
            
        var userTenant = new UserTenant(
            userId,
            username,
            email,
            firstName,
            lastName,
            userType,
            assignedBy);
            
        userTenant.PhoneNumber = phoneNumber;
        
        return userTenant;
    }
    
    public void UpdateUserInfo(string firstName, string lastName, string? phoneNumber = null)
    {
        FirstName = firstName;
        LastName = lastName;
        PhoneNumber = phoneNumber;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void UpdateUserType(UserType newUserType, string modifiedBy)
    {
        UserType = newUserType;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void AssignRole(Guid roleId, string roleName, List<string>? permissions = null)
    {
        RoleId = roleId;
        RoleName = roleName;
        if (permissions != null)
        {
            Permissions = System.Text.Json.JsonSerializer.Serialize(permissions);
        }
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void RemoveRole()
    {
        RoleId = null;
        RoleName = null;
        Permissions = null;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void AddCustomPermissions(List<string> permissions, string modifiedBy)
    {
        CustomPermissions = System.Text.Json.JsonSerializer.Serialize(permissions);
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetRestrictedPermissions(List<string> permissions, string modifiedBy)
    {
        RestrictedPermissions = System.Text.Json.JsonSerializer.Serialize(permissions);
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void AssignToDepartment(Guid departmentId, string departmentName, string modifiedBy)
    {
        DepartmentId = departmentId;
        DepartmentName = departmentName;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void AssignToBranch(Guid branchId, string branchName, string modifiedBy)
    {
        BranchId = branchId;
        BranchName = branchName;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void AssignManager(Guid managerId, string managerName, string modifiedBy)
    {
        ManagerId = managerId;
        ManagerName = managerName;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = modifiedBy;
    }
    
    public void SetWorkingHours(
        TimeSpan startTime,
        TimeSpan endTime,
        List<string> workingDays,
        string? timeZone = null,
        bool flexibleHours = false,
        bool remoteWork = false)
    {
        WorkStartTime = startTime;
        WorkEndTime = endTime;
        WorkingDays = System.Text.Json.JsonSerializer.Serialize(workingDays);
        TimeZone = timeZone;
        AllowFlexibleHours = flexibleHours;
        AllowRemoteWork = remoteWork;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetAccessRestrictions(
        List<string>? allowedIps = null,
        List<string>? blockedIps = null,
        bool requireTwoFactor = false)
    {
        AllowedIpAddresses = allowedIps != null ? System.Text.Json.JsonSerializer.Serialize(allowedIps) : null;
        BlockedIpAddresses = blockedIps != null ? System.Text.Json.JsonSerializer.Serialize(blockedIps) : null;
        RequireTwoFactor = requireTwoFactor;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetPlatformAccess(bool canAccessWeb, bool canAccessMobile, bool canAccessApi)
    {
        CanAccessWeb = canAccessWeb;
        CanAccessMobile = canAccessMobile;
        CanAccessApi = canAccessApi;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetRequirePasswordChange(DateTime expiryDate)
    {
        RequirePasswordChange = true;
        PasswordExpiryDate = expiryDate;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void PasswordChanged()
    {
        RequirePasswordChange = false;
        PasswordExpiryDate = null;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetAsDefault()
    {
        IsDefault = true;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void UnsetAsDefault()
    {
        IsDefault = false;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void Lock(string reason, DateTime? until = null, string lockedBy = DomainConstants.SystemUser)
    {
        IsLocked = true;
        LockReason = reason;
        LockedUntil = until;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = lockedBy;
    }
    
    public void Unlock(string unlockedBy)
    {
        IsLocked = false;
        LockReason = null;
        LockedUntil = null;
        FailedAccessAttempts = 0;
        LastFailedAccess = null;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = unlockedBy;
    }
    
    public void RecordFailedAccess(string ipAddress)
    {
        FailedAccessAttempts++;
        LastFailedAccess = DateTime.UtcNow;
        
        // Auto-lock after 5 failed attempts
        if (FailedAccessAttempts >= 5)
        {
            Lock("Too many failed access attempts", DateTime.UtcNow.AddHours(1));
        }
    }
    
    public void RecordSuccessfulLogin(string ipAddress, string? device = null, string? sessionId = null)
    {
        LastLoginAt = DateTime.UtcNow;
        LastActivityAt = DateTime.UtcNow;
        LastLoginIp = ipAddress;
        LastLoginDevice = device;
        CurrentSessionId = sessionId;
        TotalLoginCount++;
        IsOnline = true;
        FailedAccessAttempts = 0;
        LastFailedAccess = null;
    }
    
    public void RecordActivity()
    {
        LastActivityAt = DateTime.UtcNow;
        IsOnline = true;
    }
    
    public void RecordLogout()
    {
        IsOnline = false;
        CurrentSessionId = null;
    }
    
    public void SetPreferences(
        string? language = null,
        string? dateFormat = null,
        string? numberFormat = null,
        string? theme = null)
    {
        if (!string.IsNullOrWhiteSpace(language))
            Language = language;
        if (!string.IsNullOrWhiteSpace(dateFormat))
            DateFormat = dateFormat;
        if (!string.IsNullOrWhiteSpace(numberFormat))
            NumberFormat = numberFormat;
        if (!string.IsNullOrWhiteSpace(theme))
            Theme = theme;
            
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetDashboardLayout(object layout)
    {
        DashboardLayout = System.Text.Json.JsonSerializer.Serialize(layout);
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetNotificationPreferences(
        bool email,
        bool sms,
        bool push,
        object? preferences = null)
    {
        EmailNotifications = email;
        SmsNotifications = sms;
        PushNotifications = push;
        
        if (preferences != null)
        {
            NotificationPreferences = System.Text.Json.JsonSerializer.Serialize(preferences);
        }
        
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetSalesQuota(decimal quota)
    {
        SalesQuota = quota;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void UpdateSalesAchievement(decimal achieved)
    {
        AchievedSales = achieved;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void UpdateTaskStatistics(int assigned, int completed)
    {
        TasksAssigned = assigned;
        TasksCompleted = completed;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void SetPerformanceScore(decimal score, DateTime reviewDate)
    {
        PerformanceScore = score;
        LastPerformanceReview = reviewDate;
        ModifiedAt = DateTime.UtcNow;
    }
    
    public void Activate(string activatedBy)
    {
        IsActive = true;
        IsLocked = false;
        DeactivatedAt = null;
        DeactivatedBy = null;
        DeactivationReason = null;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = activatedBy;
    }
    
    public void Deactivate(string deactivatedBy, string reason)
    {
        IsActive = false;
        DeactivatedAt = DateTime.UtcNow;
        DeactivatedBy = deactivatedBy;
        DeactivationReason = reason;
        ModifiedAt = DateTime.UtcNow;
        ModifiedBy = deactivatedBy;
    }
    
    public bool CanAccess(string ipAddress)
    {
        if (!IsActive || IsLocked)
            return false;
            
        if (LockedUntil.HasValue && LockedUntil.Value > DateTime.UtcNow)
            return false;
            
        // Check IP restrictions
        if (!string.IsNullOrWhiteSpace(BlockedIpAddresses))
        {
            var blockedIps = System.Text.Json.JsonSerializer.Deserialize<List<string>>(BlockedIpAddresses);
            if (blockedIps != null && blockedIps.Contains(ipAddress))
                return false;
        }
        
        if (!string.IsNullOrWhiteSpace(AllowedIpAddresses))
        {
            var allowedIps = System.Text.Json.JsonSerializer.Deserialize<List<string>>(AllowedIpAddresses);
            if (allowedIps != null && !allowedIps.Contains(ipAddress))
                return false;
        }
        
        return true;
    }
    
    public bool HasPermission(string permission)
    {
        // Check if permission is restricted
        if (!string.IsNullOrWhiteSpace(RestrictedPermissions))
        {
            var restricted = System.Text.Json.JsonSerializer.Deserialize<List<string>>(RestrictedPermissions);
            if (restricted != null && restricted.Contains(permission))
                return false;
        }
        
        // Check role permissions
        if (!string.IsNullOrWhiteSpace(Permissions))
        {
            var permissions = System.Text.Json.JsonSerializer.Deserialize<List<string>>(Permissions);
            if (permissions != null && permissions.Contains(permission))
                return true;
        }
        
        // Check custom permissions
        if (!string.IsNullOrWhiteSpace(CustomPermissions))
        {
            var customPerms = System.Text.Json.JsonSerializer.Deserialize<List<string>>(CustomPermissions);
            if (customPerms != null && customPerms.Contains(permission))
                return true;
        }
        
        return false;
    }
}

public enum UserType
{
    SistemYoneticisi = 0,    // Tüm sistemin yöneticisi (platform sahibi)
    FirmaYoneticisi = 1,     // Tenant sahibi ve yöneticisi (müşteriler)
    Personel = 2,            // Firma çalışanı (müşterilerin çalışanları)
    Destek = 3,              // Destek personeli (platform destek ekibi)
    Misafir = 4              // Sınırlı erişimli kullanıcı
}