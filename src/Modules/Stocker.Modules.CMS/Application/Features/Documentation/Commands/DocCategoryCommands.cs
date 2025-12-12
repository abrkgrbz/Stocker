using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.Documentation.Commands;

// ==================== Create DocCategory ====================
public class CreateDocCategoryCommand : IRequest<Result<DocCategoryDto>>
{
    public CreateDocCategoryDto Data { get; set; } = null!;
}

public class CreateDocCategoryCommandValidator : AbstractValidator<CreateDocCategoryCommand>
{
    public CreateDocCategoryCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Doc category data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
            RuleFor(x => x.Data.Slug).NotEmpty().WithMessage("Slug is required").MaximumLength(100);
        });
    }
}

public class CreateDocCategoryCommandHandler : IRequestHandler<CreateDocCategoryCommand, Result<DocCategoryDto>>
{
    private readonly CMSDbContext _context;

    public CreateDocCategoryCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<DocCategoryDto>> Handle(CreateDocCategoryCommand request, CancellationToken cancellationToken)
    {
        if (await _context.DocCategories.AnyAsync(x => x.Slug == request.Data.Slug, cancellationToken))
            return Result<DocCategoryDto>.Failure(Error.Conflict("DocCategory.SlugExists", $"A doc category with slug '{request.Data.Slug}' already exists"));

        var entity = new DocCategory
        {
            Title = request.Data.Title,
            Slug = request.Data.Slug,
            Description = request.Data.Description,
            Icon = request.Data.Icon,
            Color = request.Data.Color,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive
        };

        _context.DocCategories.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DocCategoryDto>.Success(MapToDto(entity));
    }

    private static DocCategoryDto MapToDto(DocCategory e) => new(
        e.Id, e.Title, e.Slug, e.Description, e.Icon, e.Color, e.SortOrder, e.IsActive, 0, new List<DocArticleDto>(), e.CreatedAt);
}

// ==================== Update DocCategory ====================
public class UpdateDocCategoryCommand : IRequest<Result<DocCategoryDto>>
{
    public Guid Id { get; set; }
    public UpdateDocCategoryDto Data { get; set; } = null!;
}

public class UpdateDocCategoryCommandValidator : AbstractValidator<UpdateDocCategoryCommand>
{
    public UpdateDocCategoryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Doc category data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(100);
            RuleFor(x => x.Data.Slug).NotEmpty().WithMessage("Slug is required").MaximumLength(100);
        });
    }
}

public class UpdateDocCategoryCommandHandler : IRequestHandler<UpdateDocCategoryCommand, Result<DocCategoryDto>>
{
    private readonly CMSDbContext _context;

    public UpdateDocCategoryCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<DocCategoryDto>> Handle(UpdateDocCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocCategories.Include(x => x.Articles).FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<DocCategoryDto>.Failure(Error.NotFound("DocCategory.NotFound", $"Doc category with ID {request.Id} not found"));

        if (await _context.DocCategories.AnyAsync(x => x.Slug == request.Data.Slug && x.Id != request.Id, cancellationToken))
            return Result<DocCategoryDto>.Failure(Error.Conflict("DocCategory.SlugExists", $"A doc category with slug '{request.Data.Slug}' already exists"));

        entity.Title = request.Data.Title;
        entity.Slug = request.Data.Slug;
        entity.Description = request.Data.Description;
        entity.Icon = request.Data.Icon;
        entity.Color = request.Data.Color;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<DocCategoryDto>.Success(new DocCategoryDto(
            entity.Id, entity.Title, entity.Slug, entity.Description, entity.Icon, entity.Color, entity.SortOrder, entity.IsActive,
            entity.Articles?.Count ?? 0,
            entity.Articles?.OrderBy(a => a.SortOrder).Select(a => new DocArticleDto(
                a.Id, a.Title, a.Slug, a.Description, a.Content, a.Icon, a.MetaTitle, a.MetaDescription,
                a.SortOrder, a.IsActive, a.IsPopular, a.ViewCount, a.CategoryId, entity.Title, a.CreatedAt, a.UpdatedAt)).ToList() ?? new(),
            entity.CreatedAt));
    }
}

// ==================== Delete DocCategory ====================
public class DeleteDocCategoryCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteDocCategoryCommandValidator : AbstractValidator<DeleteDocCategoryCommand>
{
    public DeleteDocCategoryCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteDocCategoryCommandHandler : IRequestHandler<DeleteDocCategoryCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteDocCategoryCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteDocCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocCategories.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("DocCategory.NotFound", $"Doc category with ID {request.Id} not found"));

        _context.DocCategories.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
