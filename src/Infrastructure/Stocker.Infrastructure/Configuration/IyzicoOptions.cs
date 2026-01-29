namespace Stocker.Infrastructure.Configuration;

/// <summary>
/// Configuration options for Iyzico payment gateway
/// </summary>
public class IyzicoOptions
{
    public const string SectionName = "Iyzico";

    /// <summary>
    /// Iyzico API Key
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Iyzico Secret Key
    /// </summary>
    public string SecretKey { get; set; } = string.Empty;

    /// <summary>
    /// Base URL for Iyzico API
    /// Sandbox: https://sandbox-api.iyzipay.com
    /// Production: https://api.iyzipay.com
    /// </summary>
    public string BaseUrl { get; set; } = "https://sandbox-api.iyzipay.com";

    /// <summary>
    /// Callback URL for 3D Secure and payment results
    /// </summary>
    public string CallbackUrl { get; set; } = string.Empty;

    /// <summary>
    /// Whether to use sandbox mode
    /// </summary>
    public bool UseSandbox { get; set; } = true;

    /// <summary>
    /// Webhook secret for validating incoming webhooks
    /// </summary>
    public string? WebhookSecret { get; set; }

    /// <summary>
    /// Default currency for payments
    /// </summary>
    public string DefaultCurrency { get; set; } = "TRY";

    /// <summary>
    /// Default locale for Iyzico forms
    /// </summary>
    public string DefaultLocale { get; set; } = "tr";

    /// <summary>
    /// Enable 3D Secure by default
    /// </summary>
    public bool Enable3DSecure { get; set; } = true;

    /// <summary>
    /// Enable installment options
    /// </summary>
    public bool EnableInstallment { get; set; } = true;

    /// <summary>
    /// Maximum allowed installment count
    /// </summary>
    public int MaxInstallmentCount { get; set; } = 12;

    /// <summary>
    /// Connection timeout in seconds
    /// </summary>
    public int TimeoutSeconds { get; set; } = 30;

    /// <summary>
    /// Validate configuration
    /// </summary>
    public bool IsValid => !string.IsNullOrEmpty(ApiKey) && !string.IsNullOrEmpty(SecretKey);
}
