using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Purchase.API.Controllers;

[ApiController]
[Route("api/purchase/[controller]")]
[Authorize]
public class PriceListsController : ControllerBase
{
    private readonly PurchaseDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public PriceListsController(
        PurchaseDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetPriceLists(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] PriceListStatus? status = null,
        [FromQuery] PriceListType? type = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = _context.PriceLists.Include(p => p.Items).AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
            query = query.Where(p => p.Code.Contains(searchTerm) || p.Name.Contains(searchTerm) || (p.SupplierName != null && p.SupplierName.Contains(searchTerm)));

        if (status.HasValue)
            query = query.Where(p => p.Status == status.Value);

        if (type.HasValue)
            query = query.Where(p => p.Type == type.Value);

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);

        query = sortBy?.ToLower() switch
        {
            "code" => sortDescending ? query.OrderByDescending(p => p.Code) : query.OrderBy(p => p.Code),
            "name" => sortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "supplier" => sortDescending ? query.OrderByDescending(p => p.SupplierName) : query.OrderBy(p => p.SupplierName),
            "effectivefrom" => sortDescending ? query.OrderByDescending(p => p.EffectiveFrom) : query.OrderBy(p => p.EffectiveFrom),
            _ => sortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
            .Select(p => new PriceListListDto
            {
                Id = p.Id,
                Code = p.Code,
                Name = p.Name,
                Status = p.Status.ToString(),
                Type = p.Type.ToString(),
                SupplierName = p.SupplierName,
                EffectiveFrom = p.EffectiveFrom,
                EffectiveTo = p.EffectiveTo,
                Currency = p.Currency,
                IsDefault = p.IsDefault,
                Version = p.Version,
                ItemCount = p.Items.Count,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPriceList(Guid id)
    {
        var priceList = await _context.PriceLists
            .Include(p => p.Items).ThenInclude(i => i.Tiers)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (priceList == null)
            return NotFound("Price list not found");

        return Ok(MapToDto(priceList));
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActivePriceLists([FromQuery] Guid? supplierId = null)
    {
        var query = _context.PriceLists
            .Where(p => p.Status == PriceListStatus.Active && p.EffectiveFrom <= DateTime.Today && (p.EffectiveTo == null || p.EffectiveTo >= DateTime.Today))
            .AsQueryable();

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);

        var priceLists = await query.Select(p => new PriceListListDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Status = p.Status.ToString(),
            Type = p.Type.ToString(),
            SupplierName = p.SupplierName,
            EffectiveFrom = p.EffectiveFrom,
            EffectiveTo = p.EffectiveTo,
            Currency = p.Currency,
            IsDefault = p.IsDefault,
            Version = p.Version,
            ItemCount = p.Items.Count,
            CreatedAt = p.CreatedAt
        }).ToListAsync();

        return Ok(priceLists);
    }

    [HttpGet("lookup")]
    public async Task<IActionResult> LookupPrice([FromQuery] Guid? supplierId, [FromQuery] Guid productId, [FromQuery] decimal quantity = 1, [FromQuery] DateTime? asOfDate = null)
    {
        var date = asOfDate ?? DateTime.Today;

        var query = _context.PriceLists
            .Include(p => p.Items).ThenInclude(i => i.Tiers)
            .Where(p => p.Status == PriceListStatus.Active && p.EffectiveFrom <= date && (p.EffectiveTo == null || p.EffectiveTo >= date))
            .AsQueryable();

        if (supplierId.HasValue)
            query = query.Where(p => p.SupplierId == supplierId.Value);
        else
            query = query.Where(p => p.IsDefault);

        var priceList = await query.OrderByDescending(p => p.IsDefault).ThenByDescending(p => p.Version).FirstOrDefaultAsync();

        if (priceList == null)
            return Ok(new PriceLookupResultDto { Found = false, Message = "No active price list found" });

        var price = priceList.GetPrice(productId, quantity);
        if (!price.HasValue)
            return Ok(new PriceLookupResultDto { Found = false, PriceListId = priceList.Id, PriceListCode = priceList.Code, PriceListName = priceList.Name, Message = "Product not found in price list" });

        var item = priceList.Items.FirstOrDefault(i => i.ProductId == productId);
        var tierApplied = item?.Tiers.FirstOrDefault(t => quantity >= t.MinQuantity && (!t.MaxQuantity.HasValue || quantity <= t.MaxQuantity.Value));

        return Ok(new PriceLookupResultDto
        {
            Found = true,
            PriceListId = priceList.Id,
            PriceListCode = priceList.Code,
            PriceListName = priceList.Name,
            BasePrice = item?.BasePrice,
            DiscountRate = item?.DiscountRate ?? tierApplied?.DiscountRate ?? 0,
            EffectivePrice = price.Value,
            TierApplied = tierApplied != null ? $"Tier {tierApplied.TierLevel}" : null,
            Currency = priceList.Currency,
            Message = "Price found"
        });
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var priceLists = await _context.PriceLists.Include(p => p.Items).ToListAsync();

        return Ok(new PriceListSummaryDto
        {
            TotalPriceLists = priceLists.Count,
            ActivePriceLists = priceLists.Count(p => p.Status == PriceListStatus.Active),
            DraftPriceLists = priceLists.Count(p => p.Status == PriceListStatus.Draft),
            ExpiredPriceLists = priceLists.Count(p => p.Status == PriceListStatus.Expired),
            TotalProducts = priceLists.SelectMany(p => p.Items).Select(i => i.ProductId).Distinct().Count(),
            PriceListsByStatus = priceLists.GroupBy(p => p.Status.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            PriceListsByType = priceLists.GroupBy(p => p.Type.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            PriceListsBySupplier = priceLists.Where(p => p.SupplierName != null).GroupBy(p => p.SupplierName!).ToDictionary(g => g.Key, g => g.Count())
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreatePriceList([FromBody] CreatePriceListDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var priceList = PriceList.Create(dto.Code, dto.Name, dto.EffectiveFrom, tenantId.Value, dto.Type, dto.Currency, dto.EffectiveTo, dto.SupplierId, dto.SupplierCode, dto.SupplierName);
        priceList.SetDescription(dto.Description);
        priceList.SetNotes(dto.Notes, dto.InternalNotes);

        if (dto.IsDefault)
            priceList.SetAsDefault();

        var currentUser = _currentUserService.GetCurrentUser();
        if (currentUser != null)
            priceList.SetCreator(currentUser.Id, currentUser.Name ?? currentUser.Email);

        foreach (var itemDto in dto.Items)
        {
            var item = PriceListItem.Create(priceList.Id, tenantId.Value, itemDto.ProductId, itemDto.ProductCode, itemDto.ProductName, itemDto.Unit, itemDto.BasePrice, itemDto.DiscountRate, dto.Currency, itemDto.MinQuantity, itemDto.MaxQuantity, itemDto.EffectiveFrom, itemDto.EffectiveTo, itemDto.Notes);

            var tierLevel = 1;
            foreach (var tierDto in itemDto.Tiers.OrderBy(t => t.MinQuantity))
            {
                var tier = PriceListItemTier.Create(item.Id, tenantId.Value, tierDto.MinQuantity, tierDto.MaxQuantity, tierDto.UnitPrice, tierDto.DiscountRate, tierLevel++);
                item.AddTier(tier);
            }

            priceList.AddItem(item);
        }

        _context.PriceLists.Add(priceList);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPriceList), new { id = priceList.Id }, MapToDto(priceList));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePriceList(Guid id, [FromBody] UpdatePriceListDto dto)
    {
        var priceList = await _context.PriceLists.FindAsync(id);
        if (priceList == null)
            return NotFound("Price list not found");

        if (dto.Name != null)
            priceList.Update(dto.Name, dto.EffectiveTo);

        if (dto.Description != null)
            priceList.SetDescription(dto.Description);

        priceList.SetNotes(dto.Notes ?? priceList.Notes, dto.InternalNotes ?? priceList.InternalNotes);

        if (dto.IsDefault == true && !priceList.IsDefault)
            priceList.SetAsDefault();

        await _context.SaveChangesAsync();
        return Ok(MapToDto(priceList));
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreatePriceListItemDto dto)
    {
        var priceList = await _context.PriceLists.Include(p => p.Items).FirstOrDefaultAsync(p => p.Id == id);
        if (priceList == null)
            return NotFound("Price list not found");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var item = PriceListItem.Create(priceList.Id, tenantId.Value, dto.ProductId, dto.ProductCode, dto.ProductName, dto.Unit, dto.BasePrice, dto.DiscountRate, priceList.Currency, dto.MinQuantity, dto.MaxQuantity, dto.EffectiveFrom, dto.EffectiveTo, dto.Notes);

        var tierLevel = 1;
        foreach (var tierDto in dto.Tiers.OrderBy(t => t.MinQuantity))
        {
            var tier = PriceListItemTier.Create(item.Id, tenantId.Value, tierDto.MinQuantity, tierDto.MaxQuantity, tierDto.UnitPrice, tierDto.DiscountRate, tierLevel++);
            item.AddTier(tier);
        }

        priceList.AddItem(item);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(priceList));
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var priceList = await _context.PriceLists.FindAsync(id);
        if (priceList == null)
            return NotFound("Price list not found");

        priceList.Activate();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(priceList));
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id)
    {
        var priceList = await _context.PriceLists.FindAsync(id);
        if (priceList == null)
            return NotFound("Price list not found");

        var currentUser = _currentUserService.GetCurrentUser();
        priceList.Approve(currentUser?.Id ?? Guid.Empty, currentUser?.Name ?? "System");
        await _context.SaveChangesAsync();
        return Ok(MapToDto(priceList));
    }

    [HttpPost("{id:guid}/expire")]
    public async Task<IActionResult> Expire(Guid id)
    {
        var priceList = await _context.PriceLists.FindAsync(id);
        if (priceList == null)
            return NotFound("Price list not found");

        priceList.Expire();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(priceList));
    }

    [HttpPost("{id:guid}/create-new-version")]
    public async Task<IActionResult> CreateNewVersion(Guid id)
    {
        var priceList = await _context.PriceLists.Include(p => p.Items).ThenInclude(i => i.Tiers).FirstOrDefaultAsync(p => p.Id == id);
        if (priceList == null)
            return NotFound("Price list not found");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var newVersion = priceList.CreateNewVersion(tenantId.Value);
        _context.PriceLists.Add(newVersion);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPriceList), new { id = newVersion.Id }, MapToDto(newVersion));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var priceList = await _context.PriceLists.FindAsync(id);
        if (priceList == null)
            return NotFound("Price list not found");

        if (priceList.Status != PriceListStatus.Draft)
            return BadRequest("Only draft price lists can be deleted");

        _context.PriceLists.Remove(priceList);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static PriceListDto MapToDto(PriceList p)
    {
        return new PriceListDto
        {
            Id = p.Id,
            Code = p.Code,
            Name = p.Name,
            Description = p.Description,
            Status = p.Status.ToString(),
            Type = p.Type.ToString(),
            SupplierId = p.SupplierId,
            SupplierCode = p.SupplierCode,
            SupplierName = p.SupplierName,
            EffectiveFrom = p.EffectiveFrom,
            EffectiveTo = p.EffectiveTo,
            Currency = p.Currency,
            IsDefault = p.IsDefault,
            Version = p.Version,
            PreviousVersionId = p.PreviousVersionId,
            CreatedById = p.CreatedById,
            CreatedByName = p.CreatedByName,
            ApprovedById = p.ApprovedById,
            ApprovedByName = p.ApprovedByName,
            ApprovalDate = p.ApprovalDate,
            Notes = p.Notes,
            InternalNotes = p.InternalNotes,
            CreatedAt = p.CreatedAt,
            UpdatedAt = p.UpdatedAt,
            Items = p.Items.Select(i => new PriceListItemDto
            {
                Id = i.Id,
                PriceListId = i.PriceListId,
                ProductId = i.ProductId,
                ProductCode = i.ProductCode,
                ProductName = i.ProductName,
                Unit = i.Unit,
                BasePrice = i.BasePrice,
                DiscountRate = i.DiscountRate,
                DiscountedPrice = i.DiscountedPrice,
                Currency = i.Currency,
                MinQuantity = i.MinQuantity,
                MaxQuantity = i.MaxQuantity,
                EffectiveFrom = i.EffectiveFrom,
                EffectiveTo = i.EffectiveTo,
                IsActive = i.IsActive,
                Notes = i.Notes,
                Tiers = i.Tiers.Select(t => new PriceListItemTierDto
                {
                    Id = t.Id,
                    PriceListItemId = t.PriceListItemId,
                    MinQuantity = t.MinQuantity,
                    MaxQuantity = t.MaxQuantity,
                    UnitPrice = t.UnitPrice,
                    DiscountRate = t.DiscountRate,
                    TierLevel = t.TierLevel
                }).ToList()
            }).ToList()
        };
    }
}
