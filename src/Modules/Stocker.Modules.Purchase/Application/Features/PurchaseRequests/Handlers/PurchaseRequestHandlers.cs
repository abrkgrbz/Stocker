using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Handlers;

public class CreatePurchaseRequestHandler : IRequestHandler<CreatePurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;

    public CreatePurchaseRequestHandler(
        PurchaseDbContext context,
        IMapper mapper,
        ITenantService tenantService,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(CreatePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<PurchaseRequestDto>.Failure(Error.Unauthorized("Tenant", "Tenant is required"));

        var requestNumber = $"PR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        var requestedById = _currentUserService.UserId ?? Guid.Empty;
        var requestedByName = _currentUserService.UserName;

        var purchaseRequest = PurchaseRequest.Create(
            requestNumber,
            requestedById,
            requestedByName,
            tenantId.Value,
            request.Dto.DepartmentId,
            request.Dto.DepartmentName,
            request.Dto.Purpose
        );

        if (request.Dto.RequiredDate.HasValue)
            purchaseRequest.SetRequiredDate(request.Dto.RequiredDate);

        purchaseRequest.SetPriority(request.Dto.Priority);

        int lineNumber = 1;
        foreach (var itemDto in request.Dto.Items)
        {
            var item = PurchaseRequestItem.Create(
                purchaseRequest.Id,
                itemDto.ProductId ?? Guid.Empty,
                itemDto.ProductCode,
                itemDto.ProductName,
                itemDto.Unit ?? "Adet",
                itemDto.Quantity,
                itemDto.EstimatedUnitPrice,
                lineNumber++,
                tenantId.Value
            );

            if (itemDto.PreferredSupplierId.HasValue)
                item.SetPreferredSupplier(itemDto.PreferredSupplierId, itemDto.PreferredSupplierName);

            purchaseRequest.AddItem(item);
        }

        _context.PurchaseRequests.Add(purchaseRequest);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

public class GetPurchaseRequestByIdHandler : IRequestHandler<GetPurchaseRequestByIdQuery, Result<PurchaseRequestDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public GetPurchaseRequestByIdHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(GetPurchaseRequestByIdQuery request, CancellationToken cancellationToken)
    {
        var purchaseRequest = await _context.PurchaseRequests
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

public class GetPurchaseRequestsHandler : IRequestHandler<GetPurchaseRequestsQuery, Result<PagedResult<PurchaseRequestListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetPurchaseRequestsHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<PurchaseRequestListDto>>> Handle(GetPurchaseRequestsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.PurchaseRequests
            .Include(pr => pr.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(pr =>
                pr.RequestNumber.ToLower().Contains(searchTerm) ||
                (pr.RequestedByName != null && pr.RequestedByName.ToLower().Contains(searchTerm)) ||
                (pr.DepartmentName != null && pr.DepartmentName.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(pr => pr.Status == request.Status.Value);

        if (request.Priority.HasValue)
            query = query.Where(pr => pr.Priority == request.Priority.Value);

        if (request.RequestedById.HasValue)
            query = query.Where(pr => pr.RequestedById == request.RequestedById.Value);

        if (request.DepartmentId.HasValue)
            query = query.Where(pr => pr.DepartmentId == request.DepartmentId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(pr => pr.RequestDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(pr => pr.RequestDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "requestnumber" => request.SortDescending ? query.OrderByDescending(pr => pr.RequestNumber) : query.OrderBy(pr => pr.RequestNumber),
            "requireddate" => request.SortDescending ? query.OrderByDescending(pr => pr.RequiredDate) : query.OrderBy(pr => pr.RequiredDate),
            "priority" => request.SortDescending ? query.OrderByDescending(pr => pr.Priority) : query.OrderBy(pr => pr.Priority),
            "status" => request.SortDescending ? query.OrderByDescending(pr => pr.Status) : query.OrderBy(pr => pr.Status),
            _ => request.SortDescending ? query.OrderByDescending(pr => pr.CreatedAt) : query.OrderBy(pr => pr.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(pr => new PurchaseRequestListDto
            {
                Id = pr.Id,
                RequestNumber = pr.RequestNumber,
                RequestDate = pr.RequestDate,
                RequiredDate = pr.RequiredDate,
                RequestedByName = pr.RequestedByName,
                DepartmentName = pr.DepartmentName,
                Status = pr.Status.ToString(),
                Priority = pr.Priority.ToString(),
                EstimatedTotalAmount = pr.EstimatedTotalAmount,
                Currency = pr.Currency,
                ItemCount = pr.Items.Count,
                CreatedAt = pr.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<PurchaseRequestListDto>>.Success(
            new PagedResult<PurchaseRequestListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class SubmitPurchaseRequestHandler : IRequestHandler<SubmitPurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public SubmitPurchaseRequestHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(SubmitPurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var purchaseRequest = await _context.PurchaseRequests
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        purchaseRequest.Submit();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

public class ApprovePurchaseRequestHandler : IRequestHandler<ApprovePurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApprovePurchaseRequestHandler(
        PurchaseDbContext context,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(ApprovePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var purchaseRequest = await _context.PurchaseRequests
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        var approvedById = _currentUserService.UserId ?? Guid.Empty;
        var approvedByName = _currentUserService.UserName;

        purchaseRequest.Approve(approvedById, approvedByName, request.Dto.ApprovalNotes);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

public class RejectPurchaseRequestHandler : IRequestHandler<RejectPurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public RejectPurchaseRequestHandler(PurchaseDbContext context, IMapper mapper, ICurrentUserService currentUserService)
    {
        _context = context;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(RejectPurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var purchaseRequest = await _context.PurchaseRequests
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        var rejectedById = _currentUserService.UserId ?? Guid.Empty;
        var rejectedByName = _currentUserService.UserName;

        purchaseRequest.Reject(rejectedById, rejectedByName, request.Dto.RejectionReason ?? "No reason provided");
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

public class DeletePurchaseRequestHandler : IRequestHandler<DeletePurchaseRequestCommand, Result>
{
    private readonly PurchaseDbContext _context;

    public DeletePurchaseRequestHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeletePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var purchaseRequest = await _context.PurchaseRequests
            .FirstOrDefaultAsync(pr => pr.Id == request.Id, cancellationToken);

        if (purchaseRequest == null)
            return Result.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        if (purchaseRequest.Status != PurchaseRequestStatus.Draft)
            return Result.Failure(Error.Conflict("PurchaseRequest.Status", "Only draft requests can be deleted"));

        _context.PurchaseRequests.Remove(purchaseRequest);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class GetPendingPurchaseRequestsHandler : IRequestHandler<GetPendingPurchaseRequestsQuery, Result<List<PurchaseRequestListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetPendingPurchaseRequestsHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<PurchaseRequestListDto>>> Handle(GetPendingPurchaseRequestsQuery request, CancellationToken cancellationToken)
    {
        var requests = await _context.PurchaseRequests
            .Include(pr => pr.Items)
            .Where(pr => pr.Status == PurchaseRequestStatus.Pending)
            .OrderBy(pr => pr.Priority)
            .ThenBy(pr => pr.RequiredDate)
            .Select(pr => new PurchaseRequestListDto
            {
                Id = pr.Id,
                RequestNumber = pr.RequestNumber,
                RequestDate = pr.RequestDate,
                RequiredDate = pr.RequiredDate,
                RequestedByName = pr.RequestedByName,
                DepartmentName = pr.DepartmentName,
                Status = pr.Status.ToString(),
                Priority = pr.Priority.ToString(),
                EstimatedTotalAmount = pr.EstimatedTotalAmount,
                Currency = pr.Currency,
                ItemCount = pr.Items.Count,
                CreatedAt = pr.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<PurchaseRequestListDto>>.Success(requests);
    }
}
