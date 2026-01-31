using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Queries.GetPostById;

public class GetPostByIdQuery : IRequest<Result<BlogPostDto>>
{
    public Guid Id { get; set; }

    public GetPostByIdQuery(Guid id)
    {
        Id = id;
    }
}
