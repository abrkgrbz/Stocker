using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.Finance.Application.Features.SeedData.Commands;
using Stocker.SharedKernel.Authorization;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.API.Controllers;

[ApiController]
[Authorize]
[Route("api/finance/seed-data")]
[RequireModule("Finance")]
[ApiExplorerSettings(GroupName = "finance")]
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
    /// Finance modülü için standart verileri yükle (Tekdüzen Hesap Planı, maliyet merkezleri)
    /// </summary>
    /// <remarks>
    /// Bu endpoint mevcut kiracı için standart Finance verilerini yükler:
    /// - ~150 muhasebe hesabı (Tekdüzen Hesap Planı - THP)
    ///   - 1xx: Dönen Varlıklar (Kasa, Banka, Alıcılar, Stoklar vb.)
    ///   - 2xx: Duran Varlıklar (Maddi/Maddi Olmayan Duran Varlıklar)
    ///   - 3xx: Kısa Vadeli Yabancı Kaynaklar (Satıcılar, Borçlar vb.)
    ///   - 5xx: Özkaynaklar (Sermaye, Yedekler vb.)
    ///   - 6xx: Gelir Tablosu Hesapları (Satışlar, Giderler vb.)
    ///   - 7xx: Maliyet Hesapları
    /// - 8 maliyet merkezi (Genel, Üretim, Satış, Yönetim, Ar-Ge vb.)
    ///
    /// İşlem idempotent'tir - veriler zaten mevcutsa tekrar yüklenmez.
    /// </remarks>
    [HttpPost("load-standard")]
    [ProducesResponseType(typeof(SeedFinanceDataResult), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<ActionResult<SeedFinanceDataResult>> LoadStandardData()
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            return BadRequest(new Error("Tenant.Required", "Kiracı kimliği gereklidir", ErrorType.Validation));
        }

        var command = new SeedFinanceDataCommand
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
