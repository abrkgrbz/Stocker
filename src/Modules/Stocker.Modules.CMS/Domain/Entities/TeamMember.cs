namespace Stocker.Modules.CMS.Domain.Entities;

/// <summary>
/// Team member entity for about page
/// </summary>
public class TeamMember : CMSBaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Department { get; set; }
    public string? Bio { get; set; }
    public string? Avatar { get; set; }
    public string? Email { get; set; }
    public string? LinkedIn { get; set; }
    public string? Twitter { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsLeadership { get; set; } // For filtering leadership team
}
