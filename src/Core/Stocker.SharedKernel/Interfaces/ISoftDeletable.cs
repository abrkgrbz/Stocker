namespace Stocker.SharedKernel.Interfaces;

/// <summary>
/// Interface for entities that support soft delete functionality.
/// When an entity is deleted, it is marked as deleted instead of being physically removed.
/// </summary>
public interface ISoftDeletable
{
    /// <summary>
    /// Indicates whether the entity has been soft deleted
    /// </summary>
    bool IsDeleted { get; }

    /// <summary>
    /// The UTC date and time when the entity was deleted
    /// </summary>
    DateTime? DeletedAt { get; }

    /// <summary>
    /// The user who deleted the entity
    /// </summary>
    string? DeletedBy { get; }

    /// <summary>
    /// Marks the entity as deleted
    /// </summary>
    void MarkAsDeleted(string? deletedBy = null);

    /// <summary>
    /// Restores a soft-deleted entity
    /// </summary>
    void Restore();
}
