using Stocker.SharedKernel.Common;
using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Domain.Entities;

/// <summary>
/// Custom attribute definition for products (e.g., Color, Size, Material)
/// Allows flexible product properties without schema changes
/// </summary>
public class ProductAttribute : BaseEntity
{
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public AttributeType AttributeType { get; private set; }
    public bool IsRequired { get; private set; }
    public bool IsFilterable { get; private set; }
    public bool IsSearchable { get; private set; }
    public bool ShowInList { get; private set; }
    public int DisplayOrder { get; private set; }
    public string? DefaultValue { get; private set; }
    public string? ValidationPattern { get; private set; }
    public bool IsActive { get; private set; }

    public virtual ICollection<ProductAttributeOption> Options { get; private set; }
    public virtual ICollection<ProductAttributeValue> Values { get; private set; }

    protected ProductAttribute() { }

    public ProductAttribute(
        string code,
        string name,
        AttributeType attributeType)
    {
        Code = code;
        Name = name;
        AttributeType = attributeType;
        IsRequired = false;
        IsFilterable = false;
        IsSearchable = false;
        ShowInList = false;
        DisplayOrder = 0;
        IsActive = true;
        Options = new List<ProductAttributeOption>();
        Values = new List<ProductAttributeValue>();
    }

    public void UpdateAttribute(string name, string? description)
    {
        Name = name;
        Description = description;
    }

    public void SetDisplaySettings(bool showInList, int displayOrder)
    {
        ShowInList = showInList;
        DisplayOrder = displayOrder;
    }

    public void SetSearchSettings(bool isFilterable, bool isSearchable)
    {
        IsFilterable = isFilterable;
        IsSearchable = isSearchable;
    }

    public void SetRequired(bool isRequired)
    {
        IsRequired = isRequired;
    }

    public void SetDefaultValue(string? defaultValue)
    {
        DefaultValue = defaultValue;
    }

    public void SetValidationPattern(string? pattern)
    {
        ValidationPattern = pattern;
    }

    public ProductAttributeOption AddOption(string value, string? label = null)
    {
        if (AttributeType != AttributeType.Select && AttributeType != AttributeType.MultiSelect)
            throw new InvalidOperationException("Options can only be added to Select or MultiSelect attributes");

        var option = new ProductAttributeOption(Id, value, label ?? value);
        option.SetDisplayOrder(Options.Count);
        Options.Add(option);
        return option;
    }

    public void RemoveOption(int optionId)
    {
        var option = Options.FirstOrDefault(o => o.Id == optionId);
        if (option != null)
        {
            Options.Remove(option);
        }
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Predefined options for Select/MultiSelect attributes
/// </summary>
public class ProductAttributeOption : BaseEntity
{
    public int ProductAttributeId { get; private set; }
    public string Value { get; private set; }
    public string Label { get; private set; }
    public string? ColorCode { get; private set; }
    public string? ImageUrl { get; private set; }
    public int DisplayOrder { get; private set; }
    public bool IsActive { get; private set; }

    public virtual ProductAttribute ProductAttribute { get; private set; }

    protected ProductAttributeOption() { }

    public ProductAttributeOption(int productAttributeId, string value, string label)
    {
        ProductAttributeId = productAttributeId;
        Value = value;
        Label = label;
        DisplayOrder = 0;
        IsActive = true;
    }

    public void UpdateOption(string value, string label)
    {
        Value = value;
        Label = label;
    }

    public void SetColorCode(string? colorCode)
    {
        ColorCode = colorCode;
    }

    public void SetImageUrl(string? imageUrl)
    {
        ImageUrl = imageUrl;
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }

    public void Activate() => IsActive = true;
    public void Deactivate() => IsActive = false;
}

/// <summary>
/// Actual attribute value assigned to a product
/// </summary>
public class ProductAttributeValue : BaseEntity
{
    public int ProductId { get; private set; }
    public int ProductAttributeId { get; private set; }
    public string Value { get; private set; }
    public int? OptionId { get; private set; }

    public virtual Product Product { get; private set; }
    public virtual ProductAttribute ProductAttribute { get; private set; }
    public virtual ProductAttributeOption? Option { get; private set; }

    protected ProductAttributeValue() { }

    public ProductAttributeValue(int productId, int productAttributeId, string value)
    {
        ProductId = productId;
        ProductAttributeId = productAttributeId;
        Value = value;
    }

    public void SetValue(string value)
    {
        Value = value;
        OptionId = null;
    }

    public void SetOption(int optionId, string value)
    {
        OptionId = optionId;
        Value = value;
    }
}
