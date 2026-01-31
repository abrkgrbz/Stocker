using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Posts.Commands.DeletePost;

public class DeletePostCommand : IRequest<Result>
{
    public Guid Id { get; set; }

    public DeletePostCommand(Guid id)
    {
        Id = id;
    }
}
