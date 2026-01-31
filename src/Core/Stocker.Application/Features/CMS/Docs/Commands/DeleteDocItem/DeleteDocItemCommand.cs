using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Commands.DeleteDocItem;

public class DeleteDocItemCommand : IRequest<Result>
{
    public Guid Id { get; set; }

    public DeleteDocItemCommand(Guid id)
    {
        Id = id;
    }
}
