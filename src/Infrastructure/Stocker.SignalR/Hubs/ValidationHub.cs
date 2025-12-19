using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.SignalR.Constants;
// Use alias to avoid ambiguity with Application.Common.Interfaces types
using ValidationModels = Stocker.SignalR.Models.Validation;

namespace Stocker.SignalR.Hubs;

/// <summary>
/// Real-time validation hub for form inputs
/// </summary>
[AllowAnonymous]
public class ValidationHub : Hub
{
    private readonly IValidationService _validationService;
    private readonly ILogger<ValidationHub> _logger;

    public ValidationHub(
        IValidationService validationService,
        ILogger<ValidationHub> logger)
    {
        _validationService = validationService;
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("ValidationHub client connected: ConnectionId={ConnectionId}", Context.ConnectionId);
        await Clients.Caller.SendAsync(SignalREvents.Connected, new { connectionId = Context.ConnectionId });
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (exception != null)
        {
            _logger.LogError(exception, "ValidationHub client disconnected with error: ConnectionId={ConnectionId}", Context.ConnectionId);
        }
        else
        {
            _logger.LogInformation("ValidationHub client disconnected: ConnectionId={ConnectionId}", Context.ConnectionId);
        }
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Validate email format and check availability
    /// </summary>
    public async Task ValidateEmail(string email)
    {
        try
        {
            var validationResult = await _validationService.ValidateEmailAsync(email);

            var result = new ValidationModels.ValidationResult
            {
                IsValid = validationResult.IsValid,
                Message = validationResult.Message,
                Details = validationResult.Details
            };

            // Add additional details
            if (!string.IsNullOrEmpty(validationResult.SuggestedEmail))
            {
                result.Details["suggestedEmail"] = validationResult.SuggestedEmail;
            }

            if (validationResult.IsDisposable)
            {
                result.Details["isDisposable"] = "true";
            }

            await Clients.Caller.SendAsync(SignalREvents.EmailValidated, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating email: {Email}", email);
            await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Email doğrulama sırasında bir hata oluştu");
        }
    }

    /// <summary>
    /// Check password strength in real-time
    /// </summary>
    public async Task CheckPasswordStrength(string password)
    {
        try
        {
            var strengthResult = await _validationService.CheckPasswordStrengthAsync(password);

            var result = new ValidationModels.PasswordStrength
            {
                Score = strengthResult.Score,
                Level = strengthResult.Level,
                Color = strengthResult.Color,
                Suggestions = strengthResult.Suggestions.ToArray()
            };

            await Clients.Caller.SendAsync(SignalREvents.PasswordStrengthChecked, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking password strength");
            await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Şifre gücü kontrolü sırasında bir hata oluştu");
        }
    }

    /// <summary>
    /// Validate domain availability
    /// </summary>
    public async Task CheckDomain(string domain)
    {
        try
        {
            var domainResult = await _validationService.CheckDomainAvailabilityAsync(domain);

            var result = new ValidationModels.DomainCheckResult
            {
                IsAvailable = domainResult.IsAvailable,
                Message = domainResult.Message,
                Suggestions = domainResult.Suggestions.ToArray()
            };

            await Clients.Caller.SendAsync(SignalREvents.DomainChecked, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking domain: {Domain}", domain);
            await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Domain kontrolü sırasında bir hata oluştu");
        }
    }

    /// <summary>
    /// Validate phone number
    /// </summary>
    public async Task ValidatePhone(string phoneNumber, string countryCode = "TR")
    {
        try
        {
            var phoneResult = await _validationService.ValidatePhoneAsync(phoneNumber, countryCode);

            var result = new ValidationModels.ValidationResult
            {
                IsValid = phoneResult.IsValid,
                Message = phoneResult.Message,
                Details = phoneResult.Details
            };

            // Add formatted number if available
            if (!string.IsNullOrEmpty(phoneResult.FormattedNumber))
            {
                result.Details["formattedNumber"] = phoneResult.FormattedNumber;
            }

            if (!string.IsNullOrEmpty(phoneResult.Carrier))
            {
                result.Details["carrier"] = phoneResult.Carrier;
            }

            if (!string.IsNullOrEmpty(phoneResult.NumberType))
            {
                result.Details["numberType"] = phoneResult.NumberType;
            }

            await Clients.Caller.SendAsync(SignalREvents.PhoneValidated, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating phone: {PhoneNumber}", phoneNumber);
            await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Telefon doğrulama sırasında bir hata oluştu");
        }
    }

    /// <summary>
    /// Validate company name availability
    /// </summary>
    public async Task CheckCompanyName(string companyName)
    {
        try
        {
            var companyResult = await _validationService.ValidateCompanyNameAsync(companyName);

            var result = new ValidationModels.ValidationResult
            {
                IsValid = companyResult.IsValid,
                Message = companyResult.Message,
                Details = companyResult.Details
            };

            // Add similar names warning if any
            if (companyResult.SimilarNames.Any())
            {
                result.Details["similarNames"] = string.Join(", ", companyResult.SimilarNames);
            }

            await Clients.Caller.SendAsync(SignalREvents.CompanyNameChecked, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking company name: {CompanyName}", companyName);
            await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Şirket adı kontrolü sırasında bir hata oluştu");
        }
    }

    /// <summary>
    /// Validate tenant code availability for multi-tenant subdomain
    /// </summary>
    public async Task ValidateTenantCode(string code)
    {
        try
        {
            _logger.LogDebug("Validating tenant code: {Code}", code);

            var codeResult = await _validationService.ValidateTenantCodeAsync(code);

            var result = new ValidationModels.TenantCodeValidationResult
            {
                IsAvailable = codeResult.IsAvailable,
                Message = codeResult.Message,
                Code = code,
                SuggestedCodes = codeResult.SuggestedCodes?.ToArray() ?? Array.Empty<string>()
            };

            await Clients.Caller.SendAsync(SignalREvents.TenantCodeValidated, result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating tenant code: {Code}", code);
            await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Kod kontrolü sırasında bir hata oluştu");
        }
    }

    /// <summary>
    /// Validate Turkish ID Number (TC Kimlik No) or Tax Number (Vergi No)
    /// </summary>
    public async Task ValidateIdentity(string identityNumber)
    {
        try
        {
            _logger.LogDebug("Validating identity number for ConnectionId={ConnectionId}", Context.ConnectionId);

            var identityResult = await _validationService.ValidateIdentityNumberAsync(identityNumber);

            if (identityResult == null)
            {
                _logger.LogWarning("ValidationService returned null for identity validation");
                await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Doğrulama servisi yanıt vermedi");
                return;
            }

            var result = new ValidationModels.IdentityValidationResult
            {
                IsValid = identityResult.IsValid,
                Message = identityResult.Message ?? string.Empty,
                NumberType = identityResult.NumberType ?? string.Empty,
                Details = identityResult.Details ?? new Dictionary<string, string>()
            };

            // Add formatted number if available
            if (!string.IsNullOrEmpty(identityResult.FormattedNumber))
            {
                result.Details["formattedNumber"] = identityResult.FormattedNumber;
            }

            // Add test number warning if applicable
            if (identityResult.IsTestNumber)
            {
                result.Details["isTestNumber"] = "true";
            }

            await Clients.Caller.SendAsync(SignalREvents.IdentityValidated, result);
            _logger.LogDebug("Identity validation completed: IsValid={IsValid}", result.IsValid);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating identity number");
            await Clients.Caller.SendAsync(SignalREvents.ValidationError, "Kimlik doğrulama sırasında bir hata oluştu");
        }
    }
}
