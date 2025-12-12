using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create Feature ====================
public class CreateFeatureCommand : IRequest<Result<FeatureDto>>
{
    public CreateFeatureDto Data { get; set; } = null!;
}

public class CreateFeatureCommandValidator : AbstractValidator<CreateFeatureCommand>
{
    public CreateFeatureCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Feature data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(200);
        });
    }
}

public class CreateFeatureCommandHandler : IRequestHandler<CreateFeatureCommand, Result<FeatureDto>>
{
    private readonly CMSDbContext _context;

    public CreateFeatureCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<FeatureDto>> Handle(CreateFeatureCommand request, CancellationToken cancellationToken)
    {
        var entity = new Feature
        {
            Title = request.Data.Title,
            Description = request.Data.Description,
            Icon = request.Data.Icon,
            IconColor = request.Data.IconColor,
            Image = request.Data.Image,
            Category = request.Data.Category,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive,
            IsFeatured = request.Data.IsFeatured
        };

        _context.Features.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<FeatureDto>.Success(MapToDto(entity));
    }

    private static FeatureDto MapToDto(Feature e) => new(
        e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.Image, e.Category,
        e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt);
}

// ==================== Update Feature ====================
public class UpdateFeatureCommand : IRequest<Result<FeatureDto>>
{
    public Guid Id { get; set; }
    public UpdateFeatureDto Data { get; set; } = null!;
}

public class UpdateFeatureCommandValidator : AbstractValidator<UpdateFeatureCommand>
{
    public UpdateFeatureCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Feature data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(200);
        });
    }
}

public class UpdateFeatureCommandHandler : IRequestHandler<UpdateFeatureCommand, Result<FeatureDto>>
{
    private readonly CMSDbContext _context;

    public UpdateFeatureCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<FeatureDto>> Handle(UpdateFeatureCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Features.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<FeatureDto>.Failure(Error.NotFound("Feature.NotFound", $"Feature with ID {request.Id} not found"));

        entity.Title = request.Data.Title;
        entity.Description = request.Data.Description;
        entity.Icon = request.Data.Icon;
        entity.IconColor = request.Data.IconColor;
        entity.Image = request.Data.Image;
        entity.Category = request.Data.Category;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.IsFeatured = request.Data.IsFeatured;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<FeatureDto>.Success(new FeatureDto(
            entity.Id, entity.Title, entity.Description, entity.Icon, entity.IconColor, entity.Image, entity.Category,
            entity.SortOrder, entity.IsActive, entity.IsFeatured, entity.CreatedAt));
    }
}

// ==================== Delete Feature ====================
public class DeleteFeatureCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteFeatureCommandValidator : AbstractValidator<DeleteFeatureCommand>
{
    public DeleteFeatureCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteFeatureCommandHandler : IRequestHandler<DeleteFeatureCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteFeatureCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteFeatureCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Features.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("Feature.NotFound", $"Feature with ID {request.Id} not found"));

        _context.Features.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
