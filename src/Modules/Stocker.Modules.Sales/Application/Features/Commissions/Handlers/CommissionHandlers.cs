using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Commissions.Commands;
using Stocker.Modules.Sales.Application.Features.Commissions.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Commissions.Handlers;

/// <summary>
/// Handler for CreateCommissionPlanCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CreateCommissionPlanHandler : IRequestHandler<CreateCommissionPlanCommand, Result<CommissionPlanDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateCommissionPlanHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<CommissionPlanDto>> Handle(CreateCommissionPlanCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var planResult = CommissionPlan.Create(
            tenantId,
            request.Dto.Name,
            request.Dto.Type,
            request.Dto.CalculationType,
            request.Dto.BaseRate,
            request.Dto.BaseAmount,
            request.Dto.Description
        );

        if (!planResult.IsSuccess)
            return Result<CommissionPlanDto>.Failure(planResult.Error);

        var plan = planResult.Value;

        plan.SetDateRange(request.Dto.StartDate, request.Dto.EndDate);
        plan.SetCalculationOptions(
            request.Dto.IncludeVat,
            request.Dto.CalculateOnProfit,
            request.Dto.MinimumSaleAmount,
            request.Dto.MaximumCommissionAmount
        );

        if (request.Dto.ApplicableProductCategories != null)
            plan.SetApplicability(
                string.Join(",", request.Dto.ApplicableProductCategories),
                request.Dto.ApplicableProducts != null ? string.Join(",", request.Dto.ApplicableProducts) : null,
                request.Dto.ExcludedProducts != null ? string.Join(",", request.Dto.ExcludedProducts) : null
            );

        if (request.Dto.ApplicableSalesPersons != null || request.Dto.ApplicableRoles != null)
            plan.SetSalesPersonApplicability(
                request.Dto.ApplicableSalesPersons != null ? string.Join(",", request.Dto.ApplicableSalesPersons) : null,
                request.Dto.ApplicableRoles != null ? string.Join(",", request.Dto.ApplicableRoles) : null
            );

        if (request.Dto.Tiers != null)
        {
            foreach (var tierDto in request.Dto.Tiers)
            {
                var tier = CommissionTier.Create(
                    tierDto.FromAmount,
                    tierDto.ToAmount,
                    tierDto.CalculationType,
                    tierDto.Rate,
                    tierDto.FixedAmount,
                    tierDto.Name
                );
                tier.SetCommissionPlanId(plan.Id);
                plan.AddTier(tier);
            }
        }

        await _unitOfWork.Repository<CommissionPlan>().AddAsync(plan, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CommissionPlanDto>.Success(_mapper.Map<CommissionPlanDto>(plan));
    }
}

/// <summary>
/// Handler for GetCommissionPlanByIdQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetCommissionPlanByIdHandler : IRequestHandler<GetCommissionPlanByIdQuery, Result<CommissionPlanDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetCommissionPlanByIdHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<CommissionPlanDto>> Handle(GetCommissionPlanByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.ReadRepository<CommissionPlan>().AsQueryable()
            .Include(p => p.Tiers)
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == tenantId, cancellationToken);

        if (plan == null)
            return Result<CommissionPlanDto>.Failure(Error.NotFound("CommissionPlan", "Commission plan not found"));

        return Result<CommissionPlanDto>.Success(_mapper.Map<CommissionPlanDto>(plan));
    }
}

/// <summary>
/// Handler for GetCommissionPlansQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetCommissionPlansHandler : IRequestHandler<GetCommissionPlansQuery, Result<PagedResult<CommissionPlanListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetCommissionPlansHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CommissionPlanListDto>>> Handle(GetCommissionPlansQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<CommissionPlan>().AsQueryable()
            .Include(p => p.Tiers)
            .Where(p => p.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(p => p.Name.ToLower().Contains(searchTerm));
        }

        if (request.Type.HasValue)
            query = query.Where(p => p.Type == request.Type.Value);

        if (request.IsActive.HasValue)
            query = query.Where(p => p.IsActive == request.IsActive.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "name" => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "type" => request.SortDescending ? query.OrderByDescending(p => p.Type) : query.OrderBy(p => p.Type),
            _ => request.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new CommissionPlanListDto
            {
                Id = p.Id,
                Name = p.Name,
                Type = p.Type.ToString(),
                CalculationType = p.CalculationType.ToString(),
                BaseRate = p.BaseRate,
                BaseAmount = p.BaseAmount,
                IsActive = p.IsActive,
                IsTiered = p.IsTiered,
                TierCount = p.Tiers.Count,
                CreatedAt = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<CommissionPlanListDto>>.Success(new PagedResult<CommissionPlanListDto>(
            items,
            request.Page,
            request.PageSize,
            totalCount));
    }
}

/// <summary>
/// Handler for CalculateSalesCommissionCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CalculateSalesCommissionHandler : IRequestHandler<CalculateSalesCommissionCommand, Result<SalesCommissionDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CalculateSalesCommissionHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SalesCommissionDto>> Handle(CalculateSalesCommissionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var plan = await _unitOfWork.ReadRepository<CommissionPlan>().AsQueryable()
            .Include(p => p.Tiers)
            .FirstOrDefaultAsync(p => p.Id == request.Dto.CommissionPlanId && p.TenantId == tenantId, cancellationToken);

        if (plan == null)
            return Result<SalesCommissionDto>.Failure(Error.NotFound("CommissionPlan", "Commission plan not found"));

        var calculationResult = plan.CalculateCommission(request.Dto.SaleAmount, request.Dto.ProfitAmount);

        if (!calculationResult.IsSuccess)
            return Result<SalesCommissionDto>.Failure(calculationResult.Error);

        var commissionRate = plan.BaseRate ?? 0;
        if (plan.CalculationType == CommissionCalculationType.Percentage && request.Dto.SaleAmount > 0)
        {
            commissionRate = (calculationResult.Value / request.Dto.SaleAmount) * 100;
        }

        var commissionResult = SalesCommission.Create(
            tenantId,
            request.Dto.SalesOrderId,
            request.Dto.SalesPersonId,
            request.Dto.SalesPersonName,
            plan.Id,
            plan.Name,
            request.Dto.SaleAmount,
            calculationResult.Value,
            commissionRate
        );

        if (!commissionResult.IsSuccess)
            return Result<SalesCommissionDto>.Failure(commissionResult.Error);

        await _unitOfWork.Repository<SalesCommission>().AddAsync(commissionResult.Value, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesCommissionDto>.Success(_mapper.Map<SalesCommissionDto>(commissionResult.Value));
    }
}

/// <summary>
/// Handler for ApproveSalesCommissionCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class ApproveSalesCommissionHandler : IRequestHandler<ApproveSalesCommissionCommand, Result<SalesCommissionDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApproveSalesCommissionHandler(ISalesUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<SalesCommissionDto>> Handle(ApproveSalesCommissionCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var commission = await _unitOfWork.Repository<SalesCommission>().GetByIdAsync(request.Id, cancellationToken);

        if (commission == null || commission.TenantId != tenantId)
            return Result<SalesCommissionDto>.Failure(Error.NotFound("SalesCommission", "Sales commission not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var result = commission.Approve(userId);

        if (!result.IsSuccess)
            return Result<SalesCommissionDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesCommissionDto>.Success(_mapper.Map<SalesCommissionDto>(commission));
    }
}

/// <summary>
/// Handler for MarkCommissionAsPaidCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class MarkCommissionAsPaidHandler : IRequestHandler<MarkCommissionAsPaidCommand, Result<SalesCommissionDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MarkCommissionAsPaidHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SalesCommissionDto>> Handle(MarkCommissionAsPaidCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var commission = await _unitOfWork.Repository<SalesCommission>().GetByIdAsync(request.Id, cancellationToken);

        if (commission == null || commission.TenantId != tenantId)
            return Result<SalesCommissionDto>.Failure(Error.NotFound("SalesCommission", "Sales commission not found"));

        var result = commission.MarkAsPaid(request.PaymentReference);

        if (!result.IsSuccess)
            return Result<SalesCommissionDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesCommissionDto>.Success(_mapper.Map<SalesCommissionDto>(commission));
    }
}

/// <summary>
/// Handler for GetCommissionSummaryQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetCommissionSummaryHandler : IRequestHandler<GetCommissionSummaryQuery, Result<List<CommissionSummaryDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetCommissionSummaryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CommissionSummaryDto>>> Handle(GetCommissionSummaryQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<SalesCommission>().AsQueryable()
            .Where(c => c.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(c => c.CalculatedDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(c => c.CalculatedDate <= request.ToDate.Value);

        var summary = await query
            .GroupBy(c => new { c.SalesPersonId, c.SalesPersonName })
            .Select(g => new CommissionSummaryDto
            {
                SalesPersonId = g.Key.SalesPersonId,
                SalesPersonName = g.Key.SalesPersonName,
                TotalSales = g.Sum(c => c.SaleAmount),
                TotalCommission = g.Sum(c => c.CommissionAmount),
                PendingCommission = g.Where(c => c.Status == SalesCommissionStatus.Pending).Sum(c => c.CommissionAmount),
                ApprovedCommission = g.Where(c => c.Status == SalesCommissionStatus.Approved).Sum(c => c.CommissionAmount),
                PaidCommission = g.Where(c => c.Status == SalesCommissionStatus.Paid).Sum(c => c.CommissionAmount),
                OrderCount = g.Count(),
                LastSaleDate = g.Max(c => c.CalculatedDate)
            })
            .OrderByDescending(s => s.TotalCommission)
            .ToListAsync(cancellationToken);

        return Result<List<CommissionSummaryDto>>.Success(summary);
    }
}
