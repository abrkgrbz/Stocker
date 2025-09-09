namespace Stocker.Application.Common.Interfaces;

public interface ICaptchaService
{
    Task<bool> VerifyAsync(string token, string? remoteIp = null, CancellationToken cancellationToken = default);
    Task<CaptchaVerificationResult> VerifyDetailedAsync(string token, string? remoteIp = null, CancellationToken cancellationToken = default);
}

public class CaptchaVerificationResult
{
    public bool Success { get; set; }
    public DateTime ChallengeTimestamp { get; set; }
    public string? Hostname { get; set; }
    public double Score { get; set; } // For reCAPTCHA v3
    public string? Action { get; set; } // For reCAPTCHA v3
    public List<string> ErrorCodes { get; set; } = new();
}