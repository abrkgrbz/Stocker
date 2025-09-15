using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.Application.DTOs.Tenant.Modules;
using Stocker.Application.Features.Tenant.Modules.Commands;
using Stocker.Application.Features.Tenant.Modules.Queries;
using Stocker.SharedKernel.Interfaces;
using Stocker.Application.Common.Exceptions;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class ModulesController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public ModulesController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<ModuleDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetModules([FromQuery] bool? isEnabled = null)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var query = new GetModulesQuery
        {
            TenantId = tenantId,
            IsEnabled = isEnabled
        };

        var result = await _mediator.Send(query);

        return Ok(new ApiResponse<List<ModuleDto>>
        {
            Success = true,
            Data = result,
            Message = "Modüller başarıyla listelendi"
        });
    }

    [HttpPost("{moduleCode}/toggle")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 500)]
    public async Task<IActionResult> ToggleModule(string moduleCode, [FromBody] ToggleModuleRequest request)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
        {
            return BadRequest(new ApiResponse<bool>
            {
                Success = false,
                Message = "Tenant bulunamadı"
            });
        }

        var command = new ToggleModuleCommand
        {
            TenantId = tenantId,
            ModuleCode = moduleCode,
            Enable = request.Enable,
            ModifiedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);

        if (!result)
            throw new NotFoundException("Module", moduleCode);

        var action = request.Enable ? "etkinleştirildi" : "devre dışı bırakıldı";
        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = $"Modül başarıyla {action}"
        });
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<ModulesSummaryDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetModulesSummary()
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var query = new GetModulesQuery
        {
            TenantId = tenantId
        };

        var modules = await _mediator.Send(query);

        var summary = new ModulesSummaryDto
        {
            TotalModules = modules.Count,
            EnabledModules = modules.Count(m => m.IsEnabled),
            DisabledModules = modules.Count(m => !m.IsEnabled),
            TrialModules = modules.Count(m => m.IsTrial),
            ExpiredModules = modules.Count(m => m.IsExpired),
            Modules = modules
        };

        return Ok(new ApiResponse<ModulesSummaryDto>
        {
            Success = true,
            Data = summary,
            Message = "Modül özeti başarıyla getirildi"
        });
    }
}

public class ToggleModuleRequest
{
    public bool Enable { get; set; }
}

public class ModulesSummaryDto
{
    public int TotalModules { get; set; }
    public int EnabledModules { get; set; }
    public int DisabledModules { get; set; }
    public int TrialModules { get; set; }
    public int ExpiredModules { get; set; }
    public List<ModuleDto> Modules { get; set; } = new();
}