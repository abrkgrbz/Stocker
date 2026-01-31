using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Queries.GetPageById;

public class GetPageByIdQuery : IRequest<Result<CmsPageDto>>
{
    public Guid Id { get; set; }

    public GetPageByIdQuery(Guid id)
    {
        Id = id;
    }
}
