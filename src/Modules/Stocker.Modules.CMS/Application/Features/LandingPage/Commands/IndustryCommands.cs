using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create Industry ====================
public class CreateIndustryCommand : IRequest<Result<IndustryDto>>
{
    public CreateIndustryDto Data { get; set; } = null!;
}

public class CreateIndustryCommandValidator : AbstractValidator<CreateIndustryCommand>
{
    public CreateIndustryCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Industry data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        });
    }
}

public class CreateIndustryCommandHandler : IRequestHandler<CreateIndustryCommand, Result<IndustryDto>>
{
    private readonly CMSDbContext _context;

    public CreateIndustryCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<IndustryDto>> Handle(CreateIndustryCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Data.Slug ?? request.Data.Name.ToLower().Replace(" ", "-");

        if (await _context.Industries.AnyAsync(x => x.Slug == slug, cancellationToken))
            return Result<IndustryDto>.Failure(Error.Conflict("Industry.SlugExists", $"An industry with slug '{slug}' already exists"));

        var entity = new Industry
        {
            Name = request.Data.Name,
            Slug = slug,
            Description = request.Data.Description,
            Icon = request.Data.Icon,
            Image = request.Data.Image,
            Color = request.Data.Color,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.Industries.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<IndustryDto>.Success(MapToDto(entity));
    }

    private static IndustryDto MapToDto(Industry e) => new(
        e.Id, e.Name, e.Slug, e.Description, e.Icon, e.Image, e.Color,
        e.SortOrder, e.IsActive, e.CreatedAt);
}

// ==================== Update Industry ====================
public class UpdateIndustryCommand : IRequest<Result<IndustryDto>>
{
    public Guid Id { get; set; }
    public UpdateIndustryDto Data { get; set; } = null!;
}

public class UpdateIndustryCommandValidator : AbstractValidator<UpdateIndustryCommand>
{
    public UpdateIndustryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Industry data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        });
    }
}

public class UpdateIndustryCommandHandler : IRequestHandler<UpdateIndustryCommand, Result<IndustryDto>>
{
    private readonly CMSDbContext _context;

    public UpdateIndustryCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<IndustryDto>> Handle(UpdateIndustryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Industries.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<IndustryDto>.Failure(Error.NotFound("Industry.NotFound", $"Industry with ID {request.Id} not found"));

        var slug = request.Data.Slug ?? request.Data.Name.ToLower().Replace(" ", "-");
        if (await _context.Industries.AnyAsync(x => x.Slug == slug && x.Id != request.Id, cancellationToken))
            return Result<IndustryDto>.Failure(Error.Conflict("Industry.SlugExists", $"An industry with slug '{slug}' already exists"));

        entity.Name = request.Data.Name;
        entity.Slug = slug;
        entity.Description = request.Data.Description;
        entity.Icon = request.Data.Icon;
        entity.Image = request.Data.Image;
        entity.Color = request.Data.Color;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<IndustryDto>.Success(new IndustryDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Icon, entity.Image, entity.Color,
            entity.SortOrder, entity.IsActive, entity.CreatedAt));
    }
}

// ==================== Delete Industry ====================
public class DeleteIndustryCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteIndustryCommandValidator : AbstractValidator<DeleteIndustryCommand>
{
    public DeleteIndustryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteIndustryCommandHandler : IRequestHandler<DeleteIndustryCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteIndustryCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteIndustryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Industries.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("Industry.NotFound", $"Industry with ID {request.Id} not found"));

        _context.Industries.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
