using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Models;
using Stocker.Application.Common.Interfaces;
using Stocker.Infrastructure.Services;
using Base = Stocker.API.Controllers.Base;

namespace Stocker.API.Controllers.Public;

/// <summary>
/// Public validation endpoints for form inputs
/// </summary>
[AllowAnonymous]
[Route("api/public/validate")]
[ApiExplorerSettings(GroupName = "public")]
public class ValidationController : Base.ApiController
{
    private readonly IValidationService _validationService;
    private readonly ILogger<ValidationController> _logger;

    public ValidationController(
        IValidationService validationService,
        ILogger<ValidationController> logger)
    {
        _validationService = validationService;
        _logger = logger;
    }

    /// <summary>
    /// Validate email address format and availability
    /// </summary>
    /// <param name="email">Email address to validate</param>
    /// <returns>Email validation result</returns>
    [HttpPost("email")]
    [ProducesResponseType(typeof(Base.ApiResponse<EmailValidationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateEmail([FromBody] EmailValidationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            throw new Stocker.Application.Common.Exceptions.ValidationException("Email", "Email adresi boş olamaz");

        var result = await _validationService.ValidateEmailAsync(request.Email);
        
        var response = new EmailValidationResponse
        {
            IsValid = result.IsValid,
            Message = result.Message,
            NormalizedEmail = result.NormalizedEmail,
            IsDisposable = result.IsDisposable,
            HasMxRecord = result.HasMxRecord,
            SuggestedEmail = result.SuggestedEmail,
            Details = result.Details
        };

        return Ok(response);
    }

    /// <summary>
    /// Validate phone number format and carrier
    /// </summary>
    /// <param name="request">Phone validation request</param>
    /// <returns>Phone validation result</returns>
    [HttpPost("phone")]
    [ProducesResponseType(typeof(Base.ApiResponse<PhoneValidationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidatePhone([FromBody] PhoneValidationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
            throw new Stocker.Application.Common.Exceptions.ValidationException("PhoneNumber", "Telefon numarası boş olamaz");

        var result = await _validationService.ValidatePhoneAsync(
            request.PhoneNumber, 
            request.CountryCode ?? "TR");
        
        var response = new PhoneValidationResponse
        {
            IsValid = result.IsValid,
            Message = result.Message,
            FormattedNumber = result.FormattedNumber,
            CountryCode = result.CountryCode,
            CountryName = result.CountryName,
            Carrier = result.Carrier,
            NumberType = result.NumberType,
            Details = result.Details
        };

        return Ok(response);
    }

    /// <summary>
    /// Check password strength
    /// </summary>
    /// <param name="request">Password strength check request</param>
    /// <returns>Password strength result</returns>
    [HttpPost("password-strength")]
    [ProducesResponseType(typeof(Base.ApiResponse<PasswordStrengthResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckPasswordStrength([FromBody] PasswordStrengthRequest request)
    {
        var result = await _validationService.CheckPasswordStrengthAsync(request.Password);
        
        var response = new PasswordStrengthResponse
        {
            Score = result.Score,
            Level = result.Level,
            Color = result.Color,
            Suggestions = result.Suggestions,
            HasLowercase = result.HasLowercase,
            HasUppercase = result.HasUppercase,
            HasNumbers = result.HasNumbers,
            HasSpecialChars = result.HasSpecialChars,
            Length = result.Length,
            ContainsCommonPassword = result.ContainsCommonPassword,
            EntropyBits = result.EntropyBits
        };

        return Ok(response);
    }

    /// <summary>
    /// Check domain availability
    /// </summary>
    /// <param name="request">Domain check request</param>
    /// <returns>Domain availability result</returns>
    [HttpPost("domain")]
    [ProducesResponseType(typeof(Base.ApiResponse<DomainCheckResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CheckDomain([FromBody] DomainCheckRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Domain))
            throw new Stocker.Application.Common.Exceptions.ValidationException("Domain", "Domain adı boş olamaz");

        var result = await _validationService.CheckDomainAvailabilityAsync(request.Domain);
        
        var response = new DomainCheckResponse
        {
            IsAvailable = result.IsAvailable,
            Message = result.Message,
            Suggestions = result.Suggestions,
            CurrentOwner = result.CurrentOwner,
            IsPremium = result.IsPremium,
            Details = result.Details
        };

        return Ok(response);
    }

    /// <summary>
    /// Validate company name availability
    /// </summary>
    /// <param name="request">Company name validation request</param>
    /// <returns>Company name validation result</returns>
    [HttpPost("company-name")]
    [ProducesResponseType(typeof(Base.ApiResponse<CompanyNameValidationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateCompanyName([FromBody] CompanyNameValidationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CompanyName))
            throw new Stocker.Application.Common.Exceptions.ValidationException("CompanyName", "Şirket adı boş olamaz");

        var result = await _validationService.ValidateCompanyNameAsync(request.CompanyName);
        
        var response = new CompanyNameValidationResponse
        {
            IsValid = result.IsValid,
            Message = result.Message,
            IsUnique = result.IsUnique,
            ContainsRestrictedWords = result.ContainsRestrictedWords,
            SimilarNames = result.SimilarNames,
            Details = result.Details
        };

        return Ok(response);
    }

    /// <summary>
    /// Validate Turkish ID Number (TC Kimlik No) or Tax Number (Vergi No)
    /// </summary>
    /// <param name="request">Identity validation request</param>
    /// <returns>Identity validation result</returns>
    [HttpPost("identity")]
    [ProducesResponseType(typeof(Base.ApiResponse<IdentityValidationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ValidateIdentity([FromBody] IdentityValidationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdentityNumber))
            throw new Stocker.Application.Common.Exceptions.ValidationException("IdentityNumber", "Kimlik/Vergi numarası boş olamaz");

        var result = await _validationService.ValidateIdentityNumberAsync(request.IdentityNumber);
        
        var response = new IdentityValidationResponse
        {
            IsValid = result.IsValid,
            Message = result.Message,
            NumberType = result.NumberType,
            FormattedNumber = result.FormattedNumber,
            IsTestNumber = result.IsTestNumber,
            Details = result.Details
        };

        return Ok(response);
    }
}

#region Request/Response DTOs

public class EmailValidationRequest
{
    public string Email { get; set; } = string.Empty;
}

public class EmailValidationResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? NormalizedEmail { get; set; }
    public bool IsDisposable { get; set; }
    public bool HasMxRecord { get; set; }
    public string? SuggestedEmail { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}

public class PhoneValidationRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string? CountryCode { get; set; }
}

public class PhoneValidationResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? FormattedNumber { get; set; }
    public string? CountryCode { get; set; }
    public string? CountryName { get; set; }
    public string? Carrier { get; set; }
    public string? NumberType { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}

public class PasswordStrengthRequest
{
    public string Password { get; set; } = string.Empty;
}

public class PasswordStrengthResponse
{
    public int Score { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Color { get; set; } = string.Empty;
    public List<string> Suggestions { get; set; } = new();
    public bool HasLowercase { get; set; }
    public bool HasUppercase { get; set; }
    public bool HasNumbers { get; set; }
    public bool HasSpecialChars { get; set; }
    public int Length { get; set; }
    public bool ContainsCommonPassword { get; set; }
    public double EntropyBits { get; set; }
}

public class DomainCheckRequest
{
    public string Domain { get; set; } = string.Empty;
}

public class DomainCheckResponse
{
    public bool IsAvailable { get; set; }
    public string Message { get; set; } = string.Empty;
    public List<string> Suggestions { get; set; } = new();
    public string? CurrentOwner { get; set; }
    public bool IsPremium { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}

public class CompanyNameValidationRequest
{
    public string CompanyName { get; set; } = string.Empty;
}

public class CompanyNameValidationResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public bool IsUnique { get; set; }
    public bool ContainsRestrictedWords { get; set; }
    public List<string> SimilarNames { get; set; } = new();
    public Dictionary<string, string> Details { get; set; } = new();
}

public class IdentityValidationRequest
{
    public string IdentityNumber { get; set; } = string.Empty;
}

public class IdentityValidationResponse
{
    public bool IsValid { get; set; }
    public string Message { get; set; } = string.Empty;
    public string NumberType { get; set; } = string.Empty;
    public string? FormattedNumber { get; set; }
    public bool IsTestNumber { get; set; }
    public Dictionary<string, string> Details { get; set; } = new();
}

#endregion