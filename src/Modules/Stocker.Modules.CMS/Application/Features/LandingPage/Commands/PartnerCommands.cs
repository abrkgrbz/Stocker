using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create Partner ====================
public class CreatePartnerCommand : IRequest<Result<PartnerDto>>
{
    public CreatePartnerDto Data { get; set; } = null!;
}

public class CreatePartnerCommandValidator : AbstractValidator<CreatePartnerCommand>
{
    public CreatePartnerCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Partner data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        });
    }
}

public class CreatePartnerCommandHandler : IRequestHandler<CreatePartnerCommand, Result<PartnerDto>>
{
    private readonly CMSDbContext _context;

    public CreatePartnerCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<PartnerDto>> Handle(CreatePartnerCommand request, CancellationToken cancellationToken)
    {
        var entity = new Partner
        {
            Name = request.Data.Name,
            Logo = request.Data.Logo,
            LogoDark = request.Data.LogoDark,
            Url = request.Data.Url,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive,
            IsFeatured = request.Data.IsFeatured
        };

        _context.Partners.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<PartnerDto>.Success(MapToDto(entity));
    }

    private static PartnerDto MapToDto(Partner e) => new(
        e.Id, e.Name, e.Logo, e.LogoDark, e.Url, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt);
}

// ==================== Update Partner ====================
public class UpdatePartnerCommand : IRequest<Result<PartnerDto>>
{
    public Guid Id { get; set; }
    public UpdatePartnerDto Data { get; set; } = null!;
}

public class UpdatePartnerCommandValidator : AbstractValidator<UpdatePartnerCommand>
{
    public UpdatePartnerCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Partner data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
        });
    }
}

public class UpdatePartnerCommandHandler : IRequestHandler<UpdatePartnerCommand, Result<PartnerDto>>
{
    private readonly CMSDbContext _context;

    public UpdatePartnerCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<PartnerDto>> Handle(UpdatePartnerCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Partners.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<PartnerDto>.Failure(Error.NotFound("Partner.NotFound", $"Partner with ID {request.Id} not found"));

        entity.Name = request.Data.Name;
        entity.Logo = request.Data.Logo;
        entity.LogoDark = request.Data.LogoDark;
        entity.Url = request.Data.Url;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.IsFeatured = request.Data.IsFeatured;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<PartnerDto>.Success(new PartnerDto(
            entity.Id, entity.Name, entity.Logo, entity.LogoDark, entity.Url, entity.SortOrder, entity.IsActive, entity.IsFeatured, entity.CreatedAt));
    }
}

// ==================== Delete Partner ====================
public class DeletePartnerCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeletePartnerCommandValidator : AbstractValidator<DeletePartnerCommand>
{
    public DeletePartnerCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeletePartnerCommandHandler : IRequestHandler<DeletePartnerCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeletePartnerCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeletePartnerCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Partners.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("Partner.NotFound", $"Partner with ID {request.Id} not found"));

        _context.Partners.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
