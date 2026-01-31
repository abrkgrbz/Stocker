using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Queries.GetPostById;

public class GetPostByIdQueryHandler : IRequestHandler<GetPostByIdQuery, Result<BlogPostDto>>
{
    private readonly IMasterDbContext _context;

    public GetPostByIdQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<BlogPostDto>> Handle(GetPostByIdQuery request, CancellationToken cancellationToken)
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

        var dto = new BlogPostDto
        {
            Id = post.Id,
            Title = post.Title,
            Slug = post.Slug,
            Content = post.Content,
            Excerpt = post.Excerpt,
            Category = new BlogCategoryDto
            {
                Id = post.Category!.Id,
                Name = post.Category.Name,
                Slug = post.Category.Slug,
                Color = post.Category.Color,
                Icon = post.Category.Icon
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

        return Result<BlogPostDto>.Success(dto);
    }
}
