namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Individual integration system within a category
/// </summary>
public class IntegrationItem : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Logo { get; set; }
    public string? Url { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;

    // Foreign key
    public Guid IntegrationId { get; set; }

    // Navigation
    public virtual Integration? Integration { get; set; }
}
