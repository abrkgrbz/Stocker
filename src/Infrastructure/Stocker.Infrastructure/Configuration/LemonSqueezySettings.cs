namespace Stocker.Infrastructure.Configuration;

/// <summary>
/// Configuration settings for Lemon Squeezy payment integration.
/// </summary>
public class LemonSqueezySettings
{
    public const string SectionName = "LemonSqueezy";

    /// <summary>
    /// Lemon Squeezy API key (starts with "ls_live_" or "ls_test_")
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Lemon Squeezy Store ID
    /// </summary>
    public string StoreId { get; set; } = string.Empty;

    /// <summary>
    /// Webhook signing secret for verifying webhook authenticity
    /// </summary>
    public string WebhookSecret { get; set; } = string.Empty;

    /// <summary>
    /// Base URL for Lemon Squeezy API (default: https://api.lemonsqueezy.com/v1)
    /// </summary>
    public string BaseUrl { get; set; } = "https://api.lemonsqueezy.com/v1";

    /// <summary>
    /// Success URL to redirect after successful checkout
    /// </summary>
    public string? DefaultSuccessUrl { get; set; }

    /// <summary>
    /// Cancel URL to redirect if user cancels checkout
    /// </summary>
    public string? DefaultCancelUrl { get; set; }

    /// <summary>
    /// Product variant ID for monthly subscription
    /// </summary>
    public string? MonthlyVariantId { get; set; }

    /// <summary>
    /// Product variant ID for quarterly subscription (3 months)
    /// </summary>
    public string? QuarterlyVariantId { get; set; }

    /// <summary>
    /// Product variant ID for semi-annual subscription (6 months)
    /// </summary>
    public string? SemiAnnualVariantId { get; set; }

    /// <summary>
    /// Product variant ID for annual subscription
    /// </summary>
    public string? AnnualVariantId { get; set; }

    /// <summary>
    /// Enable test mode for development
    /// </summary>
    public bool TestMode { get; set; } = false;
}
