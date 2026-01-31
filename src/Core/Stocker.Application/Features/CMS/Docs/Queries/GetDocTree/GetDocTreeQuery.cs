using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Queries.GetDocTree;

public class GetDocTreeQuery : IRequest<Result<List<DocItemTreeDto>>>
{
    public bool ActiveOnly { get; set; } = true;
}
