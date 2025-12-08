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
public class QuotationsController : ControllerBase
{
    private readonly PurchaseDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public QuotationsController(
        PurchaseDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetQuotations(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? searchTerm = null,
        [FromQuery] QuotationStatus? status = null,
        [FromQuery] QuotationType? type = null,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] bool sortDescending = true)
    {
        var query = _context.Quotations
            .Include(q => q.Items)
            .Include(q => q.Suppliers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(q => q.QuotationNumber.Contains(searchTerm) ||
                                     (q.Title != null && q.Title.Contains(searchTerm)));
        }

        if (status.HasValue)
            query = query.Where(q => q.Status == status.Value);

        if (type.HasValue)
            query = query.Where(q => q.Type == type.Value);

        if (fromDate.HasValue)
            query = query.Where(q => q.QuotationDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(q => q.QuotationDate <= toDate.Value);

        query = sortBy?.ToLower() switch
        {
            "number" => sortDescending ? query.OrderByDescending(q => q.QuotationNumber) : query.OrderBy(q => q.QuotationNumber),
            "date" => sortDescending ? query.OrderByDescending(q => q.QuotationDate) : query.OrderBy(q => q.QuotationDate),
            "status" => sortDescending ? query.OrderByDescending(q => q.Status) : query.OrderBy(q => q.Status),
            _ => sortDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(q => new QuotationListDto
            {
                Id = q.Id,
                QuotationNumber = q.QuotationNumber,
                QuotationDate = q.QuotationDate,
                ValidUntil = q.ValidUntil,
                Title = q.Title,
                Status = q.Status.ToString(),
                Type = q.Type.ToString(),
                Priority = q.Priority.ToString(),
                SupplierCount = q.Suppliers.Count,
                ResponseCount = q.Suppliers.Count(s => s.ResponseStatus == QuotationResponseStatus.Received),
                ItemCount = q.Items.Count,
                SelectedSupplierName = q.SelectedSupplierName,
                CreatedAt = q.CreatedAt
            })
            .ToListAsync();

        return Ok(new { items, totalCount, page, pageSize });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetQuotation(Guid id)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Items)
            .Include(q => q.Suppliers)
                .ThenInclude(s => s.Items)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quotation == null)
            return NotFound("Quotation not found");

        var dto = MapToDto(quotation);
        return Ok(dto);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var query = _context.Quotations.AsQueryable();

        if (fromDate.HasValue)
            query = query.Where(q => q.QuotationDate >= fromDate.Value);

        if (toDate.HasValue)
            query = query.Where(q => q.QuotationDate <= toDate.Value);

        var quotations = await query.ToListAsync();

        var summary = new QuotationSummaryDto
        {
            TotalQuotations = quotations.Count,
            DraftQuotations = quotations.Count(q => q.Status == QuotationStatus.Draft),
            SentQuotations = quotations.Count(q => q.Status == QuotationStatus.Sent),
            QuotesReceived = quotations.Count(q => q.Status == QuotationStatus.QuotesReceived),
            SupplierSelected = quotations.Count(q => q.Status == QuotationStatus.SupplierSelected),
            Converted = quotations.Count(q => q.Status == QuotationStatus.Converted),
            Expired = quotations.Count(q => q.Status == QuotationStatus.Expired),
            QuotationsByStatus = quotations.GroupBy(q => q.Status.ToString())
                .ToDictionary(g => g.Key, g => g.Count()),
            QuotationsByType = quotations.GroupBy(q => q.Type.ToString())
                .ToDictionary(g => g.Key, g => g.Count())
        };

        return Ok(summary);
    }

    [HttpPost]
    public async Task<IActionResult> CreateQuotation([FromBody] CreateQuotationDto dto)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var quotationNumber = await GenerateQuotationNumber();

        var quotation = Quotation.Create(
            quotationNumber,
            dto.Type,
            dto.Priority,
            dto.ValidUntil,
            tenantId.Value,
            dto.Title,
            dto.Currency);

        if (dto.PurchaseRequestId.HasValue)
            quotation.LinkToPurchaseRequest(dto.PurchaseRequestId.Value, dto.PurchaseRequestNumber);

        if (dto.WarehouseId.HasValue)
            quotation.SetWarehouse(dto.WarehouseId.Value, dto.WarehouseName);

        quotation.SetNotes(dto.Notes, dto.InternalNotes, dto.Terms);

        var currentUser = _currentUserService.GetCurrentUser();
        if (currentUser != null)
            quotation.SetCreator(currentUser.Id, currentUser.Name ?? currentUser.Email);

        foreach (var itemDto in dto.Items)
        {
            var item = QuotationItem.Create(
                quotation.Id,
                tenantId.Value,
                itemDto.ProductId,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit,
                itemDto.Quantity,
                itemDto.Specifications,
                itemDto.Notes);
            quotation.AddItem(item);
        }

        foreach (var supplierDto in dto.Suppliers)
        {
            var supplier = QuotationSupplier.Create(
                quotation.Id,
                tenantId.Value,
                supplierDto.SupplierId,
                supplierDto.SupplierCode,
                supplierDto.SupplierName,
                supplierDto.ContactPerson,
                supplierDto.ContactEmail,
                supplierDto.ContactPhone,
                supplierDto.ResponseDeadline);
            quotation.AddSupplier(supplier);
        }

        _context.Quotations.Add(quotation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetQuotation), new { id = quotation.Id }, MapToDto(quotation));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateQuotation(Guid id, [FromBody] UpdateQuotationDto dto)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound("Quotation not found");

        if (dto.Title != null || dto.ValidUntil.HasValue || dto.Priority.HasValue)
        {
            quotation.Update(
                dto.Title ?? quotation.Title,
                dto.ValidUntil ?? quotation.ValidUntil,
                dto.Priority ?? quotation.Priority);
        }

        quotation.SetNotes(dto.Notes ?? quotation.Notes, dto.InternalNotes ?? quotation.InternalNotes, dto.Terms ?? quotation.Terms);

        await _context.SaveChangesAsync();
        return Ok(MapToDto(quotation));
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] CreateQuotationItemDto dto)
    {
        var quotation = await _context.Quotations.Include(q => q.Items).FirstOrDefaultAsync(q => q.Id == id);
        if (quotation == null)
            return NotFound("Quotation not found");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var item = QuotationItem.Create(
            quotation.Id,
            tenantId.Value,
            dto.ProductId,
            dto.ProductCode,
            dto.ProductName,
            dto.Unit,
            dto.Quantity,
            dto.Specifications,
            dto.Notes);

        quotation.AddItem(item);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(quotation));
    }

    [HttpPost("{id:guid}/suppliers")]
    public async Task<IActionResult> AddSupplier(Guid id, [FromBody] CreateQuotationSupplierDto dto)
    {
        var quotation = await _context.Quotations.Include(q => q.Suppliers).FirstOrDefaultAsync(q => q.Id == id);
        if (quotation == null)
            return NotFound("Quotation not found");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var supplier = QuotationSupplier.Create(
            quotation.Id,
            tenantId.Value,
            dto.SupplierId,
            dto.SupplierCode,
            dto.SupplierName,
            dto.ContactPerson,
            dto.ContactEmail,
            dto.ContactPhone,
            dto.ResponseDeadline);

        quotation.AddSupplier(supplier);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(quotation));
    }

    [HttpPost("{id:guid}/send")]
    public async Task<IActionResult> Send(Guid id)
    {
        var quotation = await _context.Quotations.Include(q => q.Suppliers).FirstOrDefaultAsync(q => q.Id == id);
        if (quotation == null)
            return NotFound("Quotation not found");

        quotation.Send();
        await _context.SaveChangesAsync();

        return Ok(MapToDto(quotation));
    }

    [HttpPost("{id:guid}/suppliers/{supplierId:guid}/response")]
    public async Task<IActionResult> SubmitResponse(Guid id, Guid supplierId, [FromBody] SubmitSupplierResponseDto dto)
    {
        var quotation = await _context.Quotations
            .Include(q => q.Items)
            .Include(q => q.Suppliers)
                .ThenInclude(s => s.Items)
            .FirstOrDefaultAsync(q => q.Id == id);

        if (quotation == null)
            return NotFound("Quotation not found");

        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return BadRequest("Tenant not found");

        var items = dto.Items.Select(i =>
        {
            var quotationItem = quotation.Items.FirstOrDefault(qi => qi.Id == i.QuotationItemId);
            return QuotationSupplierItem.Create(
                supplierId,
                i.QuotationItemId,
                tenantId.Value,
                quotationItem?.ProductId,
                quotationItem?.ProductCode,
                quotationItem?.ProductName,
                quotationItem?.Unit,
                quotationItem?.Quantity ?? 0,
                i.UnitPrice,
                i.DiscountRate,
                i.VatRate,
                quotation.Currency,
                i.LeadTimeDays,
                i.IsAvailable,
                i.Notes);
        }).ToList();

        quotation.ReceiveSupplierResponse(
            supplierId,
            dto.TotalAmount,
            dto.Currency,
            dto.DeliveryDays,
            dto.PaymentTerms,
            dto.ValidityDate,
            dto.SupplierNotes,
            items);

        await _context.SaveChangesAsync();

        return Ok(MapToDto(quotation));
    }

    [HttpPost("{id:guid}/select-supplier")]
    public async Task<IActionResult> SelectSupplier(Guid id, [FromBody] SelectSupplierDto dto)
    {
        var quotation = await _context.Quotations.Include(q => q.Suppliers).FirstOrDefaultAsync(q => q.Id == id);
        if (quotation == null)
            return NotFound("Quotation not found");

        var currentUser = _currentUserService.GetCurrentUser();
        quotation.SelectSupplier(
            dto.SupplierId,
            dto.SelectionReason,
            currentUser?.Id,
            currentUser?.Name ?? currentUser?.Email);

        await _context.SaveChangesAsync();

        return Ok(MapToDto(quotation));
    }

    [HttpPost("{id:guid}/convert-to-order")]
    public async Task<IActionResult> ConvertToOrder(Guid id)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound("Quotation not found");

        // Generate PO number
        var orderNumber = $"PO-{DateTime.Now:yyyyMMdd}-{Guid.NewGuid().ToString()[..4].ToUpper()}";
        quotation.ConvertToOrder(Guid.NewGuid(), orderNumber);

        await _context.SaveChangesAsync();

        return Ok(new { quotation.ConvertedPurchaseOrderId, quotation.ConvertedOrderNumber });
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] CancelQuotationRequest request)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound("Quotation not found");

        quotation.Cancel(request.Reason);
        await _context.SaveChangesAsync();

        return Ok(MapToDto(quotation));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var quotation = await _context.Quotations.FindAsync(id);
        if (quotation == null)
            return NotFound("Quotation not found");

        if (quotation.Status != QuotationStatus.Draft)
            return BadRequest("Only draft quotations can be deleted");

        _context.Quotations.Remove(quotation);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private async Task<string> GenerateQuotationNumber()
    {
        var today = DateTime.Today;
        var prefix = $"RFQ-{today:yyyyMMdd}";

        var lastNumber = await _context.Quotations
            .Where(q => q.QuotationNumber.StartsWith(prefix))
            .OrderByDescending(q => q.QuotationNumber)
            .Select(q => q.QuotationNumber)
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

    private static QuotationDto MapToDto(Quotation q)
    {
        return new QuotationDto
        {
            Id = q.Id,
            QuotationNumber = q.QuotationNumber,
            QuotationDate = q.QuotationDate,
            ValidUntil = q.ValidUntil,
            Title = q.Title,
            Status = q.Status.ToString(),
            Type = q.Type.ToString(),
            Priority = q.Priority.ToString(),
            PurchaseRequestId = q.PurchaseRequestId,
            PurchaseRequestNumber = q.PurchaseRequestNumber,
            WarehouseId = q.WarehouseId,
            WarehouseName = q.WarehouseName,
            Currency = q.Currency,
            Notes = q.Notes,
            InternalNotes = q.InternalNotes,
            Terms = q.Terms,
            SelectedSupplierId = q.SelectedSupplierId,
            SelectedSupplierName = q.SelectedSupplierName,
            SelectionReason = q.SelectionReason,
            SelectionDate = q.SelectionDate,
            ConvertedPurchaseOrderId = q.ConvertedPurchaseOrderId,
            ConvertedOrderNumber = q.ConvertedOrderNumber,
            CreatedById = q.CreatedById,
            CreatedByName = q.CreatedByName,
            CreatedAt = q.CreatedAt,
            UpdatedAt = q.UpdatedAt,
            Items = q.Items.Select(i => new QuotationItemDto
            {
                Id = i.Id,
                QuotationId = i.QuotationId,
                ProductId = i.ProductId,
                ProductCode = i.ProductCode,
                ProductName = i.ProductName,
                Unit = i.Unit,
                Quantity = i.Quantity,
                Specifications = i.Specifications,
                Notes = i.Notes,
                LineNumber = i.LineNumber
            }).ToList(),
            Suppliers = q.Suppliers.Select(s => new QuotationSupplierDto
            {
                Id = s.Id,
                QuotationId = s.QuotationId,
                SupplierId = s.SupplierId,
                SupplierCode = s.SupplierCode,
                SupplierName = s.SupplierName,
                ContactPerson = s.ContactPerson,
                ContactEmail = s.ContactEmail,
                ContactPhone = s.ContactPhone,
                SentDate = s.SentDate,
                ResponseDate = s.ResponseDate,
                ResponseDeadline = s.ResponseDeadline,
                ResponseStatus = s.ResponseStatus.ToString(),
                TotalAmount = s.TotalAmount,
                Currency = s.Currency,
                DeliveryDays = s.DeliveryDays,
                PaymentTerms = s.PaymentTerms,
                ValidityDate = s.ValidityDate,
                SupplierNotes = s.SupplierNotes,
                InternalEvaluation = s.InternalEvaluation,
                EvaluationScore = s.EvaluationScore,
                IsSelected = s.IsSelected,
                Items = s.Items.Select(si => new QuotationSupplierItemDto
                {
                    Id = si.Id,
                    QuotationSupplierId = si.QuotationSupplierId,
                    QuotationItemId = si.QuotationItemId,
                    ProductId = si.ProductId,
                    ProductCode = si.ProductCode,
                    ProductName = si.ProductName,
                    Unit = si.Unit,
                    Quantity = si.Quantity,
                    UnitPrice = si.UnitPrice,
                    DiscountRate = si.DiscountRate,
                    DiscountAmount = si.DiscountAmount,
                    VatRate = si.VatRate,
                    VatAmount = si.VatAmount,
                    TotalAmount = si.TotalAmount,
                    Currency = si.Currency,
                    LeadTimeDays = si.LeadTimeDays,
                    IsAvailable = si.IsAvailable,
                    Notes = si.Notes
                }).ToList()
            }).ToList()
        };
    }
}

public record CancelQuotationRequest(string Reason);
