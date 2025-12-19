using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Commands;
using Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.PurchaseRequests.Handlers;

/// <summary>
/// Handler for CreatePurchaseRequestCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class CreatePurchaseRequestHandler : IRequestHandler<CreatePurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public CreatePurchaseRequestHandler(
        IPurchaseUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(CreatePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var requestNumber = $"PR-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..8].ToUpper()}";
        var requestedById = _currentUserService.UserId ?? Guid.Empty;
        var requestedByName = _currentUserService.UserName;

        var purchaseRequest = PurchaseRequest.Create(
            requestNumber,
            requestedById,
            requestedByName,
            tenantId,
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
                tenantId
            );

            if (itemDto.PreferredSupplierId.HasValue)
                item.SetPreferredSupplier(itemDto.PreferredSupplierId, itemDto.PreferredSupplierName);

            purchaseRequest.AddItem(item);
        }

        await _unitOfWork.Repository<PurchaseRequest>().AddAsync(purchaseRequest, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

/// <summary>
/// Handler for GetPurchaseRequestByIdQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetPurchaseRequestByIdHandler : IRequestHandler<GetPurchaseRequestByIdQuery, Result<PurchaseRequestDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetPurchaseRequestByIdHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(GetPurchaseRequestByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var purchaseRequest = await _unitOfWork.ReadRepository<PurchaseRequest>().AsQueryable()
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id && pr.TenantId == tenantId, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

/// <summary>
/// Handler for GetPurchaseRequestsQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetPurchaseRequestsHandler : IRequestHandler<GetPurchaseRequestsQuery, Result<PagedResult<PurchaseRequestListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetPurchaseRequestsHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<PurchaseRequestListDto>>> Handle(GetPurchaseRequestsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<PurchaseRequest>().AsQueryable()
            .Include(pr => pr.Items)
            .Where(pr => pr.TenantId == tenantId);

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

/// <summary>
/// Handler for SubmitPurchaseRequestCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class SubmitPurchaseRequestHandler : IRequestHandler<SubmitPurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SubmitPurchaseRequestHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(SubmitPurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var purchaseRequest = await _unitOfWork.ReadRepository<PurchaseRequest>().AsQueryable()
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id && pr.TenantId == tenantId, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        purchaseRequest.Submit();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

/// <summary>
/// Handler for ApprovePurchaseRequestCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class ApprovePurchaseRequestHandler : IRequestHandler<ApprovePurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApprovePurchaseRequestHandler(
        IPurchaseUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(ApprovePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var purchaseRequest = await _unitOfWork.ReadRepository<PurchaseRequest>().AsQueryable()
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id && pr.TenantId == tenantId, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        var approvedById = _currentUserService.UserId ?? Guid.Empty;
        var approvedByName = _currentUserService.UserName;

        purchaseRequest.Approve(approvedById, approvedByName, request.Dto.ApprovalNotes);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

/// <summary>
/// Handler for RejectPurchaseRequestCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class RejectPurchaseRequestHandler : IRequestHandler<RejectPurchaseRequestCommand, Result<PurchaseRequestDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public RejectPurchaseRequestHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<PurchaseRequestDto>> Handle(RejectPurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var purchaseRequest = await _unitOfWork.ReadRepository<PurchaseRequest>().AsQueryable()
            .Include(pr => pr.Items)
            .FirstOrDefaultAsync(pr => pr.Id == request.Id && pr.TenantId == tenantId, cancellationToken);

        if (purchaseRequest == null)
            return Result<PurchaseRequestDto>.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        var rejectedById = _currentUserService.UserId ?? Guid.Empty;
        var rejectedByName = _currentUserService.UserName;

        purchaseRequest.Reject(rejectedById, rejectedByName, request.Dto.RejectionReason ?? "No reason provided");
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<PurchaseRequestDto>.Success(_mapper.Map<PurchaseRequestDto>(purchaseRequest));
    }
}

/// <summary>
/// Handler for DeletePurchaseRequestCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class DeletePurchaseRequestHandler : IRequestHandler<DeletePurchaseRequestCommand, Result>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public DeletePurchaseRequestHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeletePurchaseRequestCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var purchaseRequest = await _unitOfWork.Repository<PurchaseRequest>().GetByIdAsync(request.Id, cancellationToken);

        if (purchaseRequest == null || purchaseRequest.TenantId != tenantId)
            return Result.Failure(Error.NotFound("PurchaseRequest", "Purchase request not found"));

        if (purchaseRequest.Status != PurchaseRequestStatus.Draft)
            return Result.Failure(Error.Conflict("PurchaseRequest.Status", "Only draft requests can be deleted"));

        _unitOfWork.Repository<PurchaseRequest>().Remove(purchaseRequest);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

/// <summary>
/// Handler for GetPendingPurchaseRequestsQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetPendingPurchaseRequestsHandler : IRequestHandler<GetPendingPurchaseRequestsQuery, Result<List<PurchaseRequestListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetPendingPurchaseRequestsHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<PurchaseRequestListDto>>> Handle(GetPendingPurchaseRequestsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var requests = await _unitOfWork.ReadRepository<PurchaseRequest>().AsQueryable()
            .Include(pr => pr.Items)
            .Where(pr => pr.TenantId == tenantId && pr.Status == PurchaseRequestStatus.Pending)
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
