using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Discounts.Commands;
using Stocker.Modules.Sales.Application.Features.Discounts.Queries;
using Stocker.Modules.Sales.Application.Features.SalesOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Discounts.Handlers;

public class CreateDiscountHandler : IRequestHandler<CreateDiscountCommand, Result<DiscountDto>>
{
    private readonly SalesDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITenantService _tenantService;

    public CreateDiscountHandler(SalesDbContext context, IMapper mapper, ITenantService tenantService)
    {
        _context = context;
        _mapper = mapper;
        _tenantService = tenantService;
    }

    public async Task<Result<DiscountDto>> Handle(CreateDiscountCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<DiscountDto>.Failure(Error.Unauthorized("Tenant", "Tenant is required"));

        var existingDiscount = await _context.Discounts
            .AnyAsync(d => d.Code == request.Dto.Code.ToUpperInvariant(), cancellationToken);

        if (existingDiscount)
            return Result<DiscountDto>.Failure(Error.Conflict("Discount.Code", "Discount code already exists"));

        var discountResult = Discount.Create(
            tenantId.Value,
            request.Dto.Code,
            request.Dto.Name,
            request.Dto.Type,
            request.Dto.ValueType,
            request.Dto.Value,
            request.Dto.StartDate,
            request.Dto.EndDate,
            request.Dto.Description
        );

        if (!discountResult.IsSuccess)
            return Result<DiscountDto>.Failure(discountResult.Error);

        var discount = discountResult.Value;

        discount.SetLimits(
            request.Dto.MinimumOrderAmount,
            request.Dto.MaximumDiscountAmount,
            request.Dto.MinimumQuantity,
            request.Dto.UsageLimit
        );

        discount.SetStackable(request.Dto.IsStackable, request.Dto.Priority);

        var applicableProductIds = request.Dto.ApplicableProductIds != null
            ? string.Join(",", request.Dto.ApplicableProductIds)
            : null;
        var applicableCategoryIds = request.Dto.ApplicableCategoryIds != null
            ? string.Join(",", request.Dto.ApplicableCategoryIds)
            : null;
        var applicableCustomerIds = request.Dto.ApplicableCustomerIds != null
            ? string.Join(",", request.Dto.ApplicableCustomerIds)
            : null;
        var applicableCustomerGroupIds = request.Dto.ApplicableCustomerGroupIds != null
            ? string.Join(",", request.Dto.ApplicableCustomerGroupIds)
            : null;

        discount.SetApplicability(
            request.Dto.Applicability,
            applicableProductIds,
            applicableCategoryIds,
            applicableCustomerIds,
            applicableCustomerGroupIds
        );

        var excludedProductIds = request.Dto.ExcludedProductIds != null
            ? string.Join(",", request.Dto.ExcludedProductIds)
            : null;
        var excludedCategoryIds = request.Dto.ExcludedCategoryIds != null
            ? string.Join(",", request.Dto.ExcludedCategoryIds)
            : null;

        discount.SetExclusions(excludedProductIds, excludedCategoryIds);

        _context.Discounts.Add(discount);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DiscountDto>.Success(_mapper.Map<DiscountDto>(discount));
    }
}

public class GetDiscountByIdHandler : IRequestHandler<GetDiscountByIdQuery, Result<DiscountDto>>
{
    private readonly SalesDbContext _context;
    private readonly IMapper _mapper;

    public GetDiscountByIdHandler(SalesDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DiscountDto>> Handle(GetDiscountByIdQuery request, CancellationToken cancellationToken)
    {
        var discount = await _context.Discounts
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (discount == null)
            return Result<DiscountDto>.Failure(Error.NotFound("Discount", "Discount not found"));

        var dto = _mapper.Map<DiscountDto>(discount);
        return Result<DiscountDto>.Success(dto with { IsValid = discount.IsValid() });
    }
}

public class GetDiscountByCodeHandler : IRequestHandler<GetDiscountByCodeQuery, Result<DiscountDto>>
{
    private readonly SalesDbContext _context;
    private readonly IMapper _mapper;

    public GetDiscountByCodeHandler(SalesDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DiscountDto>> Handle(GetDiscountByCodeQuery request, CancellationToken cancellationToken)
    {
        var discount = await _context.Discounts
            .FirstOrDefaultAsync(d => d.Code == request.Code.ToUpperInvariant(), cancellationToken);

        if (discount == null)
            return Result<DiscountDto>.Failure(Error.NotFound("Discount", "Discount not found"));

        var dto = _mapper.Map<DiscountDto>(discount);
        return Result<DiscountDto>.Success(dto with { IsValid = discount.IsValid() });
    }
}

public class GetDiscountsHandler : IRequestHandler<GetDiscountsQuery, Result<PagedResult<DiscountListDto>>>
{
    private readonly SalesDbContext _context;

    public GetDiscountsHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<DiscountListDto>>> Handle(GetDiscountsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Discounts.AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(d =>
                d.Code.ToLower().Contains(searchTerm) ||
                d.Name.ToLower().Contains(searchTerm));
        }

        if (request.Type.HasValue)
            query = query.Where(d => d.Type == request.Type.Value);

        if (request.IsActive.HasValue)
            query = query.Where(d => d.IsActive == request.IsActive.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending ? query.OrderByDescending(d => d.Code) : query.OrderBy(d => d.Code),
            "name" => request.SortDescending ? query.OrderByDescending(d => d.Name) : query.OrderBy(d => d.Name),
            "value" => request.SortDescending ? query.OrderByDescending(d => d.Value) : query.OrderBy(d => d.Value),
            _ => request.SortDescending ? query.OrderByDescending(d => d.CreatedAt) : query.OrderBy(d => d.CreatedAt)
        };

        var discounts = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = discounts.Select(d => new DiscountListDto
        {
            Id = d.Id,
            Code = d.Code,
            Name = d.Name,
            Type = d.Type.ToString(),
            ValueType = d.ValueType.ToString(),
            Value = d.Value,
            StartDate = d.StartDate,
            EndDate = d.EndDate,
            IsActive = d.IsActive,
            UsageCount = d.UsageCount,
            UsageLimit = d.UsageLimit,
            IsValid = d.IsValid()
        }).ToList();

        return Result<PagedResult<DiscountListDto>>.Success(new PagedResult<DiscountListDto>
        {
            Items = items,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }
}

public class ValidateDiscountCodeHandler : IRequestHandler<ValidateDiscountCodeCommand, Result<DiscountCalculationResultDto>>
{
    private readonly SalesDbContext _context;

    public ValidateDiscountCodeHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DiscountCalculationResultDto>> Handle(ValidateDiscountCodeCommand request, CancellationToken cancellationToken)
    {
        var discount = await _context.Discounts
            .FirstOrDefaultAsync(d => d.Code == request.Code.ToUpperInvariant(), cancellationToken);

        if (discount == null)
            return Result<DiscountCalculationResultDto>.Success(new DiscountCalculationResultDto
            {
                IsValid = false,
                DiscountAmount = 0,
                ErrorMessage = "Discount code not found"
            });

        var calculationResult = discount.CalculateDiscount(request.OrderAmount, request.Quantity);

        if (!calculationResult.IsSuccess)
            return Result<DiscountCalculationResultDto>.Success(new DiscountCalculationResultDto
            {
                IsValid = false,
                DiscountAmount = 0,
                ErrorMessage = calculationResult.Error.Description
            });

        return Result<DiscountCalculationResultDto>.Success(new DiscountCalculationResultDto
        {
            IsValid = true,
            DiscountAmount = calculationResult.Value,
            ErrorMessage = null
        });
    }
}

public class ActivateDiscountHandler : IRequestHandler<ActivateDiscountCommand, Result<DiscountDto>>
{
    private readonly SalesDbContext _context;
    private readonly IMapper _mapper;

    public ActivateDiscountHandler(SalesDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DiscountDto>> Handle(ActivateDiscountCommand request, CancellationToken cancellationToken)
    {
        var discount = await _context.Discounts.FindAsync(new object[] { request.Id }, cancellationToken);

        if (discount == null)
            return Result<DiscountDto>.Failure(Error.NotFound("Discount", "Discount not found"));

        discount.Activate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DiscountDto>.Success(_mapper.Map<DiscountDto>(discount));
    }
}

public class DeactivateDiscountHandler : IRequestHandler<DeactivateDiscountCommand, Result<DiscountDto>>
{
    private readonly SalesDbContext _context;
    private readonly IMapper _mapper;

    public DeactivateDiscountHandler(SalesDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<DiscountDto>> Handle(DeactivateDiscountCommand request, CancellationToken cancellationToken)
    {
        var discount = await _context.Discounts.FindAsync(new object[] { request.Id }, cancellationToken);

        if (discount == null)
            return Result<DiscountDto>.Failure(Error.NotFound("Discount", "Discount not found"));

        discount.Deactivate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DiscountDto>.Success(_mapper.Map<DiscountDto>(discount));
    }
}

public class DeleteDiscountHandler : IRequestHandler<DeleteDiscountCommand, Result>
{
    private readonly SalesDbContext _context;

    public DeleteDiscountHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteDiscountCommand request, CancellationToken cancellationToken)
    {
        var discount = await _context.Discounts.FindAsync(new object[] { request.Id }, cancellationToken);

        if (discount == null)
            return Result.Failure(Error.NotFound("Discount", "Discount not found"));

        if (discount.UsageCount > 0)
            return Result.Failure(Error.Conflict("Discount.UsageCount", "Cannot delete discount that has been used"));

        _context.Discounts.Remove(discount);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
