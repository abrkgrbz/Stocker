using Stocker.SharedKernel.Results;

namespace Stocker.Identity.Services;

public class ApplicationPasswordValidatorWrapper : Application.Common.Interfaces.IPasswordValidator
{
    private readonly Identity.Services.IPasswordValidator _innerValidator;

    public ApplicationPasswordValidatorWrapper(Identity.Services.IPasswordValidator innerValidator)
    {
        _innerValidator = innerValidator;
    }

    public Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null)
    {
        return _innerValidator.ValidatePassword(plainPassword, username, email);
    }

    public Application.Common.Interfaces.PasswordStrength CalculateStrength(string plainPassword)
    {
        var strength = _innerValidator.CalculateStrength(plainPassword);
        // Map PasswordScore enum to PasswordStrength enum
        return (Application.Common.Interfaces.PasswordStrength)(int)strength.Score;
    }
}