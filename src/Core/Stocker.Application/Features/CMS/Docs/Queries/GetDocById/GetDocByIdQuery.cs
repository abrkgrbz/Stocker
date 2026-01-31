using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Queries.GetDocById;

public class GetDocByIdQuery : IRequest<Result<DocItemDto>>
{
    public Guid Id { get; set; }

    public GetDocByIdQuery(Guid id)
    {
        Id = id;
    }
}
