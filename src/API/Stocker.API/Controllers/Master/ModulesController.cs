using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.DTOs.Module;
using Stocker.Application.Features.Modules.Commands.ActivateModuleDefinition;
using Stocker.Application.Features.Modules.Commands.AddModuleDependency;
using Stocker.Application.Features.Modules.Commands.AddModuleFeature;
using Stocker.Application.Features.Modules.Commands.CreateModuleDefinition;
using Stocker.Application.Features.Modules.Commands.DeactivateModuleDefinition;
using Stocker.Application.Features.Modules.Commands.DeleteModuleDefinition;
using Stocker.Application.Features.Modules.Commands.RemoveModuleDependency;
using Stocker.Application.Features.Modules.Commands.RemoveModuleFeature;
using Stocker.Application.Features.Modules.Commands.UpdateModuleDefinition;
using Stocker.Application.Features.Modules.Queries.GetModuleDefinitionById;
using Stocker.Application.Features.Modules.Queries.GetModuleDefinitionsList;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Modül Yönetimi / Module Management")]
public class ModulesController : MasterControllerBase
{
    public ModulesController(IMediator mediator, ILogger<ModulesController> logger)
        : base(mediator, logger)
    {
    }

    /// <summary>
    /// Tüm modülleri listeler / Lists all modules
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Tüm modülleri listeler", Description = "Opsiyonel olarak aktiflik durumu ve kategoriye göre filtreler")]
    [SwaggerResponse(200, "Modül listesi", typeof(ApiResponse<List<ModuleDefinitionDto>>))]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? isActive = null,
        [FromQuery] string? category = null)
    {
        var result = await _mediator.Send(new GetModuleDefinitionsListQuery(isActive, category));
        return HandleResult(result);
    }

    /// <summary>
    /// ID'ye göre modül getirir / Gets module by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    [SwaggerOperation(Summary = "ID'ye göre modül getirir")]
    [SwaggerResponse(200, "Modül detayı", typeof(ApiResponse<ModuleDefinitionDto>))]
    [SwaggerResponse(404, "Modül bulunamadı")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _mediator.Send(new GetModuleDefinitionByIdQuery(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Yeni modül oluşturur / Creates a new module
    /// </summary>
    [HttpPost]
    [SwaggerOperation(Summary = "Yeni modül oluşturur")]
    [SwaggerResponse(200, "Oluşturulan modül ID'si", typeof(ApiResponse<Guid>))]
    [SwaggerResponse(400, "Geçersiz istek")]
    [SwaggerResponse(409, "Modül kodu zaten mevcut")]
    public async Task<IActionResult> Create([FromBody] CreateModuleRequest request)
    {
        var command = new CreateModuleDefinitionCommand(
            request.Code,
            request.Name,
            request.Description,
            request.Icon,
            request.MonthlyPrice,
            request.Currency,
            request.IsCore,
            request.DisplayOrder,
            request.Category);

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Modülü günceller / Updates module
    /// </summary>
    [HttpPut("{id:guid}")]
    [SwaggerOperation(Summary = "Modülü günceller")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül bulunamadı")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateModuleRequest request)
    {
        var command = new UpdateModuleDefinitionCommand(
            id,
            request.Name,
            request.Description,
            request.Icon,
            request.MonthlyPrice,
            request.Currency,
            request.IsCore,
            request.DisplayOrder,
            request.Category);

        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Modülü siler / Deletes module
    /// </summary>
    [HttpDelete("{id:guid}")]
    [SwaggerOperation(Summary = "Modülü siler")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül bulunamadı")]
    [SwaggerResponse(409, "Modül kullanımda")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _mediator.Send(new DeleteModuleDefinitionCommand(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Modülü aktif yapar / Activates module
    /// </summary>
    [HttpPost("{id:guid}/activate")]
    [SwaggerOperation(Summary = "Modülü aktif yapar")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül bulunamadı")]
    [SwaggerResponse(409, "Modül zaten aktif")]
    public async Task<IActionResult> Activate(Guid id)
    {
        var result = await _mediator.Send(new ActivateModuleDefinitionCommand(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Modülü pasif yapar / Deactivates module
    /// </summary>
    [HttpPost("{id:guid}/deactivate")]
    [SwaggerOperation(Summary = "Modülü pasif yapar")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül bulunamadı")]
    [SwaggerResponse(409, "Modül zaten pasif veya core modül")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        var result = await _mediator.Send(new DeactivateModuleDefinitionCommand(id));
        return HandleResult(result);
    }

    /// <summary>
    /// Modüle özellik ekler / Adds feature to module
    /// </summary>
    [HttpPost("{id:guid}/features")]
    [SwaggerOperation(Summary = "Modüle özellik ekler")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül bulunamadı")]
    [SwaggerResponse(409, "Özellik zaten mevcut")]
    public async Task<IActionResult> AddFeature(Guid id, [FromBody] AddFeatureRequest request)
    {
        var command = new AddModuleFeatureCommand(id, request.FeatureName, request.Description);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Modülden özellik kaldırır / Removes feature from module
    /// </summary>
    [HttpDelete("{id:guid}/features/{featureName}")]
    [SwaggerOperation(Summary = "Modülden özellik kaldırır")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül veya özellik bulunamadı")]
    public async Task<IActionResult> RemoveFeature(Guid id, string featureName)
    {
        var result = await _mediator.Send(new RemoveModuleFeatureCommand(id, featureName));
        return HandleResult(result);
    }

    /// <summary>
    /// Modüle bağımlılık ekler / Adds dependency to module
    /// </summary>
    [HttpPost("{id:guid}/dependencies")]
    [SwaggerOperation(Summary = "Modüle bağımlılık ekler")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül veya bağımlı modül bulunamadı")]
    [SwaggerResponse(409, "Bağımlılık zaten mevcut")]
    public async Task<IActionResult> AddDependency(Guid id, [FromBody] AddDependencyRequest request)
    {
        var command = new AddModuleDependencyCommand(id, request.DependentModuleCode);
        var result = await _mediator.Send(command);
        return HandleResult(result);
    }

    /// <summary>
    /// Modülden bağımlılık kaldırır / Removes dependency from module
    /// </summary>
    [HttpDelete("{id:guid}/dependencies/{dependentModuleCode}")]
    [SwaggerOperation(Summary = "Modülden bağımlılık kaldırır")]
    [SwaggerResponse(200, "Başarılı")]
    [SwaggerResponse(404, "Modül veya bağımlılık bulunamadı")]
    public async Task<IActionResult> RemoveDependency(Guid id, string dependentModuleCode)
    {
        var result = await _mediator.Send(new RemoveModuleDependencyCommand(id, dependentModuleCode));
        return HandleResult(result);
    }
}

#region Request DTOs

public record CreateModuleRequest(
    string Code,
    string Name,
    string? Description,
    string? Icon,
    decimal MonthlyPrice,
    string Currency,
    bool IsCore,
    int DisplayOrder,
    string? Category);

public record UpdateModuleRequest(
    string Name,
    string? Description,
    string? Icon,
    decimal MonthlyPrice,
    string Currency,
    bool IsCore,
    int DisplayOrder,
    string? Category);

public record AddFeatureRequest(
    string FeatureName,
    string? Description);

public record AddDependencyRequest(
    string DependentModuleCode);

#endregion
