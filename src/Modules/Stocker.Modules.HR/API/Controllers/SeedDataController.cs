using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.HR.Application.Features.SeedData.Commands;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.API.Controllers;

[ApiController]
[Authorize]
[Route("api/hr/seed-data")]
[RequireModule("HR")]
[ApiExplorerSettings(GroupName = "hr")]
public class SeedDataController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ITenantService _tenantService;

    public SeedDataController(IMediator mediator, ITenantService tenantService)
    {
        _mediator = mediator;
        _tenantService = tenantService;
    }

    /// <summary>
    /// HR modülü için standart verileri yükle (izin türleri, tatiller, vardiyalar)
    /// </summary>
    /// <remarks>
    /// Bu endpoint mevcut kiracı için standart HR verilerini yükler:
    /// - 10 izin türü (Yıllık, Hastalık, Mazeret, Evlilik, Doğum, vb.)
    /// - 12 resmi tatil (Yılbaşı, 23 Nisan, 1 Mayıs, 19 Mayıs, vb.)
    /// - 7 vardiya tipi (Standart, Sabah, Akşam, Gece, vb.)
    ///
    /// İşlem idempotent'tir - veriler zaten mevcutsa tekrar yüklenmez.
    /// </remarks>
    [HttpPost("load-standard")]
    [ProducesResponseType(typeof(SeedHRDataResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SeedHRDataResult>> LoadStandardData()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Kiracı kimliği gereklidir", ErrorType.Validation));
        }

        var command = new SeedHRDataCommand
        {
            TenantId = tenantId.Value,
            ForceReseed = false
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
            return BadRequest(result.Error);

        return Ok(result.Value);
    }
}
