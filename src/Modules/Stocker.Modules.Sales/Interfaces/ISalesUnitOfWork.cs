using Stocker.Modules.Sales.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Interfaces;

/// <summary>
/// Unit of Work interface specific to the Sales module.
/// Provides access to sales-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in Sales handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across Sales operations
/// </summary>
/// <remarks>
/// Implementation: <see cref="Infrastructure.Persistence.SalesUnitOfWork"/>
/// Pattern: Inherits from IUnitOfWork (Pattern A - BaseUnitOfWork)
///
/// MIGRATION NOTE: This replaces the old SalesUnitOfWork that directly implemented IUnitOfWork.
/// The new implementation inherits from BaseUnitOfWork for consistency.
/// </remarks>
public interface ISalesUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }

    #region Sales Order Repositories

    /// <summary>
    /// Gets the Sales Order repository.
    /// </summary>
    ISalesOrderRepository SalesOrders { get; }

    /// <summary>
    /// Gets the Invoice repository.
    /// </summary>
    IInvoiceRepository Invoices { get; }

    /// <summary>
    /// Gets the Payment repository.
    /// </summary>
    IPaymentRepository Payments { get; }

    #endregion
}
