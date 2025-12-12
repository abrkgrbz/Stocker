namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Company value entity for about page
/// </summary>
public class CompanyValue : CMSBaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Icon { get; set; }
    public string? IconColor { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
