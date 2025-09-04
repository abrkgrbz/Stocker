using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Category : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public int? ParentCategoryId { get; private set; }
    public bool IsActive { get; private set; }
    public string? ImageUrl { get; private set; }
    public int DisplayOrder { get; private set; }
    
    public virtual Category? ParentCategory { get; private set; }
    public virtual ICollection<Category> SubCategories { get; private set; }
    public virtual ICollection<Product> Products { get; private set; }
    
    protected Category() { }
    
    public Category(string code, string name, int? parentCategoryId = null)
    {
        Code = code;
        Name = name;
        ParentCategoryId = parentCategoryId;
        IsActive = true;
        DisplayOrder = 0;
        SubCategories = new List<Category>();
        Products = new List<Product>();
    }
    
    public void UpdateCategory(string name, string? description, int? parentCategoryId)
    {
        Name = name;
        Description = description;
        ParentCategoryId = parentCategoryId;
    }
    
    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }
    
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}