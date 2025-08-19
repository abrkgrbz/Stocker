using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;

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
        _logger.LogInformation("Client connected: {ConnectionId}", Context.ConnectionId);
        await Clients.Caller.SendAsync("Connected", new { connectionId = Context.ConnectionId });
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {ConnectionId}", Context.ConnectionId);
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
            
            var result = new ValidationResult
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

            await Clients.Caller.SendAsync("EmailValidated", result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating email");
            await Clients.Caller.SendAsync("ValidationError", "Email doğrulama sırasında bir hata oluştu");
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
            
            var result = new PasswordStrength
            {
                Score = strengthResult.Score,
                Level = strengthResult.Level,
                Color = strengthResult.Color,
                Suggestions = strengthResult.Suggestions.ToArray()
            };

            await Clients.Caller.SendAsync("PasswordStrengthChecked", result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking password strength");
            await Clients.Caller.SendAsync("ValidationError", "Şifre gücü kontrolü sırasında bir hata oluştu");
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
            
            var result = new DomainCheckResult
            {
                IsAvailable = domainResult.IsAvailable,
                Message = domainResult.Message,
                Suggestions = domainResult.Suggestions.ToArray()
            };

            await Clients.Caller.SendAsync("DomainChecked", result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking domain");
            await Clients.Caller.SendAsync("ValidationError", "Domain kontrolü sırasında bir hata oluştu");
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
            
            var result = new ValidationResult
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

            await Clients.Caller.SendAsync("PhoneValidated", result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating phone");
            await Clients.Caller.SendAsync("ValidationError", "Telefon doğrulama sırasında bir hata oluştu");
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
            
            var result = new ValidationResult
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

            await Clients.Caller.SendAsync("CompanyNameChecked", result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking company name");
            await Clients.Caller.SendAsync("ValidationError", "Şirket adı kontrolü sırasında bir hata oluştu");
        }
    }

    /// <summary>
    /// Validate Turkish ID Number (TC Kimlik No) or Tax Number (Vergi No)
    /// </summary>
    public async Task ValidateIdentity(string identityNumber)
    {
        try
        {
            var identityResult = await _validationService.ValidateIdentityNumberAsync(identityNumber);
            
            var result = new IdentityValidationResult
            {
                IsValid = identityResult.IsValid,
                Message = identityResult.Message,
                NumberType = identityResult.NumberType,
                Details = identityResult.Details
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

            await Clients.Caller.SendAsync("IdentityValidated", result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error validating identity number");
            await Clients.Caller.SendAsync("ValidationError", "Kimlik/Vergi numarası kontrolü sırasında bir hata oluştu");
        }
    }
}

#region DTOs

public class ValidationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public Dictionary<string, string> Details { get; set; } = new();
}

public class PasswordStrength
{
    public int Score { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public string[] Suggestions { get; set; } = Array.Empty<string>();
}

public class DomainCheckResult
{
    public bool IsAvailable { get; set; }
    public string Message { get; set; } = string.Empty;
    public string[] Suggestions { get; set; } = Array.Empty<string>();
}

public class IdentityValidationResult
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string NumberType { get; set; } = string.Empty;
    public Dictionary<string, string> Details { get; set; } = new();
}

#endregion