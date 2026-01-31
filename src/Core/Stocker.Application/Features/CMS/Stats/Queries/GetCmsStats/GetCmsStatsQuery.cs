using MediatR;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Stats.Queries.GetCmsStats;

public class GetCmsStatsQuery : IRequest<Result<CmsStatsDto>>
{
}
