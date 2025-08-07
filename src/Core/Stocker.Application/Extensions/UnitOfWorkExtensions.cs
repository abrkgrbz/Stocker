using Stocker.Domain.Master.Entities;
using Stocker.Domain.Tenant.Entities;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Repositories;

namespace Stocker.Application.Extensions;

/// <summary>
/// Extension methods for Unit of Work to provide strongly-typed repository access
/// </summary>
public static class UnitOfWorkExtensions
{
    #region Master Unit of Work Extensions

    public static IRepository<Tenant> Tenants(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<Tenant>();

    public static IRepository<Package> Packages(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<Package>();

    public static IRepository<Subscription> Subscriptions(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<Subscription>();

    public static IRepository<Invoice> Invoices(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<Invoice>();

    public static IRepository<MasterUser> MasterUsers(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.Repository<MasterUser>();

    // Read-only repository access
    public static IReadRepository<Tenant> TenantsReadOnly(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<Tenant>();

    public static IReadRepository<Package> PackagesReadOnly(this IMasterUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<Package>();

    #endregion

    #region Tenant Unit of Work Extensions

    public static IRepository<Company> Companies(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<Company>();

    public static IRepository<Department> Departments(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<Department>();

    public static IRepository<Branch> Branches(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<Branch>();

    public static IRepository<TenantUser> TenantUsers(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<TenantUser>();

    public static IRepository<Role> Roles(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.Repository<Role>();

    // Read-only repository access
    public static IReadRepository<Company> CompaniesReadOnly(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<Company>();

    public static IReadRepository<TenantUser> TenantUsersReadOnly(this ITenantUnitOfWork unitOfWork)
        => unitOfWork.ReadRepository<TenantUser>();

    #endregion
}