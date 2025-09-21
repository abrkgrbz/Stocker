using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Master.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Tenant database context interface for clean architecture
/// </summary>
public interface ITenantDbContext : IDisposable, IAsyncDisposable
{
    // Tenant entities
    DbSet<Domain.Tenant.Entities.TenantSettings> TenantSettings { get; }
    DbSet<TenantModules> TenantModules { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<TenantUser> TenantUsers { get; }
    DbSet<Role> Roles { get; }
    // DbSet<Permission> Permissions { get; } // TODO: Add Permission entity
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserRole> UserRoles { get; }
    DbSet<UserPermission> UserPermissions { get; }
    
    // Setup & Onboarding
    DbSet<SetupWizard> SetupWizards { get; }
    DbSet<SetupWizardStep> SetupWizardSteps { get; }
    
    // Customer & Product Management
    DbSet<Customer> Customers { get; }
    DbSet<Product> Products { get; }
    
    // Financial
    DbSet<Domain.Tenant.Entities.Invoice> Invoices { get; }
    DbSet<Domain.Tenant.Entities.InvoiceItem> InvoiceItems { get; }
    DbSet<Domain.Tenant.Entities.Payment> Payments { get; }
    
    // Common methods
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    int SaveChanges();
}