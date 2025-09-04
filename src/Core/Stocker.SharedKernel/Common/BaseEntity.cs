namespace Stocker.SharedKernel.Common;

public abstract class BaseEntity
{
    public int Id { get; protected set; }
    public DateTime CreatedDate { get; protected set; }
    public DateTime? UpdatedDate { get; protected set; }
    public string? CreatedBy { get; protected set; }
    public string? UpdatedBy { get; protected set; }
    public bool IsDeleted { get; protected set; }
    public DateTime? DeletedDate { get; protected set; }
    
    protected BaseEntity()
    {
        CreatedDate = DateTime.UtcNow;
        IsDeleted = false;
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