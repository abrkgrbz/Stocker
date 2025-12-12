using Stocker.SharedKernel.Primitives;

namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Base entity for CMS module with audit fields
/// CMS entities are stored in master database (not tenant-specific)
/// </summary>
public abstract class CMSBaseEntity : Entity
{
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }

    protected CMSBaseEntity()
    {
        Id = Guid.NewGuid();
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }

    public void SetCreatedInfo(string createdBy)
    {
        CreatedBy = createdBy;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetUpdatedInfo(string updatedBy)
    {
        UpdatedBy = updatedBy;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Delete(string deletedBy)
    {
        IsDeleted = true;
        DeletedAt = DateTime.UtcNow;
        UpdatedBy = deletedBy;
    }

    public void Restore(string restoredBy)
    {
        IsDeleted = false;
        DeletedAt = null;
        UpdatedBy = restoredBy;
        UpdatedAt = DateTime.UtcNow;
    }
}
