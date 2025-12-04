using Stocker.Modules.Inventory.Domain.Enums;

namespace Stocker.Modules.Inventory.Application.DTOs;

/// <summary>
/// Data transfer object for ProductAttribute entity
/// </summary>
public class ProductAttributeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AttributeType AttributeType { get; set; }
    public bool IsRequired { get; set; }
    public bool IsFilterable { get; set; }
    public bool IsSearchable { get; set; }
    public bool ShowInList { get; set; }
    public int DisplayOrder { get; set; }
    public string? DefaultValue { get; set; }
    public string? ValidationPattern { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<ProductAttributeOptionDto> Options { get; set; } = new();
    public int ValueCount { get; set; }
}

/// <summary>
/// DTO for ProductAttributeOption
/// </summary>
public class ProductAttributeOptionDto
{
    public int Id { get; set; }
    public int ProductAttributeId { get; set; }
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? ColorCode { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO for ProductAttributeValue (assigned to a product)
/// </summary>
public class ProductAttributeValueDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int ProductAttributeId { get; set; }
    public string AttributeCode { get; set; } = string.Empty;
    public string AttributeName { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public int? OptionId { get; set; }
    public string? OptionLabel { get; set; }
}

/// <summary>
/// DTO for creating a ProductAttribute
/// </summary>
public class CreateProductAttributeDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public AttributeType AttributeType { get; set; }
    public bool IsRequired { get; set; }
    public bool IsFilterable { get; set; }
    public bool IsSearchable { get; set; }
    public bool ShowInList { get; set; }
    public int DisplayOrder { get; set; }
    public string? DefaultValue { get; set; }
    public string? ValidationPattern { get; set; }
    public List<CreateProductAttributeOptionDto>? Options { get; set; }
}

/// <summary>
/// DTO for creating a ProductAttributeOption
/// </summary>
public class CreateProductAttributeOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? ColorCode { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for updating a ProductAttribute
/// </summary>
public class UpdateProductAttributeDto
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsRequired { get; set; }
    public bool IsFilterable { get; set; }
    public bool IsSearchable { get; set; }
    public bool ShowInList { get; set; }
    public int DisplayOrder { get; set; }
    public string? DefaultValue { get; set; }
    public string? ValidationPattern { get; set; }
}

/// <summary>
/// DTO for updating a ProductAttributeOption
/// </summary>
public class UpdateProductAttributeOptionDto
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
    public string? ColorCode { get; set; }
    public string? ImageUrl { get; set; }
    public int DisplayOrder { get; set; }
}

/// <summary>
/// DTO for assigning attribute values to a product
/// </summary>
public class SetProductAttributeValueDto
{
    public int ProductAttributeId { get; set; }
    public string Value { get; set; } = string.Empty;
    public int? OptionId { get; set; }
}

/// <summary>
/// DTO for listing ProductAttributes (lightweight)
/// </summary>
public class ProductAttributeListDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public AttributeType AttributeType { get; set; }
    public bool IsRequired { get; set; }
    public bool IsFilterable { get; set; }
    public bool ShowInList { get; set; }
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; }
    public int OptionCount { get; set; }
}
