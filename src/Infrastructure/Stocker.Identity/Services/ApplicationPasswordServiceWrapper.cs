using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Results;

namespace Stocker.Identity.Services;

public class ApplicationPasswordServiceWrapper : Application.Common.Interfaces.IPasswordService
{
    private readonly Identity.Services.IPasswordService _innerService;

    public ApplicationPasswordServiceWrapper(Identity.Services.IPasswordService innerService)
    {
        _innerService = innerService;
    }

    public Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null)
    {
        return _innerService.ValidatePassword(plainPassword, username, email);
    }

    public HashedPassword CreateHashedPassword(string plainPassword, string? username = null, string? email = null)
    {
        return _innerService.CreateHashedPassword(plainPassword, username, email);
    }

    public HashedPassword HashPassword(string plainPassword)
    {
        return _innerService.CreateHashedPassword(plainPassword);
    }

    public bool VerifyPassword(HashedPassword hashedPassword, string plainPassword)
    {
        return _innerService.VerifyPassword(hashedPassword, plainPassword);
    }

    public string GetCombinedHash(HashedPassword hashedPassword)
    {
        return _innerService.GetCombinedHash(hashedPassword);
    }

    public Application.Common.Interfaces.PasswordStrength CalculatePasswordStrength(string plainPassword)
    {
        var strength = _innerService.CalculatePasswordStrength(plainPassword);
        // Map PasswordScore enum to PasswordStrength enum
        return (Application.Common.Interfaces.PasswordStrength)(int)strength.Score;
    }
}