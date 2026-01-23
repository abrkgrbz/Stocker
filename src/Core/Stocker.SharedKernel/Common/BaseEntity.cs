using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Primitives;

namespace Stocker.SharedKernel.Common;

public abstract class BaseEntity : ITenantEntity
{
    private readonly List<IDomainEvent> _domainEvents = new();

    public int Id { get; protected set; }
    public Guid TenantId { get; protected set; }

    /// <summary>
    /// PostgreSQL system column used as concurrency token.
    /// Automatically managed by PostgreSQL - changes on every row update.
    /// </summary>
    public uint xmin { get; protected set; }
    public DateTime CreatedDate { get; protected set; }
    public DateTime? UpdatedDate { get; protected set; }
    public string? CreatedBy { get; protected set; }
    public string? UpdatedBy { get; protected set; }
    public bool IsDeleted { get; protected set; }
    public DateTime? DeletedDate { get; protected set; }

    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

    protected BaseEntity()
    {
        CreatedDate = DateTime.UtcNow;
        IsDeleted = false;
    }

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }

    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
    
    public void SetCreatedInfo(string createdBy)
    {
        CreatedBy = createdBy;
        CreatedDate = DateTime.UtcNow;
    }
    
    public void SetUpdatedInfo(string updatedBy)
    {
        UpdatedBy = updatedBy;
        UpdatedDate = DateTime.UtcNow;
    }
    
    public void Delete(string deletedBy)
    {
        IsDeleted = true;
        DeletedDate = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }
    
    public void Restore(string restoredBy)
    {
        IsDeleted = false;
        DeletedDate = null;
        UpdatedBy = restoredBy;
        UpdatedDate = DateTime.UtcNow;
    }
}