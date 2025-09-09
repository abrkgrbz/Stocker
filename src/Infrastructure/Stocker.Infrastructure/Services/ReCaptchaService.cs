using System.Text.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

namespace Stocker.Infrastructure.Services;

public class ReCaptchaService : ICaptchaService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<ReCaptchaService> _logger;
    private readonly string _secretKey;
    private readonly bool _skipVerification;

    public ReCaptchaService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<ReCaptchaService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _secretKey = configuration["ReCaptcha:SecretKey"] ?? "";
        _skipVerification = configuration.GetValue<bool>("ReCaptcha:SkipVerification");
    }

    public async Task<bool> VerifyAsync(string token, string? remoteIp = null, CancellationToken cancellationToken = default)
    {
        var result = await VerifyDetailedAsync(token, remoteIp, cancellationToken);
        return result.Success;
    }

    public async Task<CaptchaVerificationResult> VerifyDetailedAsync(string token, string? remoteIp = null, CancellationToken cancellationToken = default)
    {
        // Skip verification in development or if configured
        if (_skipVerification || string.IsNullOrEmpty(_secretKey))
        {
            _logger.LogWarning("Captcha verification skipped (development mode or no secret key)");
            return new CaptchaVerificationResult
            {
                Success = true,
                ChallengeTimestamp = DateTime.UtcNow,
                Score = 1.0
            };
        }

        try
        {
            var parameters = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("secret", _secretKey),
                new KeyValuePair<string, string>("response", token),
                new KeyValuePair<string, string>("remoteip", remoteIp ?? "")
            });

            var response = await _httpClient.PostAsync(
                "https://www.google.com/recaptcha/api/siteverify",
                parameters,
                cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("ReCaptcha API returned status code: {StatusCode}", response.StatusCode);
                return new CaptchaVerificationResult
                {
                    Success = false,
                    ErrorCodes = new List<string> { "api-error" }
                };
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var result = JsonSerializer.Deserialize<ReCaptchaResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result == null)
            {
                _logger.LogError("Failed to deserialize ReCaptcha response");
                return new CaptchaVerificationResult
                {
                    Success = false,
                    ErrorCodes = new List<string> { "invalid-response" }
                };
            }

            return new CaptchaVerificationResult
            {
                Success = result.Success,
                ChallengeTimestamp = result.ChallengeTs ?? DateTime.UtcNow,
                Hostname = result.Hostname,
                Score = result.Score ?? 0,
                Action = result.Action,
                ErrorCodes = result.ErrorCodes ?? new List<string>()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying ReCaptcha");
            return new CaptchaVerificationResult
            {
                Success = false,
                ErrorCodes = new List<string> { "exception", ex.Message }
            };
        }
    }

    private class ReCaptchaResponse
    {
        public bool Success { get; set; }
        public DateTime? ChallengeTs { get; set; }
        public string? Hostname { get; set; }
        public double? Score { get; set; }
        public string? Action { get; set; }
        public List<string>? ErrorCodes { get; set; }
    }
}