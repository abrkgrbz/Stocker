using System.Globalization;
using System.Text.RegularExpressions;
using Fluid;
using Fluid.Values;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Liquid template rendering service using Fluid.Core
/// Provides email template rendering with custom filters for Turkish locale
/// </summary>
public class LiquidTemplateService : ILiquidTemplateService
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
        RegisterCustomFilters();
    }

    private void RegisterCustomFilters()
    {
        // Currency filter: {{ price | currency: "tr-TR" }}
        _templateOptions.Filters.AddFilter("currency", (input, arguments, context) =>
        {
            var number = input.ToNumberValue();
            if (number != 0)
            {
                var culture = arguments.At(0).ToStringValue();
                var cultureValue = string.IsNullOrEmpty(culture) ? "tr-TR" : culture;
                try
                {
                    return new StringValue(number.ToString("C", new CultureInfo(cultureValue)));
                }
                catch
                {
                    return new StringValue(number.ToString("C", CultureInfo.InvariantCulture));
                }
            }
            return new StringValue("₺0,00");
        });

        // Turkish date filter: {{ date | date_tr: "dd MMMM yyyy" }}
        _templateOptions.Filters.AddFilter("date_tr", (input, arguments, context) =>
        {
            if (input.ToObjectValue() is DateTime date)
            {
                var format = arguments.At(0).ToStringValue();
                var formatValue = string.IsNullOrEmpty(format) ? "dd.MM.yyyy" : format;
                try
                {
                    return new StringValue(date.ToString(formatValue, new CultureInfo("tr-TR")));
                }
                catch
                {
                    return new StringValue(date.ToString("dd.MM.yyyy"));
                }
            }
            return NilValue.Instance;
        });

        // Date filter with custom culture: {{ date | date: "yyyy-MM-dd", "en-US" }}
        _templateOptions.Filters.AddFilter("date", (input, arguments, context) =>
        {
            if (input.ToObjectValue() is DateTime date)
            {
                var format = arguments.At(0).ToStringValue();
                var culture = arguments.At(1).ToStringValue();
                var formatValue = string.IsNullOrEmpty(format) ? "yyyy-MM-dd" : format;
                var cultureValue = string.IsNullOrEmpty(culture) ? CultureInfo.InvariantCulture : new CultureInfo(culture);
                try
                {
                    return new StringValue(date.ToString(formatValue, cultureValue));
                }
                catch
                {
                    return new StringValue(date.ToString("yyyy-MM-dd"));
                }
            }
            return NilValue.Instance;
        });

        // Number filter: {{ value | number: 2 }}
        _templateOptions.Filters.AddFilter("number", (input, arguments, context) =>
        {
            var number = input.ToNumberValue();
            var decimals = (int)arguments.At(0).ToNumberValue();
            if (decimals < 0) decimals = 0;
            if (decimals > 10) decimals = 10;

            return new StringValue(number.ToString($"N{decimals}", new CultureInfo("tr-TR")));
        });

        // Percentage filter: {{ value | percentage: 1 }}
        _templateOptions.Filters.AddFilter("percentage", (input, arguments, context) =>
        {
            var number = input.ToNumberValue();
            var decimals = (int)arguments.At(0).ToNumberValue();
            if (decimals < 0) decimals = 0;
            if (decimals > 10) decimals = 10;

            return new StringValue(number.ToString($"P{decimals}", new CultureInfo("tr-TR")));
        });

        // Truncate filter: {{ text | truncate: 50 }}
        _templateOptions.Filters.AddFilter("truncate", (input, arguments, context) =>
        {
            var text = input.ToStringValue();
            var length = (int)arguments.At(0).ToNumberValue();
            if (length <= 0) length = 50;

            if (string.IsNullOrEmpty(text) || text.Length <= length)
                return new StringValue(text);

            return new StringValue(text.Substring(0, length) + "...");
        });

        // Default value filter: {{ value | default: "N/A" }}
        _templateOptions.Filters.AddFilter("default", (input, arguments, context) =>
        {
            var value = input.ToStringValue();
            var defaultValue = arguments.At(0).ToStringValue();

            return string.IsNullOrWhiteSpace(value)
                ? new StringValue(defaultValue)
                : new StringValue(value);
        });

        // Phone format filter: {{ phone | phone_tr }}
        _templateOptions.Filters.AddFilter("phone_tr", (input, arguments, context) =>
        {
            var phone = input.ToStringValue();
            if (string.IsNullOrWhiteSpace(phone))
                return NilValue.Instance;

            // Remove non-digits
            var digits = new string(phone.Where(char.IsDigit).ToArray());

            // Format Turkish phone number
            if (digits.Length == 10)
            {
                return new StringValue($"({digits.Substring(0, 3)}) {digits.Substring(3, 3)} {digits.Substring(6, 2)} {digits.Substring(8, 2)}");
            }
            if (digits.Length == 11 && digits.StartsWith("0"))
            {
                digits = digits.Substring(1);
                return new StringValue($"({digits.Substring(0, 3)}) {digits.Substring(3, 3)} {digits.Substring(6, 2)} {digits.Substring(8, 2)}");
            }

            return new StringValue(phone);
        });
    }

    /// <inheritdoc />
    public async Task<LiquidRenderResult> RenderAsync(
        string template,
        object data,
        CancellationToken cancellationToken = default)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(template))
            {
                return LiquidRenderResult.Failure("Template cannot be empty");
            }

            if (!_parser.TryParse(template, out var parsedTemplate, out var errors))
            {
                var errorMessages = string.Join(", ", errors);
                _logger.LogError("Template parsing failed: {Errors}", errorMessages);
                return LiquidRenderResult.Failure($"Template syntax error: {errorMessages}");
            }

            var context = new TemplateContext(data, _templateOptions);
            var result = await parsedTemplate.RenderAsync(context);

            _logger.LogDebug("Template rendered successfully, output length: {Length}", result.Length);
            return LiquidRenderResult.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error rendering template");
            return LiquidRenderResult.Failure($"Failed to render template: {ex.Message}");
        }
    }

    /// <inheritdoc />
    public LiquidValidationResult ValidateTemplate(string template)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(template))
            {
                return LiquidValidationResult.Invalid("Template cannot be empty");
            }

            if (_parser.TryParse(template, out _, out var errors))
            {
                return LiquidValidationResult.Valid();
            }

            _logger.LogWarning("Template validation failed: {Errors}", string.Join(", ", errors));
            return LiquidValidationResult.Invalid(errors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating template");
            return LiquidValidationResult.Invalid($"Failed to validate template: {ex.Message}");
        }
    }

    /// <inheritdoc />
    public List<string> ExtractVariables(string template)
    {
        var variables = new HashSet<string>();

        if (string.IsNullOrWhiteSpace(template))
            return variables.ToList();

        // Match {{ variable }} patterns
        var outputPattern = new Regex(@"\{\{\s*([a-zA-Z_][a-zA-Z0-9_\.]*)", RegexOptions.Compiled);
        var outputMatches = outputPattern.Matches(template);

        foreach (Match match in outputMatches)
        {
            var variable = match.Groups[1].Value;
            // Get root variable (before any dot)
            var rootVariable = variable.Split('.')[0];
            variables.Add(rootVariable);
        }

        // Match {% for item in collection %} patterns
        var forPattern = new Regex(@"\{%\s*for\s+\w+\s+in\s+([a-zA-Z_][a-zA-Z0-9_]*)", RegexOptions.Compiled);
        var forMatches = forPattern.Matches(template);

        foreach (Match match in forMatches)
        {
            variables.Add(match.Groups[1].Value);
        }

        // Match {% if variable %} patterns
        var ifPattern = new Regex(@"\{%\s*if\s+([a-zA-Z_][a-zA-Z0-9_\.]*)", RegexOptions.Compiled);
        var ifMatches = ifPattern.Matches(template);

        foreach (Match match in ifMatches)
        {
            var variable = match.Groups[1].Value;
            var rootVariable = variable.Split('.')[0];
            variables.Add(rootVariable);
        }

        return variables.OrderBy(v => v).ToList();
    }
}
