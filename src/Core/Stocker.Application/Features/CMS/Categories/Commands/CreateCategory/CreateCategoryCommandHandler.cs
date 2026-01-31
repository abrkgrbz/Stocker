using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Entities.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Categories.Commands.CreateCategory;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<BlogCategoryDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreateCategoryCommandHandler> _logger;

    public CreateCategoryCommandHandler(
        IMasterDbContext context,
        ILogger<CreateCategoryCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<BlogCategoryDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if slug exists
            var slugExists = await _context.BlogCategories
                .AnyAsync(c => c.Slug == request.Slug.ToLowerInvariant(), cancellationToken);

            if (slugExists)
            {
                return Result<BlogCategoryDto>.Failure(
                    Error.Conflict("BlogCategory.SlugExists", "Bu slug zaten kullanımda"));
            }

            // Create category
            var category = BlogCategory.Create(
                name: request.Name,
                slug: request.Slug,
                description: request.Description,
                color: request.Color,
                icon: request.Icon,
                displayOrder: request.DisplayOrder);

            _context.BlogCategories.Add(category);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = new BlogCategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Slug = category.Slug,
                Description = category.Description,
                Color = category.Color,
                Icon = category.Icon,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                PostCount = 0,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };

            _logger.LogInformation("Blog category created: {CategoryId} - {Name}", category.Id, category.Name);

            return Result<BlogCategoryDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blog category: {Name}", request.Name);
            return Result<BlogCategoryDto>.Failure(
                Error.Failure("BlogCategory.CreateFailed", "Kategori oluşturma işlemi başarısız oldu"));
        }
    }
}
