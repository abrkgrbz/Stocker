using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Master;
using Stocker.Application.DTOs.CMS;
using Stocker.Application.Features.CMS.Stats.Queries.GetCmsStats;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master.CMS;

/// <summary>
/// CMS dashboard istatistikleri endpoint'leri
/// </summary>
[Route("api/v1/cms/[controller]")]
[SwaggerTag("CMS - Dashboard İstatistikleri")]
public class StatsController : MasterControllerBase
{
    public StatsController(IMediator mediator, ILogger<StatsController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// CMS dashboard istatistiklerini getirir
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<CmsStatsDto>), 200)]
    public async Task<IActionResult> GetStats()
    {
        _logger.LogInformation("Getting CMS dashboard stats");
        var query = new GetCmsStatsQuery();
        var result = await _mediator.Send(query);
        return HandleResult(result);
    }
}
