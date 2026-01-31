using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Entities.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Commands.CreatePost;

public class CreatePostCommandHandler : IRequestHandler<CreatePostCommand, Result<BlogPostDto>>
{
    private readonly IMasterDbContext _context;
    private readonly ILogger<CreatePostCommandHandler> _logger;

    public CreatePostCommandHandler(
        IMasterDbContext context,
        ILogger<CreatePostCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<BlogPostDto>> Handle(CreatePostCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if slug exists
            var slugExists = await _context.BlogPosts
                .AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant(), cancellationToken);

            if (slugExists)
            {
                return Result<BlogPostDto>.Failure(
                    Error.Conflict("BlogPost.SlugExists", "Bu slug zaten kullanımda"));
            }

            // Verify category exists
            var category = await _context.BlogCategories
                .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

            if (category == null)
            {
                return Result<BlogPostDto>.Failure(
                    Error.NotFound("BlogPost.CategoryNotFound", "Kategori bulunamadı"));
            }

            // Verify author exists
            var author = await _context.MasterUsers
                .FirstOrDefaultAsync(u => u.Id == request.AuthorId, cancellationToken);

            if (author == null)
            {
                return Result<BlogPostDto>.Failure(
                    Error.NotFound("BlogPost.AuthorNotFound", "Yazar bulunamadı"));
            }

            // Create post
            var post = BlogPost.Create(
                title: request.Title,
                slug: request.Slug,
                content: request.Content,
                categoryId: request.CategoryId,
                status: request.Status,
                authorId: request.AuthorId,
                excerpt: request.Excerpt,
                tags: request.Tags,
                publishDate: request.PublishDate,
                featuredImage: request.FeaturedImage,
                metaTitle: request.MetaTitle,
                metaDescription: request.MetaDescription);

            _context.BlogPosts.Add(post);
            await _context.SaveChangesAsync(cancellationToken);

            var dto = new BlogPostDto
            {
                Id = post.Id,
                Title = post.Title,
                Slug = post.Slug,
                Content = post.Content,
                Excerpt = post.Excerpt,
                Category = new BlogCategoryDto
                {
                    Id = category.Id,
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
                    Id = author.Id,
                    Name = $"{author.FirstName} {author.LastName}",
                    Avatar = null
                }
            };

            _logger.LogInformation("Blog post created: {PostId} - {Title}", post.Id, post.Title);

            return Result<BlogPostDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating blog post: {Title}", request.Title);
            return Result<BlogPostDto>.Failure(
                Error.Failure("BlogPost.CreateFailed", "Blog yazısı oluşturma işlemi başarısız oldu"));
        }
    }
}
