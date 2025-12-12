using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create Achievement ====================
public class CreateAchievementCommand : IRequest<Result<AchievementDto>>
{
    public CreateAchievementDto Data { get; set; } = null!;
}

public class CreateAchievementCommandValidator : AbstractValidator<CreateAchievementCommand>
{
    public CreateAchievementCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Achievement data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
            RuleFor(x => x.Data.Value).NotEmpty().WithMessage("Value is required").MaximumLength(50);
        });
    }
}

public class CreateAchievementCommandHandler : IRequestHandler<CreateAchievementCommand, Result<AchievementDto>>
{
    private readonly CMSDbContext _context;

    public CreateAchievementCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<AchievementDto>> Handle(CreateAchievementCommand request, CancellationToken cancellationToken)
    {
        var entity = new Achievement
        {
            Title = request.Data.Title,
            Value = request.Data.Value,
            Icon = request.Data.Icon,
            IconColor = request.Data.IconColor,
            Description = request.Data.Description,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.Achievements.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AchievementDto>.Success(MapToDto(entity));
    }

    private static AchievementDto MapToDto(Achievement e) => new(
        e.Id, e.Title, e.Value, e.Icon, e.IconColor, e.Description, e.SortOrder, e.IsActive, e.CreatedAt);
}

// ==================== Update Achievement ====================
public class UpdateAchievementCommand : IRequest<Result<AchievementDto>>
{
    public Guid Id { get; set; }
    public UpdateAchievementDto Data { get; set; } = null!;
}

public class UpdateAchievementCommandValidator : AbstractValidator<UpdateAchievementCommand>
{
    public UpdateAchievementCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Achievement data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
            RuleFor(x => x.Data.Value).NotEmpty().WithMessage("Value is required").MaximumLength(50);
        });
    }
}

public class UpdateAchievementCommandHandler : IRequestHandler<UpdateAchievementCommand, Result<AchievementDto>>
{
    private readonly CMSDbContext _context;

    public UpdateAchievementCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<AchievementDto>> Handle(UpdateAchievementCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Achievements.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<AchievementDto>.Failure(Error.NotFound("Achievement.NotFound", $"Achievement with ID {request.Id} not found"));

        entity.Title = request.Data.Title;
        entity.Value = request.Data.Value;
        entity.Icon = request.Data.Icon;
        entity.IconColor = request.Data.IconColor;
        entity.Description = request.Data.Description;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AchievementDto>.Success(new AchievementDto(
            entity.Id, entity.Title, entity.Value, entity.Icon, entity.IconColor, entity.Description, entity.SortOrder, entity.IsActive, entity.CreatedAt));
    }
}

// ==================== Delete Achievement ====================
public class DeleteAchievementCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteAchievementCommandValidator : AbstractValidator<DeleteAchievementCommand>
{
    public DeleteAchievementCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteAchievementCommandHandler : IRequestHandler<DeleteAchievementCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteAchievementCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteAchievementCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Achievements.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("Achievement.NotFound", $"Achievement with ID {request.Id} not found"));

        _context.Achievements.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
