using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Commands.UpdatePost;

public class UpdatePostCommandHandler : IRequestHandler<UpdatePostCommand, Result<BlogPostDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<UpdatePostCommandHandler> _logger;

    public UpdatePostCommandHandler(
        IMasterDbContext context,
        ILogger<UpdatePostCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<BlogPostDto>> Handle(UpdatePostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var post = await _context.BlogPosts
                .Include(p => p.Author)
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (post == null)
            {
                return Result<BlogPostDto>.Failure(
                    Error.NotFound("BlogPost.NotFound", "Blog yazısı bulunamadı"));
            }

            // Check if slug is taken by another post
            var slugExists = await _context.BlogPosts
                .AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant() && p.Id != request.Id, cancellationToken);

            if (slugExists)
            {
                return Result<BlogPostDto>.Failure(
                    Error.Conflict("BlogPost.SlugExists", "Bu slug zaten kullanımda"));
            }

            // Verify category if changed
            if (post.CategoryId != request.CategoryId)
            {
                var categoryExists = await _context.BlogCategories
                    .AnyAsync(c => c.Id == request.CategoryId, cancellationToken);

                if (!categoryExists)
                {
                    return Result<BlogPostDto>.Failure(
                        Error.NotFound("BlogPost.CategoryNotFound", "Kategori bulunamadı"));
                }
            }

            // Update post
            post.Update(
                title: request.Title,
                slug: request.Slug,
                content: request.Content,
                categoryId: request.CategoryId,
                status: request.Status,
                excerpt: request.Excerpt,
                tags: request.Tags,
                publishDate: request.PublishDate,
                featuredImage: request.FeaturedImage,
                metaTitle: request.MetaTitle,
                metaDescription: request.MetaDescription);

            await _context.SaveChangesAsync(cancellationToken);

            // Reload category if changed
            var category = await _context.BlogCategories
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

            var dto = new BlogPostDto
            {
                Id = post.Id,
                Title = post.Title,
                Slug = post.Slug,
                Content = post.Content,
                Excerpt = post.Excerpt,
                Category = new BlogCategoryDto
                {
                    Id = category!.Id,
                    Name = category.Name,
                    Slug = category.Slug,
                    Color = category.Color,
                    Icon = category.Icon
                },
                Tags = post.Tags.ToList(),
                Status = post.Status,
                PublishDate = post.PublishDate,
                FeaturedImage = post.FeaturedImage,
                Views = post.Views,
                MetaTitle = post.MetaTitle,
                MetaDescription = post.MetaDescription,
                CreatedAt = post.CreatedAt,
                UpdatedAt = post.UpdatedAt,
                Author = new AuthorDto
                {
                    Id = post.Author!.Id,
                    Name = $"{post.Author.FirstName} {post.Author.LastName}",
                    Avatar = null
                }
            };

            _logger.LogInformation("Blog post updated: {PostId} - {Title}", post.Id, post.Title);

            return Result<BlogPostDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating blog post: {PostId}", request.Id);
            return Result<BlogPostDto>.Failure(
                Error.Failure("BlogPost.UpdateFailed", "Blog yazısı güncelleme işlemi başarısız oldu"));
        }
    }
}
