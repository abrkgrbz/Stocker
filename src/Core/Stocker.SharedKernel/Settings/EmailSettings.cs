namespace Stocker.SharedKernel.Settings;

public class EmailSettings
{
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string SmtpUsername { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Stocker System";
    public int Timeout { get; set; } = 10000; // 10 seconds
    
    // Email features
    public bool EnableEmail { get; set; } = true;
    public bool RequireEmailVerification { get; set; } = true;
    
    // Email templates
    public string TemplatesPath { get; set; } = "EmailTemplates";
    public string BaseUrl { get; set; } = "http://localhost:3000"; // For generating links in emails
    
    // Rate limiting
    public int MaxEmailsPerHour { get; set; } = 100;
    public int MaxEmailsPerDay { get; set; } = 1000;
}