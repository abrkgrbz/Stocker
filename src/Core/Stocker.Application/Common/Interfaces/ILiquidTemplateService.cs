namespace Stocker.Application.Common.Interfaces;

/// <summary>
/// Service interface for rendering Liquid templates
/// </summary>
public interface ILiquidTemplateService
{
    /// <summary>
    /// Renders a Liquid template with the provided data
    /// </summary>
    /// <param name="template">The Liquid template string</param>
    /// <param name="data">The data object to use for variable substitution</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The rendered template string or error</returns>
    Task<LiquidRenderResult> RenderAsync(
        string template,
        object data,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates a Liquid template syntax
    /// </summary>
    /// <param name="template">The Liquid template string to validate</param>
    /// <returns>Validation result with any errors</returns>
    LiquidValidationResult ValidateTemplate(string template);

    /// <summary>
    /// Extracts variable names from a Liquid template
    /// </summary>
    /// <param name="template">The Liquid template string</param>
    /// <returns>List of variable names found in the template</returns>
    List<string> ExtractVariables(string template);
}

/// <summary>
/// Result of a Liquid template render operation
/// </summary>
public class LiquidRenderResult
{
    public bool IsSuccess { get; private set; }
    public string? RenderedContent { get; private set; }
    public string? ErrorMessage { get; private set; }

    private LiquidRenderResult() { }

    public static LiquidRenderResult Success(string content)
    {
        return new LiquidRenderResult
        {
            IsSuccess = true,
            RenderedContent = content
        };
    }

    public static LiquidRenderResult Failure(string errorMessage)
    {
        return new LiquidRenderResult
        {
            IsSuccess = false,
            ErrorMessage = errorMessage
        };
    }
}

/// <summary>
/// Result of a Liquid template validation operation
/// </summary>
public class LiquidValidationResult
{
    public bool IsValid { get; private set; }
    public List<string> Errors { get; private set; } = new();

    private LiquidValidationResult() { }

    public static LiquidValidationResult Valid()
    {
        return new LiquidValidationResult { IsValid = true };
    }

    public static LiquidValidationResult Invalid(IEnumerable<string> errors)
    {
        return new LiquidValidationResult
        {
            IsValid = false,
            Errors = errors.ToList()
        };
    }

    public static LiquidValidationResult Invalid(string error)
    {
        return new LiquidValidationResult
        {
            IsValid = false,
            Errors = new List<string> { error }
        };
    }
}
