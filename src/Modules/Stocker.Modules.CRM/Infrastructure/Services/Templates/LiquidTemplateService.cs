using Fluid;
using Fluid.Values;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Application.Services.Templates;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Infrastructure.Services.Templates;

/// <summary>
/// Liquid template rendering service using Fluid.Core
/// </summary>
public class LiquidTemplateService : ITemplateService
{
    private readonly FluidParser _parser;
    private readonly ILogger<LiquidTemplateService> _logger;
    private readonly TemplateOptions _templateOptions;

    public LiquidTemplateService(ILogger<LiquidTemplateService> logger)
    {
        _logger = logger;
        _parser = new FluidParser();

        _templateOptions = new TemplateOptions();
        _templateOptions.MemberAccessStrategy.Register<object>();

        // Register custom filters
        _templateOptions.Filters.AddFilter("currency", (input, arguments, context) =>
        {
            var number = input.ToNumberValue();
            if (number > 0)
            {
                var culture = arguments.At(0).ToStringValue();
                var cultureValue = string.IsNullOrEmpty(culture) ? "tr-TR" : culture;
                return new StringValue(number.ToString("C",
                    new System.Globalization.CultureInfo(cultureValue)));
            }
            return NilValue.Instance;
        });

        _templateOptions.Filters.AddFilter("date_tr", (input, arguments, context) =>
        {
            if (input.ToObjectValue() is DateTime date)
            {
                var format = arguments.At(0).ToStringValue();
                var formatValue = string.IsNullOrEmpty(format) ? "dd.MM.yyyy" : format;
                return new StringValue(date.ToString(formatValue));
            }
            return NilValue.Instance;
        });
    }

    public async Task<Result<string>> RenderAsync(
        string template,
        object data,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (!_parser.TryParse(template, out var parsedTemplate, out var errors))
            {
                var errorMessages = string.Join(", ", errors);
                _logger.LogError("Template parsing failed: {Errors}", errorMessages);
                return Result<string>.Failure(
                    Error.Validation("Template.Parse", $"Template syntax error: {errorMessages}"));
            }

            var context = new TemplateContext(data, _templateOptions);
            var result = await parsedTemplate.RenderAsync(context);

            _logger.LogDebug("Template rendered successfully, output length: {Length}", result.Length);
            return Result<string>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering template");
            return Result<string>.Failure(
                Error.Failure("Template.Render", $"Failed to render template: {ex.Message}"));
        }
    }

    public async Task<Result<string>> RenderFromFileAsync(
        string templateName,
        object data,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var templatePath = Path.Combine("EmailTemplates", $"{templateName}.liquid");

            if (!File.Exists(templatePath))
            {
                _logger.LogWarning("Template file not found: {TemplatePath}", templatePath);
                return Result<string>.Failure(
                    Error.NotFound("Template", $"Template file '{templateName}' not found"));
            }

            var template = await File.ReadAllTextAsync(templatePath, cancellationToken);
            return await RenderAsync(template, data, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error loading template file: {TemplateName}", templateName);
            return Result<string>.Failure(
                Error.Failure("Template.Load", $"Failed to load template: {ex.Message}"));
        }
    }

    public Result<bool> ValidateTemplate(string template)
    {
        try
        {
            if (_parser.TryParse(template, out _, out var errors))
            {
                return Result<bool>.Success(true);
            }

            var errorMessages = string.Join(", ", errors);
            _logger.LogWarning("Template validation failed: {Errors}", errorMessages);
            return Result<bool>.Failure(
                Error.Validation("Template.Validate", $"Template syntax error: {errorMessages}"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating template");
            return Result<bool>.Failure(
                Error.Failure("Template.Validate", $"Failed to validate template: {ex.Message}"));
        }
    }
}
