using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create Stat ====================
public class CreateStatCommand : IRequest<Result<StatDto>>
{
    public CreateStatDto Data { get; set; } = null!;
}

public class CreateStatCommandValidator : AbstractValidator<CreateStatCommand>
{
    public CreateStatCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Stat data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Label).NotEmpty().WithMessage("Label is required").MaximumLength(100);
            RuleFor(x => x.Data.Value).NotEmpty().WithMessage("Value is required").MaximumLength(50);
        });
    }
}

public class CreateStatCommandHandler : IRequestHandler<CreateStatCommand, Result<StatDto>>
{
    private readonly CMSDbContext _context;

    public CreateStatCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<StatDto>> Handle(CreateStatCommand request, CancellationToken cancellationToken)
    {
        var entity = new Stat
        {
            Label = request.Data.Label,
            Value = request.Data.Value,
            Suffix = request.Data.Suffix,
            Prefix = request.Data.Prefix,
            Icon = request.Data.Icon,
            Section = request.Data.Section,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.Stats.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<StatDto>.Success(MapToDto(entity));
    }

    private static StatDto MapToDto(Stat e) => new(
        e.Id, e.Label, e.Value, e.Suffix, e.Prefix, e.Icon, e.Section,
        e.SortOrder, e.IsActive, e.CreatedAt);
}

// ==================== Update Stat ====================
public class UpdateStatCommand : IRequest<Result<StatDto>>
{
    public Guid Id { get; set; }
    public UpdateStatDto Data { get; set; } = null!;
}

public class UpdateStatCommandValidator : AbstractValidator<UpdateStatCommand>
{
    public UpdateStatCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Stat data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Label).NotEmpty().WithMessage("Label is required").MaximumLength(100);
            RuleFor(x => x.Data.Value).NotEmpty().WithMessage("Value is required").MaximumLength(50);
        });
    }
}

public class UpdateStatCommandHandler : IRequestHandler<UpdateStatCommand, Result<StatDto>>
{
    private readonly CMSDbContext _context;

    public UpdateStatCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<StatDto>> Handle(UpdateStatCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Stats.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<StatDto>.Failure(Error.NotFound("Stat.NotFound", $"Stat with ID {request.Id} not found"));

        entity.Label = request.Data.Label;
        entity.Value = request.Data.Value;
        entity.Suffix = request.Data.Suffix;
        entity.Prefix = request.Data.Prefix;
        entity.Icon = request.Data.Icon;
        entity.Section = request.Data.Section;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<StatDto>.Success(new StatDto(
            entity.Id, entity.Label, entity.Value, entity.Suffix, entity.Prefix, entity.Icon, entity.Section,
            entity.SortOrder, entity.IsActive, entity.CreatedAt));
    }
}

// ==================== Delete Stat ====================
public class DeleteStatCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteStatCommandValidator : AbstractValidator<DeleteStatCommand>
{
    public DeleteStatCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteStatCommandHandler : IRequestHandler<DeleteStatCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteStatCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteStatCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Stats.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("Stat.NotFound", $"Stat with ID {request.Id} not found"));

        _context.Stats.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
