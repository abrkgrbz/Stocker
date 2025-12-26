using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CreditNotes.Commands;
using Stocker.Modules.Sales.Application.Features.CreditNotes.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Application.Features.CreditNotes.Handlers;

public class GetCreditNotesHandler : IRequestHandler<GetCreditNotesQuery, Result<PagedResult<CreditNoteListDto>>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetCreditNotesHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<PagedResult<CreditNoteListDto>>> Handle(GetCreditNotesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .Where(cn => cn.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(cn =>
                cn.CreditNoteNumber.ToLower().Contains(searchTerm) ||
                cn.CustomerName.ToLower().Contains(searchTerm) ||
                cn.InvoiceNumber.ToLower().Contains(searchTerm));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<CreditNoteStatus>(request.Status, true, out var status))
                query = query.Where(cn => cn.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.Type))
        {
            if (Enum.TryParse<CreditNoteType>(request.Type, true, out var type))
                query = query.Where(cn => cn.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            if (Enum.TryParse<CreditNoteReason>(request.Reason, true, out var reason))
                query = query.Where(cn => cn.Reason == reason);
        }

        if (request.CustomerId.HasValue)
            query = query.Where(cn => cn.CustomerId == request.CustomerId.Value);

        if (request.InvoiceId.HasValue)
            query = query.Where(cn => cn.InvoiceId == request.InvoiceId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(cn => cn.CreditNoteDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(cn => cn.CreditNoteDate <= request.ToDate.Value);

        if (request.IsApproved.HasValue)
            query = query.Where(cn => cn.IsApproved == request.IsApproved.Value);

        query = request.SortBy?.ToLower() switch
        {
            "creditnotenumber" => request.SortDescending
                ? query.OrderByDescending(cn => cn.CreditNoteNumber)
                : query.OrderBy(cn => cn.CreditNoteNumber),
            "customername" => request.SortDescending
                ? query.OrderByDescending(cn => cn.CustomerName)
                : query.OrderBy(cn => cn.CustomerName),
            "totalamount" => request.SortDescending
                ? query.OrderByDescending(cn => cn.TotalAmount)
                : query.OrderBy(cn => cn.TotalAmount),
            "status" => request.SortDescending
                ? query.OrderByDescending(cn => cn.Status)
                : query.OrderBy(cn => cn.Status),
            _ => request.SortDescending
                ? query.OrderByDescending(cn => cn.CreditNoteDate)
                : query.OrderBy(cn => cn.CreditNoteDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PagedResult<CreditNoteListDto>(
            items.Select(CreditNoteListDto.FromEntity),
            request.Page,
            request.PageSize,
            totalCount);

        return Result<PagedResult<CreditNoteListDto>>.Success(result);
    }
}

public class GetCreditNoteByIdHandler : IRequestHandler<GetCreditNoteByIdQuery, Result<CreditNoteDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetCreditNoteByIdHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<CreditNoteDto>> Handle(GetCreditNoteByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var creditNote = await _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .FirstOrDefaultAsync(cn => cn.Id == request.Id && cn.TenantId == tenantId, cancellationToken);

        if (creditNote == null)
            return Result<CreditNoteDto>.Failure(Error.NotFound("CreditNote", "Credit note not found"));

        return Result<CreditNoteDto>.Success(CreditNoteDto.FromEntity(creditNote));
    }
}

public class GetCreditNoteStatisticsHandler : IRequestHandler<GetCreditNoteStatisticsQuery, Result<CreditNoteStatisticsDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetCreditNoteStatisticsHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<CreditNoteStatisticsDto>> Handle(GetCreditNoteStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.CreditNotes
            .Where(cn => cn.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(cn => cn.CreditNoteDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(cn => cn.CreditNoteDate <= request.ToDate.Value);

        var creditNotes = await query.ToListAsync(cancellationToken);

        var stats = new CreditNoteStatisticsDto
        {
            TotalCreditNotes = creditNotes.Count,
            DraftCreditNotes = creditNotes.Count(cn => cn.Status == CreditNoteStatus.Draft),
            PendingApprovalCreditNotes = creditNotes.Count(cn => cn.Status == CreditNoteStatus.PendingApproval),
            ApprovedCreditNotes = creditNotes.Count(cn => cn.Status == CreditNoteStatus.Approved),
            IssuedCreditNotes = creditNotes.Count(cn => cn.Status == CreditNoteStatus.Issued),
            AppliedCreditNotes = creditNotes.Count(cn => cn.Status == CreditNoteStatus.PartiallyApplied || cn.Status == CreditNoteStatus.FullyApplied),
            TotalAmount = creditNotes.Where(cn => cn.Status != CreditNoteStatus.Voided).Sum(cn => cn.TotalAmount),
            AppliedAmount = creditNotes.Sum(cn => cn.AppliedAmount),
            RemainingAmount = creditNotes.Where(cn => cn.Status != CreditNoteStatus.Voided).Sum(cn => cn.RemainingAmount),
            Currency = "TRY"
        };

        return Result<CreditNoteStatisticsDto>.Success(stats);
    }
}

public class CreateCreditNoteHandler : IRequestHandler<CreateCreditNoteCommand, Result<CreditNoteDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CreateCreditNoteHandler> _logger;

    public CreateCreditNoteHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<CreateCreditNoteHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<CreditNoteDto>> Handle(CreateCreditNoteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var creditNoteNumber = await GenerateCreditNoteNumberAsync(tenantId, cancellationToken);

        var creditNoteResult = CreditNote.Create(
            tenantId,
            creditNoteNumber,
            request.CreditNoteDate,
            request.Type,
            request.Reason,
            request.InvoiceId,
            request.InvoiceNumber,
            request.Currency);

        if (!creditNoteResult.IsSuccess)
            return Result<CreditNoteDto>.Failure(creditNoteResult.Error);

        var creditNote = creditNoteResult.Value;

        creditNote.SetCustomer(request.CustomerId, request.CustomerName, request.CustomerTaxNumber, request.CustomerAddress);

        if (!string.IsNullOrEmpty(request.ReasonDescription))
            creditNote.SetReasonDescription(request.ReasonDescription);

        if (!string.IsNullOrEmpty(request.Notes))
            creditNote.SetNotes(request.Notes);

        var lineNumber = 1;
        foreach (var itemCmd in request.Items)
        {
            var itemResult = CreditNoteItem.Create(
                tenantId,
                creditNote.Id,
                lineNumber++,
                itemCmd.ProductId,
                itemCmd.ProductCode,
                itemCmd.ProductName,
                itemCmd.Quantity,
                itemCmd.Unit,
                itemCmd.UnitPrice,
                itemCmd.TaxRate);

            if (!itemResult.IsSuccess)
                return Result<CreditNoteDto>.Failure(itemResult.Error);

            var item = itemResult.Value;
            if (itemCmd.DiscountRate > 0)
                item.ApplyDiscount(itemCmd.DiscountRate);

            if (itemCmd.InvoiceItemId.HasValue)
                item.SetInvoiceItemReference(itemCmd.InvoiceItemId.Value);

            if (!string.IsNullOrEmpty(itemCmd.Description))
                item.SetDescription(itemCmd.Description);

            creditNote.AddItem(item);
        }

        await _dbContext.CreditNotes.AddAsync(creditNote, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Credit note {CreditNoteNumber} created for tenant {TenantId}", creditNoteNumber, tenantId);

        var savedCreditNote = await _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .FirstAsync(cn => cn.Id == creditNote.Id, cancellationToken);

        return Result<CreditNoteDto>.Success(CreditNoteDto.FromEntity(savedCreditNote));
    }

    private async Task<string> GenerateCreditNoteNumberAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var prefix = $"CN{today:yyyyMMdd}";

        var lastCreditNote = await _dbContext.CreditNotes
            .Where(cn => cn.TenantId == tenantId && cn.CreditNoteNumber.StartsWith(prefix))
            .OrderByDescending(cn => cn.CreditNoteNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastCreditNote != null)
        {
            var lastSequence = lastCreditNote.CreditNoteNumber.Substring(prefix.Length);
            if (int.TryParse(lastSequence, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}{sequence:D4}";
    }
}

public class SubmitCreditNoteHandler : IRequestHandler<SubmitCreditNoteCommand, Result<CreditNoteDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<SubmitCreditNoteHandler> _logger;

    public SubmitCreditNoteHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<SubmitCreditNoteHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<CreditNoteDto>> Handle(SubmitCreditNoteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var creditNote = await _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .FirstOrDefaultAsync(cn => cn.Id == request.Id && cn.TenantId == tenantId, cancellationToken);

        if (creditNote == null)
            return Result<CreditNoteDto>.Failure(Error.NotFound("CreditNote", "Credit note not found"));

        var result = creditNote.Submit();

        if (!result.IsSuccess)
            return Result<CreditNoteDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Credit note {CreditNoteId} submitted for approval", creditNote.Id);

        return Result<CreditNoteDto>.Success(CreditNoteDto.FromEntity(creditNote));
    }
}

public class ApproveCreditNoteHandler : IRequestHandler<ApproveCreditNoteCommand, Result<CreditNoteDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ApproveCreditNoteHandler> _logger;

    public ApproveCreditNoteHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<ApproveCreditNoteHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<CreditNoteDto>> Handle(ApproveCreditNoteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var creditNote = await _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .FirstOrDefaultAsync(cn => cn.Id == request.Id && cn.TenantId == tenantId, cancellationToken);

        if (creditNote == null)
            return Result<CreditNoteDto>.Failure(Error.NotFound("CreditNote", "Credit note not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var result = creditNote.Approve(userId);

        if (!result.IsSuccess)
            return Result<CreditNoteDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Credit note {CreditNoteId} approved", creditNote.Id);

        return Result<CreditNoteDto>.Success(CreditNoteDto.FromEntity(creditNote));
    }
}

public class IssueCreditNoteHandler : IRequestHandler<IssueCreditNoteCommand, Result<CreditNoteDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<IssueCreditNoteHandler> _logger;

    public IssueCreditNoteHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<IssueCreditNoteHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<CreditNoteDto>> Handle(IssueCreditNoteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var creditNote = await _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .FirstOrDefaultAsync(cn => cn.Id == request.Id && cn.TenantId == tenantId, cancellationToken);

        if (creditNote == null)
            return Result<CreditNoteDto>.Failure(Error.NotFound("CreditNote", "Credit note not found"));

        var result = creditNote.Issue();

        if (!result.IsSuccess)
            return Result<CreditNoteDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Credit note {CreditNoteId} issued", creditNote.Id);

        return Result<CreditNoteDto>.Success(CreditNoteDto.FromEntity(creditNote));
    }
}

public class VoidCreditNoteHandler : IRequestHandler<VoidCreditNoteCommand, Result<CreditNoteDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<VoidCreditNoteHandler> _logger;

    public VoidCreditNoteHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<VoidCreditNoteHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<CreditNoteDto>> Handle(VoidCreditNoteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var creditNote = await _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .FirstOrDefaultAsync(cn => cn.Id == request.Id && cn.TenantId == tenantId, cancellationToken);

        if (creditNote == null)
            return Result<CreditNoteDto>.Failure(Error.NotFound("CreditNote", "Credit note not found"));

        var result = creditNote.Void(request.Reason);

        if (!result.IsSuccess)
            return Result<CreditNoteDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Credit note {CreditNoteId} voided", creditNote.Id);

        return Result<CreditNoteDto>.Success(CreditNoteDto.FromEntity(creditNote));
    }
}

public class DeleteCreditNoteHandler : IRequestHandler<DeleteCreditNoteCommand, Result>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<DeleteCreditNoteHandler> _logger;

    public DeleteCreditNoteHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<DeleteCreditNoteHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteCreditNoteCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var creditNote = await _dbContext.CreditNotes
            .Include(cn => cn.Items)
            .FirstOrDefaultAsync(cn => cn.Id == request.Id && cn.TenantId == tenantId, cancellationToken);

        if (creditNote == null)
            return Result.Failure(Error.NotFound("CreditNote", "Credit note not found"));

        if (creditNote.Status != CreditNoteStatus.Draft && creditNote.Status != CreditNoteStatus.Voided)
            return Result.Failure(Error.Conflict("CreditNote", "Only draft or voided credit notes can be deleted"));

        _dbContext.CreditNotes.Remove(creditNote);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Credit note {CreditNoteId} deleted", creditNote.Id);

        return Result.Success();
    }
}
