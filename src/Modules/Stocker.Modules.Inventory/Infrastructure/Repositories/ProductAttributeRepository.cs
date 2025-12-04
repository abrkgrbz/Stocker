using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;

namespace Stocker.Modules.Inventory.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for ProductAttribute entity
/// </summary>
public class ProductAttributeRepository : BaseRepository<ProductAttribute>, IProductAttributeRepository
{
    public ProductAttributeRepository(InventoryDbContext context) : base(context)
    {
    }

    public async Task<ProductAttribute?> GetWithOptionsAsync(int attributeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Options.Where(o => !o.IsDeleted).OrderBy(o => o.DisplayOrder))
            .Where(a => !a.IsDeleted && a.Id == attributeId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductAttribute?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Where(a => !a.IsDeleted && a.Code == code)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductAttribute>> GetActiveAttributesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Options.Where(o => !o.IsDeleted && o.IsActive).OrderBy(o => o.DisplayOrder))
            .Where(a => !a.IsDeleted && a.IsActive)
            .OrderBy(a => a.DisplayOrder)
            .ThenBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductAttribute>> GetFilterableAttributesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Options.Where(o => !o.IsDeleted && o.IsActive).OrderBy(o => o.DisplayOrder))
            .Where(a => !a.IsDeleted && a.IsActive && a.IsFilterable)
            .OrderBy(a => a.DisplayOrder)
            .ThenBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductAttribute>> GetByTypeAsync(AttributeType attributeType, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .Include(a => a.Options.Where(o => !o.IsDeleted).OrderBy(o => o.DisplayOrder))
            .Where(a => !a.IsDeleted && a.AttributeType == attributeType)
            .OrderBy(a => a.DisplayOrder)
            .ThenBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> ExistsWithCodeAsync(string code, int? excludeAttributeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.Where(a => !a.IsDeleted && a.Code == code);

        if (excludeAttributeId.HasValue)
        {
            query = query.Where(a => a.Id != excludeAttributeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductAttributeValue>> GetProductAttributeValuesAsync(int productId, CancellationToken cancellationToken = default)
    {
        return await Context.ProductAttributeValues
            .Include(v => v.ProductAttribute)
            .Include(v => v.Option)
            .Where(v => !v.IsDeleted && v.ProductId == productId)
            .ToListAsync(cancellationToken);
    }

    public async Task<ProductAttributeOption?> GetOptionByIdAsync(int optionId, CancellationToken cancellationToken = default)
    {
        return await Context.ProductAttributeOptions
            .Where(o => !o.IsDeleted && o.Id == optionId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductAttributeOption> AddOptionAsync(ProductAttributeOption option, CancellationToken cancellationToken = default)
    {
        await Context.ProductAttributeOptions.AddAsync(option, cancellationToken);
        return option;
    }

    public void UpdateOption(ProductAttributeOption option)
    {
        Context.ProductAttributeOptions.Update(option);
    }

    public void RemoveOption(ProductAttributeOption option)
    {
        option.Deactivate();
        Context.ProductAttributeOptions.Update(option);
    }

    public async Task<ProductAttributeValue?> GetAttributeValueAsync(int productId, int attributeId, CancellationToken cancellationToken = default)
    {
        return await Context.ProductAttributeValues
            .Where(v => !v.IsDeleted && v.ProductId == productId && v.ProductAttributeId == attributeId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ProductAttributeValue> AddAttributeValueAsync(ProductAttributeValue value, CancellationToken cancellationToken = default)
    {
        await Context.ProductAttributeValues.AddAsync(value, cancellationToken);
        return value;
    }

    public void UpdateAttributeValue(ProductAttributeValue value)
    {
        Context.ProductAttributeValues.Update(value);
    }

    public void RemoveAttributeValue(ProductAttributeValue value)
    {
        Context.ProductAttributeValues.Remove(value);
    }
}
