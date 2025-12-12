using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Commands;

// ==================== Create ContactInfo ====================
public class CreateContactInfoCommand : IRequest<Result<ContactInfoDto>>
{
    public CreateContactInfoDto Data { get; set; } = null!;
}

public class CreateContactInfoCommandValidator : AbstractValidator<CreateContactInfoCommand>
{
    public CreateContactInfoCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Contact info data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Type).NotEmpty().WithMessage("Type is required").MaximumLength(50);
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
            RuleFor(x => x.Data.Value).NotEmpty().WithMessage("Value is required").MaximumLength(500);
        });
    }
}

public class CreateContactInfoCommandHandler : IRequestHandler<CreateContactInfoCommand, Result<ContactInfoDto>>
{
    private readonly CMSDbContext _context;

    public CreateContactInfoCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<ContactInfoDto>> Handle(CreateContactInfoCommand request, CancellationToken cancellationToken)
    {
        var entity = new ContactInfo
        {
            Type = request.Data.Type,
            Title = request.Data.Title,
            Value = request.Data.Value,
            Icon = request.Data.Icon,
            IconColor = request.Data.IconColor,
            Href = request.Data.Href,
            AdditionalInfo = request.Data.AdditionalInfo,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.ContactInfos.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<ContactInfoDto>.Success(MapToDto(entity));
    }

    private static ContactInfoDto MapToDto(ContactInfo e) => new(
        e.Id, e.Type, e.Title, e.Value, e.Icon, e.IconColor, e.Href, e.AdditionalInfo, e.SortOrder, e.IsActive, e.CreatedAt);
}

// ==================== Update ContactInfo ====================
public class UpdateContactInfoCommand : IRequest<Result<ContactInfoDto>>
{
    public Guid Id { get; set; }
    public UpdateContactInfoDto Data { get; set; } = null!;
}

public class UpdateContactInfoCommandValidator : AbstractValidator<UpdateContactInfoCommand>
{
    public UpdateContactInfoCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Contact info data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Type).NotEmpty().WithMessage("Type is required").MaximumLength(50);
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
            RuleFor(x => x.Data.Value).NotEmpty().WithMessage("Value is required").MaximumLength(500);
        });
    }
}

public class UpdateContactInfoCommandHandler : IRequestHandler<UpdateContactInfoCommand, Result<ContactInfoDto>>
{
    private readonly CMSDbContext _context;

    public UpdateContactInfoCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<ContactInfoDto>> Handle(UpdateContactInfoCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ContactInfos.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<ContactInfoDto>.Failure(Error.NotFound("ContactInfo.NotFound", $"Contact info with ID {request.Id} not found"));

        entity.Type = request.Data.Type;
        entity.Title = request.Data.Title;
        entity.Value = request.Data.Value;
        entity.Icon = request.Data.Icon;
        entity.IconColor = request.Data.IconColor;
        entity.Href = request.Data.Href;
        entity.AdditionalInfo = request.Data.AdditionalInfo;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ContactInfoDto>.Success(new ContactInfoDto(
            entity.Id, entity.Type, entity.Title, entity.Value, entity.Icon, entity.IconColor, entity.Href, entity.AdditionalInfo, entity.SortOrder, entity.IsActive, entity.CreatedAt));
    }
}

// ==================== Delete ContactInfo ====================
public class DeleteContactInfoCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteContactInfoCommandValidator : AbstractValidator<DeleteContactInfoCommand>
{
    public DeleteContactInfoCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteContactInfoCommandHandler : IRequestHandler<DeleteContactInfoCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteContactInfoCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteContactInfoCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.ContactInfos.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("ContactInfo.NotFound", $"Contact info with ID {request.Id} not found"));

        _context.ContactInfos.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
