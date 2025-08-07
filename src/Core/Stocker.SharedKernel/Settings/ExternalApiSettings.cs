namespace Stocker.SharedKernel.Settings;

public class ExternalApiSettings
{
    public string? GoogleMapsApiKey { get; set; }
    public string? SendGridApiKey { get; set; }
    public string? TwilioAccountSid { get; set; }
    public string? TwilioAuthToken { get; set; }
    public string? TwilioPhoneNumber { get; set; }
    public string? StripeApiKey { get; set; }
    public string? StripeWebhookSecret { get; set; }
}