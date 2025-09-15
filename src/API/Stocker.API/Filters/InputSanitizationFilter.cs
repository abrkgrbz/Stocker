using Microsoft.AspNetCore.Mvc.Filters;
using System.Text.RegularExpressions;
using System.Web;
using System.Reflection;
using System.Collections;

namespace Stocker.API.Filters;

/// <summary>
/// Filter to sanitize input data and prevent XSS and SQL injection attacks
/// </summary>
public class InputSanitizationFilter : IActionFilter
{
    private readonly ILogger<InputSanitizationFilter> _logger;
    private readonly HashSet<string> _sqlKeywords;
    private readonly Regex _htmlTagRegex;
    private readonly Regex _scriptTagRegex;
    private readonly Regex _sqlInjectionRegex;

    public InputSanitizationFilter(ILogger<InputSanitizationFilter> logger)
    {
        _logger = logger;
        
        // Common SQL injection keywords
        _sqlKeywords = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER",
            "EXEC", "EXECUTE", "UNION", "JOIN", "WHERE", "FROM", "INTO",
            "SCRIPT", "JAVASCRIPT", "VBSCRIPT", "ONLOAD", "ONERROR", "ONCLICK",
            "XP_CMDSHELL", "SP_EXECUTESQL"
        };

        // Regex patterns for detection
        _htmlTagRegex = new Regex(@"<[^>]+>", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        _scriptTagRegex = new Regex(@"<script[^>]*>.*?</script>", RegexOptions.Compiled | RegexOptions.IgnoreCase | RegexOptions.Singleline);
        _sqlInjectionRegex = new Regex(@"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|JOIN)\b)|(-{2})|(/\*.*?\*/)", 
            RegexOptions.Compiled | RegexOptions.IgnoreCase);
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        // Skip sanitization in Testing environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment == "Testing")
        {
            return;
        }

        foreach (var argument in context.ActionArguments.ToList())
        {
            if (argument.Value == null)
                continue;

            var sanitizedValue = SanitizeValue(argument.Value);
            context.ActionArguments[argument.Key] = sanitizedValue;
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No implementation needed
    }

    private object? SanitizeValue(object? value)
    {
        // Skip sanitization in Testing environment
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT");
        if (environment == "Testing")
        {
            return value;
        }

        if (value == null)
            return null;

        var type = value.GetType();

        // Handle strings
        if (type == typeof(string))
        {
            return SanitizeString((string)value);
        }

        // Handle collections
        if (value is IEnumerable enumerable && !(value is string))
        {
            var list = new List<object?>();
            foreach (var item in enumerable)
            {
                list.Add(SanitizeValue(item));
            }
            return list;
        }

        // Handle complex objects
        if (type.IsClass && type != typeof(string))
        {
            foreach (var property in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!property.CanRead || !property.CanWrite)
                    continue;

                var propertyValue = property.GetValue(value);
                if (propertyValue != null)
                {
                    var sanitizedPropertyValue = SanitizeValue(propertyValue);
                    if (!ReferenceEquals(propertyValue, sanitizedPropertyValue))
                    {
                        property.SetValue(value, sanitizedPropertyValue);
                    }
                }
            }
        }

        return value;
    }

    private string SanitizeString(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        var original = input;
        
        // HTML encode to prevent XSS
        var sanitized = HttpUtility.HtmlEncode(input);

        // Check for potential SQL injection patterns
        if (ContainsSqlInjectionPattern(input))
        {
            _logger.LogWarning("Potential SQL injection detected and blocked: {Input}", input);
            // Remove SQL keywords and dangerous patterns
            sanitized = RemoveSqlPatterns(sanitized);
        }

        // Check for script tags
        if (_scriptTagRegex.IsMatch(input))
        {
            _logger.LogWarning("Script tag detected and removed: {Input}", input);
            sanitized = _scriptTagRegex.Replace(sanitized, string.Empty);
        }

        // Log if content was modified
        if (original != sanitized)
        {
            _logger.LogInformation("Input sanitized. Original length: {OriginalLength}, Sanitized length: {SanitizedLength}",
                original.Length, sanitized.Length);
        }

        return sanitized;
    }

    private bool ContainsSqlInjectionPattern(string input)
    {
        // Check for SQL injection patterns
        return _sqlInjectionRegex.IsMatch(input) || 
               ContainsSqlKeywords(input);
    }

    private bool ContainsSqlKeywords(string input)
    {
        var words = input.Split(new[] { ' ', '\t', '\n', '\r', ';', ',', '(', ')' }, StringSplitOptions.RemoveEmptyEntries);
        return words.Any(word => _sqlKeywords.Contains(word));
    }

    private string RemoveSqlPatterns(string input)
    {
        // Remove SQL comments
        input = Regex.Replace(input, @"--.*$", string.Empty, RegexOptions.Multiline);
        input = Regex.Replace(input, @"/\*.*?\*/", string.Empty, RegexOptions.Singleline);
        
        // Remove dangerous SQL keywords (but keep the rest of the text)
        foreach (var keyword in _sqlKeywords)
        {
            input = Regex.Replace(input, $@"\b{keyword}\b", string.Empty, RegexOptions.IgnoreCase);
        }

        return input.Trim();
    }
}