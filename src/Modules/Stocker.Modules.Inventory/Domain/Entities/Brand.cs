using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Brand : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public string? LogoUrl { get; private set; }
    public string? Website { get; private set; }
    public bool IsActive { get; private set; }
    
    public virtual ICollection<Product> Products { get; private set; }
    
    protected Brand() { }
    
    public Brand(string code, string name)
    {
        Code = code;
        Name = name;
        IsActive = true;
        Products = new List<Product>();
    }
    
    public void UpdateBrand(string name, string? description, string? website)
    {
        Name = name;
        Description = description;
        Website = website;
    }
    
    public void SetLogo(string logoUrl)
    {
        LogoUrl = logoUrl;
    }
    
    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}