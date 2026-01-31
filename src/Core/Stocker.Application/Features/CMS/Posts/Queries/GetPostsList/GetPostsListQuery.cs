using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Queries.GetPostsList;

public class GetPostsListQuery : IRequest<Result<PagedResult<BlogPostListDto>>>
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
    public string? Search { get; set; }
    public PostStatus? Status { get; set; }
    public Guid? CategoryId { get; set; }
    public string? Category { get; set; } // Category slug
    public string? SortBy { get; set; } = "createdAt";
    public bool SortDescending { get; set; } = true;
}
