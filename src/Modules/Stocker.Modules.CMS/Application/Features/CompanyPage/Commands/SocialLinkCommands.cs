using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Commands;

// ==================== Create SocialLink ====================
public class CreateSocialLinkCommand : IRequest<Result<SocialLinkDto>>
{
    public CreateSocialLinkDto Data { get; set; } = null!;
}

public class CreateSocialLinkCommandValidator : AbstractValidator<CreateSocialLinkCommand>
{
    public CreateSocialLinkCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Social link data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Platform).NotEmpty().WithMessage("Platform is required").MaximumLength(50);
            RuleFor(x => x.Data.Url).NotEmpty().WithMessage("URL is required").MaximumLength(500);
        });
    }
}

public class CreateSocialLinkCommandHandler : IRequestHandler<CreateSocialLinkCommand, Result<SocialLinkDto>>
{
    private readonly CMSDbContext _context;

    public CreateSocialLinkCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<SocialLinkDto>> Handle(CreateSocialLinkCommand request, CancellationToken cancellationToken)
    {
        var entity = new SocialLink
        {
            Platform = request.Data.Platform,
            Url = request.Data.Url,
            Icon = request.Data.Icon,
            Label = request.Data.Label,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.SocialLinks.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SocialLinkDto>.Success(MapToDto(entity));
    }

    private static SocialLinkDto MapToDto(SocialLink e) => new(
        e.Id, e.Platform, e.Url, e.Icon, e.Label, e.SortOrder, e.IsActive, e.CreatedAt);
}

// ==================== Update SocialLink ====================
public class UpdateSocialLinkCommand : IRequest<Result<SocialLinkDto>>
{
    public Guid Id { get; set; }
    public UpdateSocialLinkDto Data { get; set; } = null!;
}

public class UpdateSocialLinkCommandValidator : AbstractValidator<UpdateSocialLinkCommand>
{
    public UpdateSocialLinkCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Social link data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Platform).NotEmpty().WithMessage("Platform is required").MaximumLength(50);
            RuleFor(x => x.Data.Url).NotEmpty().WithMessage("URL is required").MaximumLength(500);
        });
    }
}

public class UpdateSocialLinkCommandHandler : IRequestHandler<UpdateSocialLinkCommand, Result<SocialLinkDto>>
{
    private readonly CMSDbContext _context;

    public UpdateSocialLinkCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<SocialLinkDto>> Handle(UpdateSocialLinkCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SocialLinks.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<SocialLinkDto>.Failure(Error.NotFound("SocialLink.NotFound", $"Social link with ID {request.Id} not found"));

        entity.Platform = request.Data.Platform;
        entity.Url = request.Data.Url;
        entity.Icon = request.Data.Icon;
        entity.Label = request.Data.Label;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<SocialLinkDto>.Success(new SocialLinkDto(
            entity.Id, entity.Platform, entity.Url, entity.Icon, entity.Label, entity.SortOrder, entity.IsActive, entity.CreatedAt));
    }
}

// ==================== Delete SocialLink ====================
public class DeleteSocialLinkCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteSocialLinkCommandValidator : AbstractValidator<DeleteSocialLinkCommand>
{
    public DeleteSocialLinkCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteSocialLinkCommandHandler : IRequestHandler<DeleteSocialLinkCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteSocialLinkCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteSocialLinkCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.SocialLinks.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("SocialLink.NotFound", $"Social link with ID {request.Id} not found"));

        _context.SocialLinks.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
