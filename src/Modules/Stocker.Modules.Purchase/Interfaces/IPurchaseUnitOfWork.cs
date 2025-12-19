using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Purchase.Interfaces;

/// <summary>
/// Unit of Work interface specific to the Purchase module.
/// Provides access to purchase-specific repositories while inheriting
/// all base UoW functionality (transactions, generic repositories, etc.)
///
/// This interface enables:
/// - Strong typing for dependency injection in Purchase handlers
/// - Access to domain-specific repositories
/// - Consistent transaction management across Purchase operations
/// </summary>
/// <remarks>
/// Implementation: <see cref="Infrastructure.Persistence.PurchaseUnitOfWork"/>
/// Pattern: Inherits from IUnitOfWork (Pattern A - BaseUnitOfWork)
///
/// NOTE: This is a NEW interface. The Purchase module previously did not have
/// an IUnitOfWork implementation (Report Issue #6 - Missing DI registration).
/// </remarks>
public interface IPurchaseUnitOfWork : IUnitOfWork
{
    /// <summary>
    /// Gets the current tenant identifier.
    /// All operations are scoped to this tenant.
    /// </summary>
    Guid TenantId { get; }

    // NOTE: Domain-specific repositories will be added here as they are created.
    // Currently the Purchase module uses generic Repository<T>() access from IUnitOfWork base.
    //
    // Future repositories to add:
    // - IPurchaseOrderRepository
    // - IPurchaseRequestRepository
    // - IGoodsReceiptRepository
    // - IPurchaseInvoiceRepository
    // - ISupplierRepository (Purchase-specific)
    // - IQuotationRepository
    // - IPurchaseContractRepository
    // - etc.
}
