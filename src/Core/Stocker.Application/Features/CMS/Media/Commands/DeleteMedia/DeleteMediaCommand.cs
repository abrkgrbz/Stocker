using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Media.Commands.DeleteMedia;

public class DeleteMediaCommand : IRequest<Result>
{
    public Guid Id { get; set; }

    public DeleteMediaCommand(Guid id)
    {
        Id = id;
    }
}
