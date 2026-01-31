using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
using Stocker.API.Authorization;
using Stocker.Application.DTOs.Tenant.Settings;
using Stocker.Application.Features.Tenant.Settings.Commands;
using Stocker.Application.Features.Tenant.Settings.Queries;
using Stocker.SharedKernel.Interfaces;
using Stocker.Application.Common.Exceptions;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
[HasPermission("Settings", "View")] // Default permission for controller
public class SettingsController : ApiController
{
    private readonly IMediator _mediator;
    private readonly ICurrentUserService _currentUserService;

    public SettingsController(IMediator mediator, ICurrentUserService currentUserService)
    {
        _mediator = mediator;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<List<SettingCategoryDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetSettings(
        [FromQuery] string? category = null,
        [FromQuery] bool includeSystemSettings = false)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var query = new GetSettingsQuery
        {
            TenantId = tenantId,
            Category = category,
            IncludeSystemSettings = includeSystemSettings
        };

        var result = await _mediator.Send(query);

        return Ok(new ApiResponse<List<SettingCategoryDto>>
        {
            Success = true,
            Data = result,
            Message = "Ayarlar başarıyla getirildi"
        });
    }

    [HttpGet("{key}")]
    [ProducesResponseType(typeof(ApiResponse<SettingDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 404)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetSettingByKey(string key)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var query = new GetSettingByKeyQuery
        {
            TenantId = tenantId,
            SettingKey = key
        };

        var result = await _mediator.Send(query);

        if (result == null)
            throw new NotFoundException("Setting", key);

        return Ok(new ApiResponse<SettingDto>
        {
            Success = true,
            Data = result,
            Message = "Ayar başarıyla getirildi"
        });
    }

    [HttpPost]
    [HasPermission("Settings", "Create")]
    [ProducesResponseType(typeof(ApiResponse<SettingDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 400)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> CreateSetting([FromBody] CreateSettingRequest request)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Empty;
        if (tenantId == Guid.Empty)
            throw new UnauthorizedException("Tenant bulunamadı");

        var command = new CreateSettingCommand
        {
            TenantId = tenantId,
            SettingKey = request.SettingKey,
            SettingValue = request.SettingValue,
            Description = request.Description,
            Category = request.Category,
            DataType = request.DataType,
            IsSystemSetting = request.IsSystemSetting,
            IsEncrypted = request.IsEncrypted,
            IsPublic = request.IsPublic,
            CreatedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);

        return Ok(new ApiResponse<SettingDto>
        {
            Success = true,
            Data = result,
            Message = "Ayar başarıyla oluşturuldu"
        });
    }

    [HttpPut("{key}")]
    [HasPermission("Settings", "Edit")]
    [ProducesResponseType(typeof(ApiResponse<bool>), 200)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 404)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 400)]
    [ProducesResponseType(typeof(ApiResponse<bool>), 500)]
    public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingRequest request)
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

        var command = new UpdateSettingCommand
        {
            TenantId = tenantId,
            SettingKey = key,
            SettingValue = request.SettingValue,
            ModifiedBy = User.Identity?.Name
        };

        var result = await _mediator.Send(command);

        if (!result)
            throw new NotFoundException("Setting", key);

        return Ok(new ApiResponse<bool>
        {
            Success = true,
            Data = true,
            Message = "Ayar başarıyla güncellendi"
        });
    }
}

public class CreateSettingRequest
{
    public string SettingKey { get; set; } = string.Empty;
    public string SettingValue { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = "General";
    public string DataType { get; set; } = "String";
    public bool IsSystemSetting { get; set; }
    public bool IsEncrypted { get; set; }
    public bool IsPublic { get; set; }
}

public class UpdateSettingRequest
{
    public string SettingValue { get; set; } = string.Empty;
}