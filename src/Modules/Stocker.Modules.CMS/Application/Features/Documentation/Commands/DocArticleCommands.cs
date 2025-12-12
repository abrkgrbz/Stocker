using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.Documentation.Commands;

// ==================== Create DocArticle ====================
public class CreateDocArticleCommand : IRequest<Result<DocArticleDto>>
{
    public CreateDocArticleDto Data { get; set; } = null!;
}

public class CreateDocArticleCommandValidator : AbstractValidator<CreateDocArticleCommand>
{
    public CreateDocArticleCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Doc article data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(200);
            RuleFor(x => x.Data.Slug).NotEmpty().WithMessage("Slug is required").MaximumLength(200);
            RuleFor(x => x.Data.CategoryId).NotEmpty().WithMessage("Category ID is required");
        });
    }
}

public class CreateDocArticleCommandHandler : IRequestHandler<CreateDocArticleCommand, Result<DocArticleDto>>
{
    private readonly CMSDbContext _context;

    public CreateDocArticleCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<DocArticleDto>> Handle(CreateDocArticleCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.DocCategories.FindAsync(new object[] { request.Data.CategoryId }, cancellationToken);
        if (category == null)
            return Result<DocArticleDto>.Failure(Error.NotFound("DocCategory.NotFound", $"Doc category with ID {request.Data.CategoryId} not found"));

        if (await _context.DocArticles.AnyAsync(x => x.Slug == request.Data.Slug, cancellationToken))
            return Result<DocArticleDto>.Failure(Error.Conflict("DocArticle.SlugExists", $"A doc article with slug '{request.Data.Slug}' already exists"));

        var entity = new DocArticle
        {
            Title = request.Data.Title,
            Slug = request.Data.Slug,
            Description = request.Data.Description,
            Content = request.Data.Content,
            Icon = request.Data.Icon,
            MetaTitle = request.Data.MetaTitle,
            MetaDescription = request.Data.MetaDescription,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive,
            IsPopular = request.Data.IsPopular,
            ViewCount = 0,
            CategoryId = request.Data.CategoryId
        };

        _context.DocArticles.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DocArticleDto>.Success(new DocArticleDto(
            entity.Id, entity.Title, entity.Slug, entity.Description, entity.Content, entity.Icon,
            entity.MetaTitle, entity.MetaDescription, entity.SortOrder, entity.IsActive, entity.IsPopular,
            entity.ViewCount, entity.CategoryId, category.Title, entity.CreatedAt, entity.UpdatedAt));
    }
}

// ==================== Update DocArticle ====================
public class UpdateDocArticleCommand : IRequest<Result<DocArticleDto>>
{
    public Guid Id { get; set; }
    public UpdateDocArticleDto Data { get; set; } = null!;
}

public class UpdateDocArticleCommandValidator : AbstractValidator<UpdateDocArticleCommand>
{
    public UpdateDocArticleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Doc article data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Title).NotEmpty().WithMessage("Title is required").MaximumLength(200);
            RuleFor(x => x.Data.Slug).NotEmpty().WithMessage("Slug is required").MaximumLength(200);
            RuleFor(x => x.Data.CategoryId).NotEmpty().WithMessage("Category ID is required");
        });
    }
}

public class UpdateDocArticleCommandHandler : IRequestHandler<UpdateDocArticleCommand, Result<DocArticleDto>>
{
    private readonly CMSDbContext _context;

    public UpdateDocArticleCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<DocArticleDto>> Handle(UpdateDocArticleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocArticles.Include(x => x.Category).FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);
        if (entity == null)
            return Result<DocArticleDto>.Failure(Error.NotFound("DocArticle.NotFound", $"Doc article with ID {request.Id} not found"));

        if (await _context.DocArticles.AnyAsync(x => x.Slug == request.Data.Slug && x.Id != request.Id, cancellationToken))
            return Result<DocArticleDto>.Failure(Error.Conflict("DocArticle.SlugExists", $"A doc article with slug '{request.Data.Slug}' already exists"));

        var category = await _context.DocCategories.FindAsync(new object[] { request.Data.CategoryId }, cancellationToken);
        if (category == null)
            return Result<DocArticleDto>.Failure(Error.NotFound("DocCategory.NotFound", $"Doc category with ID {request.Data.CategoryId} not found"));

        entity.Title = request.Data.Title;
        entity.Slug = request.Data.Slug;
        entity.Description = request.Data.Description;
        entity.Content = request.Data.Content;
        entity.Icon = request.Data.Icon;
        entity.MetaTitle = request.Data.MetaTitle;
        entity.MetaDescription = request.Data.MetaDescription;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.IsPopular = request.Data.IsPopular;
        entity.CategoryId = request.Data.CategoryId;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<DocArticleDto>.Success(new DocArticleDto(
            entity.Id, entity.Title, entity.Slug, entity.Description, entity.Content, entity.Icon,
            entity.MetaTitle, entity.MetaDescription, entity.SortOrder, entity.IsActive, entity.IsPopular,
            entity.ViewCount, entity.CategoryId, category.Title, entity.CreatedAt, entity.UpdatedAt));
    }
}

// ==================== Delete DocArticle ====================
public class DeleteDocArticleCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteDocArticleCommandValidator : AbstractValidator<DeleteDocArticleCommand>
{
    public DeleteDocArticleCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteDocArticleCommandHandler : IRequestHandler<DeleteDocArticleCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteDocArticleCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteDocArticleCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocArticles.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("DocArticle.NotFound", $"Doc article with ID {request.Id} not found"));

        _context.DocArticles.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}

// ==================== Increment ViewCount ====================
public class IncrementDocArticleViewCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class IncrementDocArticleViewCommandHandler : IRequestHandler<IncrementDocArticleViewCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public IncrementDocArticleViewCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(IncrementDocArticleViewCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.DocArticles.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("DocArticle.NotFound", $"Doc article with ID {request.Id} not found"));

        entity.ViewCount++;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
