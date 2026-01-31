using Stocker.Domain.Master.Enums.CMS;

namespace Stocker.Application.DTOs.CMS;

/// <summary>
/// Doküman öğesi detay DTO'su
/// </summary>
public class DocItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public DocItemType Type { get; set; }
    public string TypeText => Type.ToString().ToLowerInvariant();
    public Guid? ParentId { get; set; }
    public string? Content { get; set; }
    public int Order { get; set; }
    public string? Icon { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public Guid? AuthorId { get; set; }
    public string? AuthorName { get; set; }
}

/// <summary>
/// Doküman öğesi liste/ağaç DTO'su
/// </summary>
public class DocItemTreeDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public DocItemType Type { get; set; }
    public string TypeText => Type.ToString().ToLowerInvariant();
    public Guid? ParentId { get; set; }
    public int Order { get; set; }
    public string? Icon { get; set; }
    public bool IsActive { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<DocItemTreeDto> Children { get; set; } = new();
}

/// <summary>
/// Doküman öğesi düz liste DTO'su
/// </summary>
public class DocItemListDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public DocItemType Type { get; set; }
    public string TypeText => Type.ToString().ToLowerInvariant();
    public Guid? ParentId { get; set; }
    public int Order { get; set; }
    public string? Icon { get; set; }
    public bool IsActive { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
