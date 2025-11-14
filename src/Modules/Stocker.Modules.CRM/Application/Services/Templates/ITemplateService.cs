using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Services.Templates;

/// <summary>
/// Service for rendering Liquid templates
/// </summary>
public interface ITemplateService
{
    /// <summary>
    /// Render a template with the given data
    /// </summary>
    Task<Result<string>> RenderAsync(string template, object data, CancellationToken cancellationToken = default);

    /// <summary>
    /// Render a template from file
    /// </summary>
    Task<Result<string>> RenderFromFileAsync(string templateName, object data, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validate a template syntax
    /// </summary>
    Result<bool> ValidateTemplate(string template);
}
