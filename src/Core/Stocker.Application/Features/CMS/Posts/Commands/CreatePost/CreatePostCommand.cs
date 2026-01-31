using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Commands.CreatePost;

public class CreatePostCommand : IRequest<Result<BlogPostDto>>
{
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Excerpt { get; set; }
    public Guid CategoryId { get; set; }
    public List<string> Tags { get; set; } = new();
    public PostStatus Status { get; set; } = PostStatus.Draft;
    public DateTime? PublishDate { get; set; }
    public string? FeaturedImage { get; set; }
    public string? MetaTitle { get; set; }
    public string? MetaDescription { get; set; }
    public Guid AuthorId { get; set; }
}
