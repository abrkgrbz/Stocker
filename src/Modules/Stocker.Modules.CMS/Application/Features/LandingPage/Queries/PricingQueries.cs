using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Pricing Plans ====================
public class GetPricingPlansQuery : IRequest<List<PricingPlanDto>>
{
}

public class GetPricingPlansQueryHandler : IRequestHandler<GetPricingPlansQuery, List<PricingPlanDto>>
{
    private readonly CMSDbContext _context;

    public GetPricingPlansQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<PricingPlanDto>> Handle(GetPricingPlansQuery request, CancellationToken cancellationToken)
    {
        return await _context.PricingPlans
            .Include(x => x.Features)
            .OrderBy(x => x.SortOrder)
            .Select(e => new PricingPlanDto(
                e.Id, e.Name, e.Slug, e.Description, e.Price, e.Currency, e.BillingPeriod,
                e.OriginalPrice, e.Badge, e.ButtonText, e.ButtonUrl, e.IsPopular, e.IsActive, e.SortOrder,
                e.Features.OrderBy(f => f.SortOrder).Select(f => new PricingFeatureDto(
                    f.Id, f.Name, f.Description, f.IsIncluded, f.Value, f.SortOrder, f.IsActive, f.PlanId)).ToList(),
                e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Pricing Plans ====================
public class GetActivePricingPlansQuery : IRequest<List<PricingPlanDto>>
{
}

public class GetActivePricingPlansQueryHandler : IRequestHandler<GetActivePricingPlansQuery, List<PricingPlanDto>>
{
    private readonly CMSDbContext _context;

    public GetActivePricingPlansQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<PricingPlanDto>> Handle(GetActivePricingPlansQuery request, CancellationToken cancellationToken)
    {
        return await _context.PricingPlans
            .Include(x => x.Features)
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new PricingPlanDto(
                e.Id, e.Name, e.Slug, e.Description, e.Price, e.Currency, e.BillingPeriod,
                e.OriginalPrice, e.Badge, e.ButtonText, e.ButtonUrl, e.IsPopular, e.IsActive, e.SortOrder,
                e.Features.Where(f => f.IsActive).OrderBy(f => f.SortOrder).Select(f => new PricingFeatureDto(
                    f.Id, f.Name, f.Description, f.IsIncluded, f.Value, f.SortOrder, f.IsActive, f.PlanId)).ToList(),
                e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Pricing Plan By ID ====================
public class GetPricingPlanByIdQuery : IRequest<PricingPlanDto?>
{
    public Guid Id { get; set; }
}

public class GetPricingPlanByIdQueryHandler : IRequestHandler<GetPricingPlanByIdQuery, PricingPlanDto?>
{
    private readonly CMSDbContext _context;

    public GetPricingPlanByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<PricingPlanDto?> Handle(GetPricingPlanByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.PricingPlans
            .Include(x => x.Features)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null) return null;

        return new PricingPlanDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Price, entity.Currency, entity.BillingPeriod,
            entity.OriginalPrice, entity.Badge, entity.ButtonText, entity.ButtonUrl, entity.IsPopular, entity.IsActive, entity.SortOrder,
            entity.Features.OrderBy(f => f.SortOrder).Select(f => new PricingFeatureDto(
                f.Id, f.Name, f.Description, f.IsIncluded, f.Value, f.SortOrder, f.IsActive, f.PlanId)).ToList(),
            entity.CreatedAt);
    }
}

// ==================== Get Pricing Plan By Slug ====================
public class GetPricingPlanBySlugQuery : IRequest<PricingPlanDto?>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetPricingPlanBySlugQueryHandler : IRequestHandler<GetPricingPlanBySlugQuery, PricingPlanDto?>
{
    private readonly CMSDbContext _context;

    public GetPricingPlanBySlugQueryHandler(CMSDbContext context) => _context = context;

    public async Task<PricingPlanDto?> Handle(GetPricingPlanBySlugQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.PricingPlans
            .Include(x => x.Features)
            .FirstOrDefaultAsync(x => x.Slug == request.Slug, cancellationToken);

        if (entity == null) return null;

        return new PricingPlanDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Price, entity.Currency, entity.BillingPeriod,
            entity.OriginalPrice, entity.Badge, entity.ButtonText, entity.ButtonUrl, entity.IsPopular, entity.IsActive, entity.SortOrder,
            entity.Features.OrderBy(f => f.SortOrder).Select(f => new PricingFeatureDto(
                f.Id, f.Name, f.Description, f.IsIncluded, f.Value, f.SortOrder, f.IsActive, f.PlanId)).ToList(),
            entity.CreatedAt);
    }
}

// ==================== Get Pricing Feature By ID ====================
public class GetPricingFeatureByIdQuery : IRequest<PricingFeatureDto?>
{
    public Guid Id { get; set; }
}

public class GetPricingFeatureByIdQueryHandler : IRequestHandler<GetPricingFeatureByIdQuery, PricingFeatureDto?>
{
    private readonly CMSDbContext _context;

    public GetPricingFeatureByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<PricingFeatureDto?> Handle(GetPricingFeatureByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.PricingFeatures.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new PricingFeatureDto(
            entity.Id, entity.Name, entity.Description, entity.IsIncluded, entity.Value, entity.SortOrder, entity.IsActive, entity.PlanId);
    }
}

// ==================== Get Pricing Features By Plan ====================
public class GetPricingFeaturesByPlanQuery : IRequest<List<PricingFeatureDto>>
{
    public Guid PlanId { get; set; }
}

public class GetPricingFeaturesByPlanQueryHandler : IRequestHandler<GetPricingFeaturesByPlanQuery, List<PricingFeatureDto>>
{
    private readonly CMSDbContext _context;

    public GetPricingFeaturesByPlanQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<PricingFeatureDto>> Handle(GetPricingFeaturesByPlanQuery request, CancellationToken cancellationToken)
    {
        return await _context.PricingFeatures
            .Where(x => x.PlanId == request.PlanId)
            .OrderBy(x => x.SortOrder)
            .Select(e => new PricingFeatureDto(
                e.Id, e.Name, e.Description, e.IsIncluded, e.Value, e.SortOrder, e.IsActive, e.PlanId))
            .ToListAsync(cancellationToken);
    }
}
