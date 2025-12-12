using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create Integration ====================
public class CreateIntegrationCommand : IRequest<Result<IntegrationDto>>
{
    public CreateIntegrationDto Data { get; set; } = null!;
}

public class CreateIntegrationCommandValidator : AbstractValidator<CreateIntegrationCommand>
{
    public CreateIntegrationCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Integration data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        });
    }
}

public class CreateIntegrationCommandHandler : IRequestHandler<CreateIntegrationCommand, Result<IntegrationDto>>
{
    private readonly CMSDbContext _context;

    public CreateIntegrationCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<IntegrationDto>> Handle(CreateIntegrationCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Data.Slug ?? request.Data.Name.ToLower().Replace(" ", "-");

        if (await _context.Integrations.AnyAsync(x => x.Slug == slug, cancellationToken))
            return Result<IntegrationDto>.Failure(Error.Conflict("Integration.SlugExists", $"An integration with slug '{slug}' already exists"));

        var entity = new Integration
        {
            Name = request.Data.Name,
            Slug = slug,
            Description = request.Data.Description,
            Icon = request.Data.Icon,
            Color = request.Data.Color,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.Integrations.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<IntegrationDto>.Success(MapToDto(entity));
    }

    private static IntegrationDto MapToDto(Integration e) => new(
        e.Id, e.Name, e.Slug, e.Description, e.Icon, e.Color, e.SortOrder, e.IsActive,
        e.Items?.Select(i => new IntegrationItemDto(i.Id, i.Name, i.Description, i.Logo, i.Url, i.SortOrder, i.IsActive, i.IntegrationId)).ToList() ?? new(),
        e.CreatedAt);
}

// ==================== Update Integration ====================
public class UpdateIntegrationCommand : IRequest<Result<IntegrationDto>>
{
    public Guid Id { get; set; }
    public UpdateIntegrationDto Data { get; set; } = null!;
}

public class UpdateIntegrationCommandValidator : AbstractValidator<UpdateIntegrationCommand>
{
    public UpdateIntegrationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Integration data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        });
    }
}

public class UpdateIntegrationCommandHandler : IRequestHandler<UpdateIntegrationCommand, Result<IntegrationDto>>
{
    private readonly CMSDbContext _context;

    public UpdateIntegrationCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<IntegrationDto>> Handle(UpdateIntegrationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Integrations.Include(x => x.Items).FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<IntegrationDto>.Failure(Error.NotFound("Integration.NotFound", $"Integration with ID {request.Id} not found"));

        var slug = request.Data.Slug ?? request.Data.Name.ToLower().Replace(" ", "-");
        if (await _context.Integrations.AnyAsync(x => x.Slug == slug && x.Id != request.Id, cancellationToken))
            return Result<IntegrationDto>.Failure(Error.Conflict("Integration.SlugExists", $"An integration with slug '{slug}' already exists"));

        entity.Name = request.Data.Name;
        entity.Slug = slug;
        entity.Description = request.Data.Description;
        entity.Icon = request.Data.Icon;
        entity.Color = request.Data.Color;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<IntegrationDto>.Success(new IntegrationDto(
            entity.Id, entity.Name, entity.Slug, entity.Description, entity.Icon, entity.Color, entity.SortOrder, entity.IsActive,
            entity.Items?.Select(i => new IntegrationItemDto(i.Id, i.Name, i.Description, i.Logo, i.Url, i.SortOrder, i.IsActive, i.IntegrationId)).ToList() ?? new(),
            entity.CreatedAt));
    }
}

// ==================== Delete Integration ====================
public class DeleteIntegrationCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteIntegrationCommandValidator : AbstractValidator<DeleteIntegrationCommand>
{
    public DeleteIntegrationCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteIntegrationCommandHandler : IRequestHandler<DeleteIntegrationCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteIntegrationCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteIntegrationCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Integrations.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("Integration.NotFound", $"Integration with ID {request.Id} not found"));

        _context.Integrations.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}

// ==================== Create IntegrationItem ====================
public class CreateIntegrationItemCommand : IRequest<Result<IntegrationItemDto>>
{
    public CreateIntegrationItemDto Data { get; set; } = null!;
}

public class CreateIntegrationItemCommandValidator : AbstractValidator<CreateIntegrationItemCommand>
{
    public CreateIntegrationItemCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Integration item data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
            RuleFor(x => x.Data.IntegrationId).NotEmpty().WithMessage("Integration ID is required");
        });
    }
}

public class CreateIntegrationItemCommandHandler : IRequestHandler<CreateIntegrationItemCommand, Result<IntegrationItemDto>>
{
    private readonly CMSDbContext _context;

    public CreateIntegrationItemCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<IntegrationItemDto>> Handle(CreateIntegrationItemCommand request, CancellationToken cancellationToken)
    {
        if (!await _context.Integrations.AnyAsync(x => x.Id == request.Data.IntegrationId, cancellationToken))
            return Result<IntegrationItemDto>.Failure(Error.NotFound("Integration.NotFound", $"Integration with ID {request.Data.IntegrationId} not found"));

        var entity = new IntegrationItem
        {
            Name = request.Data.Name,
            Description = request.Data.Description,
            Logo = request.Data.Logo,
            Url = request.Data.Url,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive,
            IntegrationId = request.Data.IntegrationId
        };

        _context.IntegrationItems.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<IntegrationItemDto>.Success(new IntegrationItemDto(
            entity.Id, entity.Name, entity.Description, entity.Logo, entity.Url, entity.SortOrder, entity.IsActive, entity.IntegrationId));
    }
}

// ==================== Update IntegrationItem ====================
public class UpdateIntegrationItemCommand : IRequest<Result<IntegrationItemDto>>
{
    public Guid Id { get; set; }
    public UpdateIntegrationItemDto Data { get; set; } = null!;
}

public class UpdateIntegrationItemCommandValidator : AbstractValidator<UpdateIntegrationItemCommand>
{
    public UpdateIntegrationItemCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Integration item data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        });
    }
}

public class UpdateIntegrationItemCommandHandler : IRequestHandler<UpdateIntegrationItemCommand, Result<IntegrationItemDto>>
{
    private readonly CMSDbContext _context;

    public UpdateIntegrationItemCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<IntegrationItemDto>> Handle(UpdateIntegrationItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.IntegrationItems.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<IntegrationItemDto>.Failure(Error.NotFound("IntegrationItem.NotFound", $"Integration item with ID {request.Id} not found"));

        entity.Name = request.Data.Name;
        entity.Description = request.Data.Description;
        entity.Logo = request.Data.Logo;
        entity.Url = request.Data.Url;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<IntegrationItemDto>.Success(new IntegrationItemDto(
            entity.Id, entity.Name, entity.Description, entity.Logo, entity.Url, entity.SortOrder, entity.IsActive, entity.IntegrationId));
    }
}

// ==================== Delete IntegrationItem ====================
public class DeleteIntegrationItemCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteIntegrationItemCommandValidator : AbstractValidator<DeleteIntegrationItemCommand>
{
    public DeleteIntegrationItemCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteIntegrationItemCommandHandler : IRequestHandler<DeleteIntegrationItemCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteIntegrationItemCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteIntegrationItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.IntegrationItems.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("IntegrationItem.NotFound", $"Integration item with ID {request.Id} not found"));

        _context.IntegrationItems.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
