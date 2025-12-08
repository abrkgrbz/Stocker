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
public class PurchaseContractsController : ControllerBase
{
    private readonly PurchaseDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public PurchaseContractsController(
        PurchaseDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetContracts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] PurchaseContractStatus? status = null,
        [FromQuery] PurchaseContractType? type = null,
        [FromQuery] Guid? supplierId = null,
        [FromQuery] bool? expiringWithin30Days = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = _context.PurchaseContracts
            .Include(c => c.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(c => c.ContractNumber.Contains(searchTerm) ||
                                     c.Title.Contains(searchTerm) ||
                                     c.SupplierName.Contains(searchTerm));
        }

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (type.HasValue)
            query = query.Where(c => c.Type == type.Value);

        if (supplierId.HasValue)
            query = query.Where(c => c.SupplierId == supplierId.Value);

        if (expiringWithin30Days == true)
        {
            var thirtyDaysFromNow = DateTime.Today.AddDays(30);
            query = query.Where(c => c.EndDate <= thirtyDaysFromNow && c.EndDate >= DateTime.Today && c.Status == PurchaseContractStatus.Active);
        }

        query = sortBy?.ToLower() switch
        {
            "number" => sortDescending ? query.OrderByDescending(c => c.ContractNumber) : query.OrderBy(c => c.ContractNumber),
            "title" => sortDescending ? query.OrderByDescending(c => c.Title) : query.OrderBy(c => c.Title),
            "supplier" => sortDescending ? query.OrderByDescending(c => c.SupplierName) : query.OrderBy(c => c.SupplierName),
            "enddate" => sortDescending ? query.OrderByDescending(c => c.EndDate) : query.OrderBy(c => c.EndDate),
            "value" => sortDescending ? query.OrderByDescending(c => c.TotalContractValue) : query.OrderBy(c => c.TotalContractValue),
            _ => sortDescending ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new PurchaseContractListDto
            {
                Id = c.Id,
                ContractNumber = c.ContractNumber,
                Title = c.Title,
                Status = c.Status.ToString(),
                Type = c.Type.ToString(),
                SupplierName = c.SupplierName,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                TotalContractValue = c.TotalContractValue,
                UsedAmount = c.UsedAmount,
                UsagePercentage = c.TotalContractValue.HasValue && c.TotalContractValue.Value > 0
                    ? c.UsedAmount / c.TotalContractValue.Value * 100 : 0,
                Currency = c.Currency,
                ItemCount = c.Items.Count,
                DaysRemaining = (c.EndDate - DateTime.Today).Days,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetContract(Guid id)
    {
        var contract = await _context.PurchaseContracts
            .Include(c => c.Items)
                .ThenInclude(i => i.PriceBreaks)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (contract == null)
            return NotFound("Contract not found");

        return Ok(MapToDto(contract));
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActiveContracts([FromQuery] Guid? supplierId = null)
    {
        var query = _context.PurchaseContracts
            .Where(c => c.Status == PurchaseContractStatus.Active)
            .AsQueryable();

        if (supplierId.HasValue)
            query = query.Where(c => c.SupplierId == supplierId.Value);

        var contracts = await query
            .Select(c => new PurchaseContractListDto
            {
                Id = c.Id,
                ContractNumber = c.ContractNumber,
                Title = c.Title,
                Status = c.Status.ToString(),
                Type = c.Type.ToString(),
                SupplierName = c.SupplierName,
                StartDate = c.StartDate,
                EndDate = c.EndDate,
                TotalContractValue = c.TotalContractValue,
                UsedAmount = c.UsedAmount,
                Currency = c.Currency,
                ItemCount = c.Items.Count,
                DaysRemaining = (c.EndDate - DateTime.Today).Days,
                CreatedAt = c.CreatedAt
            })
            .ToListAsync();

        return Ok(contracts);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var contracts = await _context.PurchaseContracts.ToListAsync();
        var thirtyDaysFromNow = DateTime.Today.AddDays(30);

        var summary = new PurchaseContractSummaryDto
        {
            TotalContracts = contracts.Count,
            ActiveContracts = contracts.Count(c => c.Status == PurchaseContractStatus.Active),
            ExpiringWithin30Days = contracts.Count(c => c.EndDate <= thirtyDaysFromNow && c.EndDate >= DateTime.Today && c.Status == PurchaseContractStatus.Active),
            ExpiredContracts = contracts.Count(c => c.Status == PurchaseContractStatus.Expired),
            TotalContractValue = contracts.Where(c => c.TotalContractValue.HasValue).Sum(c => c.TotalContractValue!.Value),
            TotalUsedAmount = contracts.Sum(c => c.UsedAmount),
            OverallUsagePercentage = contracts.Where(c => c.TotalContractValue.HasValue && c.TotalContractValue.Value > 0).Sum(c => c.TotalContractValue!.Value) > 0
                ? contracts.Sum(c => c.UsedAmount) / contracts.Where(c => c.TotalContractValue.HasValue && c.TotalContractValue.Value > 0).Sum(c => c.TotalContractValue!.Value) * 100 : 0,
            ContractsByStatus = contracts.GroupBy(c => c.Status.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            ContractsByType = contracts.GroupBy(c => c.Type.ToString()).ToDictionary(g => g.Key, g => g.Count()),
            ValueBySupplier = contracts.GroupBy(c => c.SupplierName).ToDictionary(g => g.Key, g => g.Where(c => c.TotalContractValue.HasValue).Sum(c => c.TotalContractValue!.Value))
        };

        return Ok(summary);
    }

    [HttpGet("check-price")]
    public async Task<IActionResult> CheckContractPrice([FromQuery] Guid supplierId, [FromQuery] Guid productId, [FromQuery] decimal quantity)
    {
        var contract = await _context.PurchaseContracts
            .Include(c => c.Items)
                .ThenInclude(i => i.PriceBreaks)
            .Where(c => c.SupplierId == supplierId && c.Status == PurchaseContractStatus.Active)
            .FirstOrDefaultAsync();

        if (contract == null)
            return Ok(new ContractPriceResultDto { HasContract = false, Message = "No active contract found for this supplier" });

        var item = contract.Items.FirstOrDefault(i => i.ProductId == productId && i.IsActive);
        if (item == null)
            return Ok(new ContractPriceResultDto { HasContract = true, ContractId = contract.Id, ContractNumber = contract.ContractNumber, Message = "Product not found in contract" });

        var effectivePrice = item.GetEffectivePrice(quantity);
        var isWithinLimits = item.IsWithinLimits(quantity);

        return Ok(new ContractPriceResultDto
        {
            HasContract = true,
            ContractId = contract.Id,
            ContractNumber = contract.ContractNumber,
            UnitPrice = item.UnitPrice,
            DiscountRate = item.DiscountRate,
            EffectivePrice = effectivePrice,
            IsWithinLimits = isWithinLimits,
            Message = isWithinLimits ? "Contract price available" : "Quantity outside contract limits"
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateContract([FromBody] CreatePurchaseContractDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var contractNumber = await GenerateContractNumber();

        var contract = PurchaseContract.Create(
            contractNumber,
            dto.Title,
            dto.SupplierId,
            dto.SupplierCode,
            dto.SupplierName,
            dto.StartDate,
            dto.EndDate,
            tenantId.Value,
            dto.Type,
            dto.Currency);

        contract.SetContractValue(dto.TotalContractValue, dto.MinimumOrderValue, dto.MaximumOrderValue);
        contract.SetTerms(dto.DeliveryTerms, dto.PaymentTerms, dto.QualityTerms, dto.PenaltyTerms, dto.OtherTerms, dto.WarrantyPeriodMonths);
        contract.SetAutoRenewal(dto.AutoRenew, dto.RenewalNoticeDays);
        contract.SetNotes(dto.Description, dto.Notes, dto.InternalNotes);

        var currentUser = _currentUserService.GetCurrentUser();
        if (currentUser != null)
            contract.SetCreator(currentUser.Id, currentUser.Name ?? currentUser.Email);

        foreach (var itemDto in dto.Items)
        {
            var item = PurchaseContractItem.Create(
                contract.Id,
                tenantId.Value,
                itemDto.ProductId,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit,
                itemDto.UnitPrice,
                itemDto.Currency ?? dto.Currency,
                itemDto.DiscountRate,
                itemDto.VatRate,
                itemDto.ContractedQuantity,
                itemDto.MinOrderQuantity,
                itemDto.MaxOrderQuantity,
                itemDto.EffectiveFrom,
                itemDto.EffectiveTo,
                itemDto.LeadTimeDays,
                itemDto.Specifications,
                itemDto.Notes);

            foreach (var pbDto in itemDto.PriceBreaks)
            {
                var priceBreak = PurchaseContractPriceBreak.Create(
                    item.Id,
                    tenantId.Value,
                    pbDto.MinQuantity,
                    pbDto.MaxQuantity,
                    pbDto.UnitPrice,
                    pbDto.DiscountRate);
                item.AddPriceBreak(priceBreak);
            }

            contract.AddItem(item);
        }

        _context.PurchaseContracts.Add(contract);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContract), new { id = contract.Id }, MapToDto(contract));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateContract(Guid id, [FromBody] UpdatePurchaseContractDto dto)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        if (dto.Title != null)
            contract.Update(dto.Title, dto.Description, dto.EndDate);

        if (dto.TotalContractValue.HasValue || dto.MinimumOrderValue.HasValue || dto.MaximumOrderValue.HasValue)
            contract.SetContractValue(dto.TotalContractValue ?? contract.TotalContractValue, dto.MinimumOrderValue ?? contract.MinimumOrderValue, dto.MaximumOrderValue ?? contract.MaximumOrderValue);

        if (dto.DeliveryTerms != null || dto.PaymentTerms != null)
            contract.SetTerms(dto.DeliveryTerms ?? contract.DeliveryTerms, dto.PaymentTerms ?? contract.PaymentTerms, dto.QualityTerms ?? contract.QualityTerms, dto.PenaltyTerms ?? contract.PenaltyTerms, dto.OtherTerms ?? contract.OtherTerms, dto.WarrantyPeriodMonths ?? contract.WarrantyPeriodMonths);

        if (dto.AutoRenew.HasValue)
            contract.SetAutoRenewal(dto.AutoRenew.Value, dto.RenewalNoticeDays ?? contract.RenewalNoticeDays);

        contract.SetNotes(null, dto.Notes ?? contract.Notes, dto.InternalNotes ?? contract.InternalNotes);

        await _context.SaveChangesAsync();
        return Ok(MapToDto(contract));
    }

    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        contract.Submit();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(contract));
    }

    [HttpPost("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, [FromBody] ApproveContractRequest? request = null)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        var currentUser = _currentUserService.GetCurrentUser();
        contract.Approve(currentUser?.Id ?? Guid.Empty, currentUser?.Name ?? "System", request?.Notes);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(contract));
    }

    [HttpPost("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] RejectContractRequest request)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        contract.Reject(request.Reason);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(contract));
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        contract.Activate();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(contract));
    }

    [HttpPost("{id:guid}/suspend")]
    public async Task<IActionResult> Suspend(Guid id)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        contract.Suspend();
        await _context.SaveChangesAsync();
        return Ok(MapToDto(contract));
    }

    [HttpPost("{id:guid}/terminate")]
    public async Task<IActionResult> Terminate(Guid id, [FromBody] TerminateContractRequest request)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        contract.Terminate(request.Reason);
        await _context.SaveChangesAsync();
        return Ok(MapToDto(contract));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var contract = await _context.PurchaseContracts.FindAsync(id);
        if (contract == null)
            return NotFound("Contract not found");

        if (contract.Status != PurchaseContractStatus.Draft)
            return BadRequest("Only draft contracts can be deleted");

        _context.PurchaseContracts.Remove(contract);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private async Task<string> GenerateContractNumber()
    {
        var today = DateTime.Today;
        var prefix = $"CNT-{today:yyyyMM}";

        var lastNumber = await _context.PurchaseContracts
            .Where(c => c.ContractNumber.StartsWith(prefix))
            .OrderByDescending(c => c.ContractNumber)
            .Select(c => c.ContractNumber)
            .FirstOrDefaultAsync();

        var sequence = 1;
        if (!string.IsNullOrEmpty(lastNumber))
        {
            var parts = lastNumber.Split('-');
            if (parts.Length > 2 && int.TryParse(parts[^1], out var lastSeq))
                sequence = lastSeq + 1;
        }

        return $"{prefix}-{sequence:D4}";
    }

    private static PurchaseContractDto MapToDto(PurchaseContract c)
    {
        return new PurchaseContractDto
        {
            Id = c.Id,
            ContractNumber = c.ContractNumber,
            Title = c.Title,
            Description = c.Description,
            Status = c.Status.ToString(),
            Type = c.Type.ToString(),
            SupplierId = c.SupplierId,
            SupplierCode = c.SupplierCode,
            SupplierName = c.SupplierName,
            StartDate = c.StartDate,
            EndDate = c.EndDate,
            TotalContractValue = c.TotalContractValue,
            UsedAmount = c.UsedAmount,
            RemainingAmount = c.RemainingAmount,
            Currency = c.Currency,
            MinimumOrderValue = c.MinimumOrderValue,
            MaximumOrderValue = c.MaximumOrderValue,
            DeliveryTerms = c.DeliveryTerms,
            PaymentTerms = c.PaymentTerms,
            QualityTerms = c.QualityTerms,
            PenaltyTerms = c.PenaltyTerms,
            OtherTerms = c.OtherTerms,
            AutoRenew = c.AutoRenew,
            RenewalNoticeDays = c.RenewalNoticeDays,
            WarrantyPeriodMonths = c.WarrantyPeriodMonths,
            CreatedById = c.CreatedById,
            CreatedByName = c.CreatedByName,
            ApprovedById = c.ApprovedById,
            ApprovedByName = c.ApprovedByName,
            ApprovalDate = c.ApprovalDate,
            ApprovalNotes = c.ApprovalNotes,
            Notes = c.Notes,
            InternalNotes = c.InternalNotes,
            CreatedAt = c.CreatedAt,
            UpdatedAt = c.UpdatedAt,
            Items = c.Items.Select(i => new PurchaseContractItemDto
            {
                Id = i.Id,
                ContractId = i.ContractId,
                ProductId = i.ProductId,
                ProductCode = i.ProductCode,
                ProductName = i.ProductName,
                Unit = i.Unit,
                ContractedQuantity = i.ContractedQuantity,
                UsedQuantity = i.UsedQuantity,
                RemainingQuantity = i.RemainingQuantity,
                MinOrderQuantity = i.MinOrderQuantity,
                MaxOrderQuantity = i.MaxOrderQuantity,
                UnitPrice = i.UnitPrice,
                Currency = i.Currency,
                DiscountRate = i.DiscountRate,
                VatRate = i.VatRate,
                EffectiveFrom = i.EffectiveFrom,
                EffectiveTo = i.EffectiveTo,
                LeadTimeDays = i.LeadTimeDays,
                Specifications = i.Specifications,
                Notes = i.Notes,
                IsActive = i.IsActive,
                PriceBreaks = i.PriceBreaks.Select(pb => new PurchaseContractPriceBreakDto
                {
                    Id = pb.Id,
                    ContractItemId = pb.ContractItemId,
                    MinQuantity = pb.MinQuantity,
                    MaxQuantity = pb.MaxQuantity,
                    UnitPrice = pb.UnitPrice,
                    DiscountRate = pb.DiscountRate
                }).ToList()
            }).ToList()
        };
    }
}

public record ApproveContractRequest(string? Notes);
public record RejectContractRequest(string Reason);
public record TerminateContractRequest(string Reason);
