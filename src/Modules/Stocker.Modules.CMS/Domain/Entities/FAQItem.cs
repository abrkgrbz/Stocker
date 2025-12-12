namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// FAQ item (question and answer)
/// </summary>
public class FAQItem : CMSBaseEntity
{
    public string Question { get; set; } = string.Empty;
    public string Answer { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public int ViewCount { get; set; }
    public int HelpfulCount { get; set; }
    public int NotHelpfulCount { get; set; }

    // Foreign key
    public Guid CategoryId { get; set; }

    // Navigation
    public virtual FAQCategory Category { get; set; } = null!;
}
