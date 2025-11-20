using MasterEntities = Stocker.Domain.Master.Entities;
using TenantEntities = Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Extensions;

/// <summary>
/// Extension methods for Unit of Work to provide strongly-typed repository access
/// </summary>
public static class UnitOfWorkExtensions
{
    #region Master Unit of Work Extensions

    public static IRepository<MasterEntities.Tenant> Tenants(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<MasterEntities.Tenant>();

    public static IRepository<MasterEntities.Package> Packages(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<MasterEntities.Package>();

    public static IRepository<MasterEntities.Subscription> Subscriptions(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<MasterEntities.Subscription>();

    public static IRepository<MasterEntities.Invoice> Invoices(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<MasterEntities.Invoice>();

    public static IRepository<MasterEntities.MasterUser> MasterUsers(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<MasterEntities.MasterUser>();

    public static IRepository<MasterEntities.SecurityAuditLog> SecurityAuditLogs(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<MasterEntities.SecurityAuditLog>();

    // Read-only repository access
    public static IReadRepository<MasterEntities.Tenant> TenantsReadOnly(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<MasterEntities.Tenant>();

    public static IReadRepository<MasterEntities.SecurityAuditLog> SecurityAuditLogsReadOnly(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<MasterEntities.SecurityAuditLog>();

    public static IReadRepository<MasterEntities.Package> PackagesReadOnly(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<MasterEntities.Package>();

    #endregion

    #region Tenant Unit of Work Extensions

    public static IRepository<TenantEntities.Company> Companies(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantEntities.Company>();

    public static IRepository<TenantEntities.Department> Departments(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantEntities.Department>();

    public static IRepository<TenantEntities.Branch> Branches(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantEntities.Branch>();

    public static IRepository<TenantEntities.TenantUser> TenantUsers(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantEntities.TenantUser>();

    public static IRepository<TenantEntities.Role> Roles(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantEntities.Role>();
    
    public static IRepository<TenantEntities.Invoice> Invoices(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantEntities.Invoice>();
    
    public static IRepository<TenantEntities.Payment> Payments(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantEntities.Payment>();

    // Read-only repository access
    public static IReadRepository<TenantEntities.Company> CompaniesReadOnly(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<TenantEntities.Company>();

    public static IReadRepository<TenantEntities.TenantUser> TenantUsersReadOnly(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<TenantEntities.TenantUser>();

    #endregion
}