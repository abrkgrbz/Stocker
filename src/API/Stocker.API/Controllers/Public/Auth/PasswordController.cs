using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.API.Controllers.Public;

[ApiController]
[Route("api/public/password")]
public class PasswordController : ControllerBase
{
    private readonly IPasswordService _passwordService;

    public PasswordController(IPasswordService passwordService)
    {
        _passwordService = passwordService;
    }

    /// <summary>
    /// Check password strength without saving
    /// </summary>
    [HttpPost("check-strength")]
    public IActionResult CheckPasswordStrength([FromBody] PasswordCheckRequest request)
    {
        var strength = _passwordService.CalculatePasswordStrength(request.Password);
        
        return Ok(new
        {
            success = true,
            data = new
            {
                score = (int)strength,
                scoreLabel = GetScoreLabel(strength),
                isAcceptable = (int)strength >= (int)PasswordStrength.Good // Minimum score requirement
            }
        });
    }

    /// <summary>
    /// Validate password against policy
    /// </summary>
    [HttpPost("validate")]
    public IActionResult ValidatePassword([FromBody] PasswordValidationRequest request)
    {
        var result = _passwordService.ValidatePassword(
            request.Password, 
            request.Username, 
            request.Email);

        if (result.IsSuccess)
        {
            var strength = _passwordService.CalculatePasswordStrength(request.Password);
            
            return Ok(new
            {
                success = true,
                message = "Şifre geçerli",
                data = new
                {
                    isValid = true,
                    score = (int)strength,
                    scoreLabel = GetScoreLabel(strength)
                }
            });
        }

        return BadRequest(new
        {
            success = false,
            message = "Şifre politikaya uygun değil",
            errors = result.Errors.Select(e => new
            {
                code = e.Code,
                message = e.Description
            })
        });
    }

    private string GetScoreLabel(PasswordStrength strength)
    {
        return strength switch
        {
            PasswordStrength.VeryWeak => "Çok Zayıf",
            PasswordStrength.Weak => "Zayıf",
            PasswordStrength.Fair => "Orta",
            PasswordStrength.Good => "Güçlü",
            PasswordStrength.Strong => "Çok Güçlü",
            PasswordStrength.VeryStrong => "Mükemmel",
            _ => "Bilinmiyor"
        };
    }
}

public class PasswordCheckRequest
{
    public string Password { get; set; } = string.Empty;
}

public class PasswordValidationRequest
{
    public string Password { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? Email { get; set; }
}