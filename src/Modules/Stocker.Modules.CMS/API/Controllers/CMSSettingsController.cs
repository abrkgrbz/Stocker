using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Repositories;

namespace Stocker.Modules.CMS.API.Controllers;

[ApiController]
[Route("api/cms/settings")]
public class CMSSettingsController : ControllerBase
{
    private readonly ICMSSettingRepository _repository;
    private readonly IMapper _mapper;

    public CMSSettingsController(ICMSSettingRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    /// <summary>
    /// Get all settings (admin)
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<CMSSettingDto>>> GetAll(CancellationToken cancellationToken)
    {
        var settings = await _repository.GetAllAsync(cancellationToken);
        return Ok(_mapper.Map<IEnumerable<CMSSettingDto>>(settings));
    }

    /// <summary>
    /// Get settings grouped by group name (admin)
    /// </summary>
    [HttpGet("grouped")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<Dictionary<string, Dictionary<string, string>>>> GetGrouped(CancellationToken cancellationToken)
    {
        var settings = await _repository.GetAllAsync(cancellationToken);

        var grouped = settings
            .GroupBy(s => s.Group)
            .ToDictionary(
                g => g.Key,
                g => g.ToDictionary(s => s.Key, s => s.Value)
            );

        return Ok(grouped);
    }

    /// <summary>
    /// Get settings by group
    /// </summary>
    [HttpGet("group/{group}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<Dictionary<string, string>>> GetByGroup(string group, CancellationToken cancellationToken)
    {
        var settings = await _repository.GetByGroupAsync(group, cancellationToken);
        var result = settings.ToDictionary(s => s.Key, s => s.Value);
        return Ok(result);
    }

    /// <summary>
    /// Get setting by key (some keys are public)
    /// </summary>
    [HttpGet("{key}")]
    [AllowAnonymous]
    public async Task<ActionResult<object>> GetByKey(string key, CancellationToken cancellationToken)
    {
        var setting = await _repository.GetByKeyAsync(key, cancellationToken);
        if (setting == null)
            return NotFound();

        return Ok(new { key = setting.Key, value = setting.Value });
    }

    /// <summary>
    /// Create or update a setting
    /// </summary>
    [HttpPut("{key}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<CMSSettingDto>> Upsert(string key, [FromBody] UpdateSettingDto dto, CancellationToken cancellationToken)
    {
        var setting = new CMSSetting
        {
            Key = key,
            Value = dto.Value,
            Group = dto.Group ?? "general",
            Description = dto.Description
        };

        var result = await _repository.UpsertAsync(setting, cancellationToken);
        return Ok(_mapper.Map<CMSSettingDto>(result));
    }

    /// <summary>
    /// Bulk update settings
    /// </summary>
    [HttpPost("bulk")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<ActionResult<IEnumerable<CMSSettingDto>>> BulkUpdate([FromBody] IEnumerable<CreateSettingDto> settings, CancellationToken cancellationToken)
    {
        var results = new List<CMSSetting>();

        foreach (var dto in settings)
        {
            var setting = _mapper.Map<CMSSetting>(dto);
            var result = await _repository.UpsertAsync(setting, cancellationToken);
            results.Add(result);
        }

        return Ok(_mapper.Map<IEnumerable<CMSSettingDto>>(results));
    }

    /// <summary>
    /// Delete a setting
    /// </summary>
    [HttpDelete("{key}")]
    [Authorize(Roles = "SuperAdmin,Admin")]
    public async Task<IActionResult> Delete(string key, CancellationToken cancellationToken)
    {
        await _repository.DeleteAsync(key, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Initialize default settings
    /// </summary>
    [HttpPost("init")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<object>> InitDefaults(CancellationToken cancellationToken)
    {
        var defaults = new List<CMSSetting>
        {
            new() { Key = "site_name", Value = "Stocker", Group = "general" },
            new() { Key = "site_description", Value = "Bulut Tabanlı Stok Yönetimi", Group = "general" },
            new() { Key = "contact_email", Value = "info@stoocker.app", Group = "contact" },
            new() { Key = "contact_phone", Value = "+90 212 123 45 67", Group = "contact" },
            new() { Key = "social_twitter", Value = "https://twitter.com/stockerapp", Group = "social" },
            new() { Key = "social_linkedin", Value = "https://linkedin.com/company/stocker", Group = "social" },
            new() { Key = "footer_copyright", Value = "© 2024 Stocker. Tüm hakları saklıdır.", Group = "footer" },
        };

        foreach (var setting in defaults)
        {
            await _repository.UpsertAsync(setting, cancellationToken);
        }

        return Ok(new { message = "Default settings initialized", count = defaults.Count });
    }
}
