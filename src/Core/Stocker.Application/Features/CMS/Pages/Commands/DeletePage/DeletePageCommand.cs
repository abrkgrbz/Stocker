using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Commands.DeletePage;

public class DeletePageCommand : IRequest<Result>
{
    public Guid Id { get; set; }

    public DeletePageCommand(Guid id)
    {
        Id = id;
    }
}
