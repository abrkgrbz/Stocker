using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Media.Queries.GetMediaList;

public class GetMediaListQuery : IRequest<Result<PagedResult<CmsMediaListDto>>>
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 20;
    public MediaType? Type { get; set; }
    public string? Folder { get; set; }
    public string? Search { get; set; }
}
