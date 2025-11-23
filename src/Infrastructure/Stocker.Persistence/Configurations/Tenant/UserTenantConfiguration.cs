using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Stocker.Domain.Tenant.Entities;

namespace Stocker.Persistence.Configurations.Tenant;

public class UserTenantConfiguration : BaseEntityTypeConfiguration<UserTenant>
{
    public override void Configure(EntityTypeBuilder<UserTenant> builder)
    {
        base.Configure(builder);
        
        builder.ToTable("UserTenants", "tenant");
        
        // User Information
        builder.Property(ut => ut.UserId)
            .IsRequired();
            
        builder.Property(ut => ut.Username)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(ut => ut.Email)
            .IsRequired()
            .HasMaxLength(200);
            
        builder.Property(ut => ut.FirstName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(ut => ut.LastName)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(ut => ut.PhoneNumber)
            .HasMaxLength(50);
            
        // Role and Permissions
        builder.Property(ut => ut.UserType)
            .IsRequired()
            .HasConversion<string>()
            .HasMaxLength(50);
            
        builder.Property(ut => ut.RoleId);
        
        builder.Property(ut => ut.RoleName)
            .HasMaxLength(100);
            
        builder.Property(ut => ut.Permissions)
            .HasColumnType("text");
            
        builder.Property(ut => ut.CustomPermissions)
            .HasColumnType("text");
            
        builder.Property(ut => ut.RestrictedPermissions)
            .HasColumnType("text");
            
        // Access Control
        builder.Property(ut => ut.IsActive)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(ut => ut.IsDefault)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(ut => ut.IsLocked)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(ut => ut.LockedUntil);
        
        builder.Property(ut => ut.LockReason)
            .HasMaxLength(500);
            
        builder.Property(ut => ut.FailedAccessAttempts)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(ut => ut.LastFailedAccess);
        
        // Department and Branch Assignment
        builder.Property(ut => ut.DepartmentId);
        
        builder.Property(ut => ut.DepartmentName)
            .HasMaxLength(200);
            
        builder.Property(ut => ut.BranchId);
        
        builder.Property(ut => ut.BranchName)
            .HasMaxLength(200);
            
        builder.Property(ut => ut.ManagerId);
        
        builder.Property(ut => ut.ManagerName)
            .HasMaxLength(200);
            
        // Working Hours and Schedule
        builder.Property(ut => ut.WorkStartTime);
        
        builder.Property(ut => ut.WorkEndTime);
        
        builder.Property(ut => ut.WorkingDays)
            .HasColumnType("text");
            
        builder.Property(ut => ut.TimeZone)
            .HasMaxLength(100);
            
        builder.Property(ut => ut.AllowFlexibleHours)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(ut => ut.AllowRemoteWork)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Access Restrictions
        builder.Property(ut => ut.AllowedIpAddresses)
            .HasColumnType("text");
            
        builder.Property(ut => ut.BlockedIpAddresses)
            .HasColumnType("text");
            
        builder.Property(ut => ut.RequireTwoFactor)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(ut => ut.RequirePasswordChange)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(ut => ut.PasswordExpiryDate);
        
        builder.Property(ut => ut.CanAccessApi)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(ut => ut.CanAccessMobile)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(ut => ut.CanAccessWeb)
            .IsRequired()
            .HasDefaultValue(true);
            
        // Session Management
        builder.Property(ut => ut.CurrentSessionId)
            .HasMaxLength(200);
            
        builder.Property(ut => ut.LastLoginAt);
        
        builder.Property(ut => ut.LastActivityAt);
        
        builder.Property(ut => ut.LastLoginIp)
            .HasMaxLength(50);
            
        builder.Property(ut => ut.LastLoginDevice)
            .HasMaxLength(500);
            
        builder.Property(ut => ut.TotalLoginCount)
            .IsRequired()
            .HasDefaultValue(0);
            
        builder.Property(ut => ut.IsOnline)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Preferences
        builder.Property(ut => ut.Language)
            .HasMaxLength(10);
            
        builder.Property(ut => ut.DateFormat)
            .HasMaxLength(50);
            
        builder.Property(ut => ut.NumberFormat)
            .HasMaxLength(50);
            
        builder.Property(ut => ut.Theme)
            .HasMaxLength(50);
            
        builder.Property(ut => ut.DashboardLayout)
            .HasColumnType("text");
            
        builder.Property(ut => ut.NotificationPreferences)
            .HasColumnType("text");
            
        builder.Property(ut => ut.EmailNotifications)
            .IsRequired()
            .HasDefaultValue(true);
            
        builder.Property(ut => ut.SmsNotifications)
            .IsRequired()
            .HasDefaultValue(false);
            
        builder.Property(ut => ut.PushNotifications)
            .IsRequired()
            .HasDefaultValue(false);
            
        // Audit
        builder.Property(ut => ut.AssignedAt)
            .IsRequired();
            
        builder.Property(ut => ut.AssignedBy)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(ut => ut.ModifiedAt);
        
        builder.Property(ut => ut.ModifiedBy)
            .HasMaxLength(100);
            
        builder.Property(ut => ut.DeactivatedAt);
        
        builder.Property(ut => ut.DeactivatedBy)
            .HasMaxLength(100);
            
        builder.Property(ut => ut.DeactivationReason)
            .HasMaxLength(500);
            
        // Statistics
        builder.Property(ut => ut.SalesQuota)
            .HasPrecision(18, 2);
            
        builder.Property(ut => ut.AchievedSales)
            .HasPrecision(18, 2);
            
        builder.Property(ut => ut.TasksAssigned);
        
        builder.Property(ut => ut.TasksCompleted);
        
        builder.Property(ut => ut.PerformanceScore)
            .HasPrecision(5, 2);
            
        builder.Property(ut => ut.LastPerformanceReview);
        
        // Indexes
        builder.HasIndex(ut => ut.UserId)
            .IsUnique()
            .HasDatabaseName("IX_UserTenants_UserId");
            
        builder.HasIndex(ut => ut.Email)
            .HasDatabaseName("IX_UserTenants_Email");
            
        builder.HasIndex(ut => ut.Username)
            .HasDatabaseName("IX_UserTenants_Username");
            
        builder.HasIndex(ut => ut.IsActive)
            .HasDatabaseName("IX_UserTenants_IsActive");
            
        builder.HasIndex(ut => ut.UserType)
            .HasDatabaseName("IX_UserTenants_UserType");
            
        builder.HasIndex(ut => ut.DepartmentId)
            .HasDatabaseName("IX_UserTenants_DepartmentId");
            
        builder.HasIndex(ut => ut.BranchId)
            .HasDatabaseName("IX_UserTenants_BranchId");
    }
}