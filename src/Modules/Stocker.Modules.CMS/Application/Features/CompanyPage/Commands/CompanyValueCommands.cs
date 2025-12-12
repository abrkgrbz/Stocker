using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Commands;

// ==================== Create CompanyValue ====================
public class CreateCompanyValueCommand : IRequest<Result<CompanyValueDto>>
{
    public CreateCompanyValueDto Data { get; set; } = null!;
}

public class CreateCompanyValueCommandValidator : AbstractValidator<CreateCompanyValueCommand>
{
    public CreateCompanyValueCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Company value data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
        });
    }
}

public class CreateCompanyValueCommandHandler : IRequestHandler<CreateCompanyValueCommand, Result<CompanyValueDto>>
{
    private readonly CMSDbContext _context;

    public CreateCompanyValueCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<CompanyValueDto>> Handle(CreateCompanyValueCommand request, CancellationToken cancellationToken)
    {
        var entity = new CompanyValue
        {
            Title = request.Data.Title,
            Description = request.Data.Description,
            Icon = request.Data.Icon,
            IconColor = request.Data.IconColor,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.CompanyValues.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CompanyValueDto>.Success(MapToDto(entity));
    }

    private static CompanyValueDto MapToDto(CompanyValue e) => new(
        e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.SortOrder, e.IsActive, e.CreatedAt);
}

// ==================== Update CompanyValue ====================
public class UpdateCompanyValueCommand : IRequest<Result<CompanyValueDto>>
{
    public Guid Id { get; set; }
    public UpdateCompanyValueDto Data { get; set; } = null!;
}

public class UpdateCompanyValueCommandValidator : AbstractValidator<UpdateCompanyValueCommand>
{
    public UpdateCompanyValueCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Company value data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
        });
    }
}

public class UpdateCompanyValueCommandHandler : IRequestHandler<UpdateCompanyValueCommand, Result<CompanyValueDto>>
{
    private readonly CMSDbContext _context;

    public UpdateCompanyValueCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<CompanyValueDto>> Handle(UpdateCompanyValueCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.CompanyValues.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<CompanyValueDto>.Failure(Error.NotFound("CompanyValue.NotFound", $"Company value with ID {request.Id} not found"));

        entity.Title = request.Data.Title;
        entity.Description = request.Data.Description;
        entity.Icon = request.Data.Icon;
        entity.IconColor = request.Data.IconColor;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<CompanyValueDto>.Success(new CompanyValueDto(
            entity.Id, entity.Title, entity.Description, entity.Icon, entity.IconColor, entity.SortOrder, entity.IsActive, entity.CreatedAt));
    }
}

// ==================== Delete CompanyValue ====================
public class DeleteCompanyValueCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteCompanyValueCommandValidator : AbstractValidator<DeleteCompanyValueCommand>
{
    public DeleteCompanyValueCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteCompanyValueCommandHandler : IRequestHandler<DeleteCompanyValueCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteCompanyValueCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteCompanyValueCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.CompanyValues.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("CompanyValue.NotFound", $"Company value with ID {request.Id} not found"));

        _context.CompanyValues.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
