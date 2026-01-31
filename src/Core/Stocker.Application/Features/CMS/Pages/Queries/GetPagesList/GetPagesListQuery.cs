using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Queries.GetPagesList;

public class GetPagesListQuery : IRequest<Result<PagedResult<CmsPageListDto>>>
{
    public int Page { get; set; } = 1;
    public int Limit { get; set; } = 10;
    public string? Search { get; set; }
    public PageStatus? Status { get; set; }
    public string? SortBy { get; set; } = "createdAt";
    public bool SortDescending { get; set; } = true;
}
