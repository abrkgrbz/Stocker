namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for Category entity
/// </summary>
public class CategoryDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public string? ParentCategoryName { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public int ProductCount { get; set; }
    public List<CategoryDto> SubCategories { get; set; } = new();
}

/// <summary>
/// DTO for creating a category
/// </summary>
public class CreateCategoryDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for updating a category
/// </summary>
public class UpdateCategoryDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? ParentCategoryId { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for category hierarchy (tree view)
/// </summary>
public class CategoryTreeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Level { get; set; }
    public bool HasChildren { get; set; }
    public List<CategoryTreeDto> Children { get; set; } = new();
}
