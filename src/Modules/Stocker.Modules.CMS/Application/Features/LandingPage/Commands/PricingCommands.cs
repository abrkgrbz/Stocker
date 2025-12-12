using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create PricingPlan ====================
public class CreatePricingPlanCommand : IRequest<Result<PricingPlanDto>>
{
    public CreatePricingPlanDto Data { get; set; } = null!;
}

public class CreatePricingPlanCommandValidator : AbstractValidator<CreatePricingPlanCommand>
{
    public CreatePricingPlanCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Pricing plan data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
            RuleFor(x => x.Data.Price).GreaterThanOrEqualTo(0).WithMessage("Price cannot be negative");
        });
    }
}

public class CreatePricingPlanCommandHandler : IRequestHandler<CreatePricingPlanCommand, Result<PricingPlanDto>>
{
    private readonly CMSDbContext _context;

    public CreatePricingPlanCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<PricingPlanDto>> Handle(CreatePricingPlanCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Data.Slug ?? request.Data.Name.ToLower().Replace(" ", "-");

        if (await _context.PricingPlans.AnyAsync(x => x.Slug == slug, cancellationToken))
            return Result<PricingPlanDto>.Failure(Error.Conflict("PricingPlan.SlugExists", $"A pricing plan with slug '{slug}' already exists"));

        var entity = new PricingPlan
        {
            Name = request.Data.Name,
            Slug = slug,
            Description = request.Data.Description,
            Price = request.Data.Price,
            Currency = request.Data.Currency,
            BillingPeriod = request.Data.BillingPeriod,
            OriginalPrice = request.Data.OriginalPrice,
            Badge = request.Data.Badge,
            ButtonText = request.Data.ButtonText,
            ButtonUrl = request.Data.ButtonUrl,
            IsPopular = request.Data.IsPopular,
            IsActive = request.Data.IsActive,
            SortOrder = request.Data.SortOrder
        };

        _context.PricingPlans.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PricingPlanDto>.Success(MapToDto(entity));
    }

    private static PricingPlanDto MapToDto(PricingPlan e) => new(
        e.Id, e.Name, e.Slug, e.Description, e.Price, e.Currency, e.BillingPeriod,
        e.OriginalPrice, e.Badge, e.ButtonText, e.ButtonUrl, e.IsPopular, e.IsActive, e.SortOrder,
        e.Features?.Select(f => new PricingFeatureDto(f.Id, f.Name, f.Description, f.IsIncluded, f.Value, f.SortOrder, f.IsActive, f.PlanId)).ToList() ?? new(),
        e.CreatedAt);
}

// ==================== Update PricingPlan ====================
public class UpdatePricingPlanCommand : IRequest<Result<PricingPlanDto>>
{
    public Guid Id { get; set; }
    public UpdatePricingPlanDto Data { get; set; } = null!;
}

public class UpdatePricingPlanCommandValidator : AbstractValidator<UpdatePricingPlanCommand>
{
    public UpdatePricingPlanCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Pricing plan data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
            RuleFor(x => x.Data.Price).GreaterThanOrEqualTo(0).WithMessage("Price cannot be negative");
        });
    }
}

public class UpdatePricingPlanCommandHandler : IRequestHandler<UpdatePricingPlanCommand, Result<PricingPlanDto>>
{
    private readonly CMSDbContext _context;

    public UpdatePricingPlanCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<PricingPlanDto>> Handle(UpdatePricingPlanCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PricingPlans.Include(x => x.Features).FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<PricingPlanDto>.Failure(Error.NotFound("PricingPlan.NotFound", $"Pricing plan with ID {request.Id} not found"));

        var slug = request.Data.Slug ?? request.Data.Name.ToLower().Replace(" ", "-");
        if (await _context.PricingPlans.AnyAsync(x => x.Slug == slug && x.Id != request.Id, cancellationToken))
            return Result<PricingPlanDto>.Failure(Error.Conflict("PricingPlan.SlugExists", $"A pricing plan with slug '{slug}' already exists"));

        entity.Name = request.Data.Name;
        entity.Slug = slug;
        entity.Description = request.Data.Description;
        entity.Price = request.Data.Price;
        entity.Currency = request.Data.Currency;
        entity.BillingPeriod = request.Data.BillingPeriod;
        entity.OriginalPrice = request.Data.OriginalPrice;
        entity.Badge = request.Data.Badge;
        entity.ButtonText = request.Data.ButtonText;
        entity.ButtonUrl = request.Data.ButtonUrl;
        entity.IsPopular = request.Data.IsPopular;
        entity.IsActive = request.Data.IsActive;
        entity.SortOrder = request.Data.SortOrder;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<PricingPlanDto>.Success(new PricingPlanDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Price, entity.Currency, entity.BillingPeriod,
            entity.OriginalPrice, entity.Badge, entity.ButtonText, entity.ButtonUrl, entity.IsPopular, entity.IsActive, entity.SortOrder,
            entity.Features?.Select(f => new PricingFeatureDto(f.Id, f.Name, f.Description, f.IsIncluded, f.Value, f.SortOrder, f.IsActive, f.PlanId)).ToList() ?? new(),
            entity.CreatedAt));
    }
}

// ==================== Delete PricingPlan ====================
public class DeletePricingPlanCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeletePricingPlanCommandValidator : AbstractValidator<DeletePricingPlanCommand>
{
    public DeletePricingPlanCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeletePricingPlanCommandHandler : IRequestHandler<DeletePricingPlanCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeletePricingPlanCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeletePricingPlanCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PricingPlans.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("PricingPlan.NotFound", $"Pricing plan with ID {request.Id} not found"));

        _context.PricingPlans.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}

// ==================== Create PricingFeature ====================
public class CreatePricingFeatureCommand : IRequest<Result<PricingFeatureDto>>
{
    public CreatePricingFeatureDto Data { get; set; } = null!;
}

public class CreatePricingFeatureCommandValidator : AbstractValidator<CreatePricingFeatureCommand>
{
    public CreatePricingFeatureCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Pricing feature data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(200);
            RuleFor(x => x.Data.PlanId).NotEmpty().WithMessage("Plan ID is required");
        });
    }
}

public class CreatePricingFeatureCommandHandler : IRequestHandler<CreatePricingFeatureCommand, Result<PricingFeatureDto>>
{
    private readonly CMSDbContext _context;

    public CreatePricingFeatureCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<PricingFeatureDto>> Handle(CreatePricingFeatureCommand request, CancellationToken cancellationToken)
    {
        if (!await _context.PricingPlans.AnyAsync(x => x.Id == request.Data.PlanId, cancellationToken))
            return Result<PricingFeatureDto>.Failure(Error.NotFound("PricingPlan.NotFound", $"Pricing plan with ID {request.Data.PlanId} not found"));

        var entity = new PricingFeature
        {
            Name = request.Data.Name,
            Description = request.Data.Description,
            IsIncluded = request.Data.IsIncluded,
            Value = request.Data.Value,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive,
            PlanId = request.Data.PlanId
        };

        _context.PricingFeatures.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PricingFeatureDto>.Success(new PricingFeatureDto(
            entity.Id, entity.Name, entity.Description, entity.IsIncluded, entity.Value, entity.SortOrder, entity.IsActive, entity.PlanId));
    }
}

// ==================== Update PricingFeature ====================
public class UpdatePricingFeatureCommand : IRequest<Result<PricingFeatureDto>>
{
    public Guid Id { get; set; }
    public UpdatePricingFeatureDto Data { get; set; } = null!;
}

public class UpdatePricingFeatureCommandValidator : AbstractValidator<UpdatePricingFeatureCommand>
{
    public UpdatePricingFeatureCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Pricing feature data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(200);
        });
    }
}

public class UpdatePricingFeatureCommandHandler : IRequestHandler<UpdatePricingFeatureCommand, Result<PricingFeatureDto>>
{
    private readonly CMSDbContext _context;

    public UpdatePricingFeatureCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<PricingFeatureDto>> Handle(UpdatePricingFeatureCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PricingFeatures.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<PricingFeatureDto>.Failure(Error.NotFound("PricingFeature.NotFound", $"Pricing feature with ID {request.Id} not found"));

        entity.Name = request.Data.Name;
        entity.Description = request.Data.Description;
        entity.IsIncluded = request.Data.IsIncluded;
        entity.Value = request.Data.Value;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<PricingFeatureDto>.Success(new PricingFeatureDto(
            entity.Id, entity.Name, entity.Description, entity.IsIncluded, entity.Value, entity.SortOrder, entity.IsActive, entity.PlanId));
    }
}

// ==================== Delete PricingFeature ====================
public class DeletePricingFeatureCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeletePricingFeatureCommandValidator : AbstractValidator<DeletePricingFeatureCommand>
{
    public DeletePricingFeatureCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeletePricingFeatureCommandHandler : IRequestHandler<DeletePricingFeatureCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeletePricingFeatureCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeletePricingFeatureCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.PricingFeatures.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("PricingFeature.NotFound", $"Pricing feature with ID {request.Id} not found"));

        _context.PricingFeatures.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
