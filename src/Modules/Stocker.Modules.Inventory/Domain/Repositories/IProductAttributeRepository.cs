using Stocker.Modules.Inventory.Domain.Entities;

namespace Stocker.Modules.Inventory.Domain.Repositories;

/// <summary>
/// Repository interface for ProductAttribute entity
/// </summary>
public interface IProductAttributeRepository : IInventoryRepository<ProductAttribute>
{
    /// <summary>
    /// Gets a product attribute with its options
    /// </summary>
    Task<ProductAttribute?> GetWithOptionsAsync(int attributeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a product attribute by code
    /// </summary>
    Task<ProductAttribute?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets active product attributes
    /// </summary>
    Task<IReadOnlyList<ProductAttribute>> GetActiveAttributesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets filterable attributes (for product filtering UI)
    /// </summary>
    Task<IReadOnlyList<ProductAttribute>> GetFilterableAttributesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attributes by type
    /// </summary>
    Task<IReadOnlyList<ProductAttribute>> GetByTypeAsync(Domain.Enums.AttributeType attributeType, CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an attribute with the given code exists
    /// </summary>
    Task<bool> ExistsWithCodeAsync(string code, int? excludeAttributeId = null, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets attribute values for a product
    /// </summary>
    Task<IReadOnlyList<ProductAttributeValue>> GetProductAttributeValuesAsync(int productId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets an attribute option by ID
    /// </summary>
    Task<ProductAttributeOption?> GetOptionByIdAsync(int optionId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds an option to an attribute
    /// </summary>
    Task<ProductAttributeOption> AddOptionAsync(ProductAttributeOption option, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an option
    /// </summary>
    void UpdateOption(ProductAttributeOption option);

    /// <summary>
    /// Removes an option
    /// </summary>
    void RemoveOption(ProductAttributeOption option);

    /// <summary>
    /// Gets attribute value by product and attribute ID
    /// </summary>
    Task<ProductAttributeValue?> GetAttributeValueAsync(int productId, int attributeId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adds an attribute value to a product
    /// </summary>
    Task<ProductAttributeValue> AddAttributeValueAsync(ProductAttributeValue value, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an attribute value
    /// </summary>
    void UpdateAttributeValue(ProductAttributeValue value);

    /// <summary>
    /// Removes an attribute value
    /// </summary>
    void RemoveAttributeValue(ProductAttributeValue value);
}
