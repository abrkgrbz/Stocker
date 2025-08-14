using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Interfaces;

public interface IPasswordService
{
    Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null);
    HashedPassword CreateHashedPassword(string plainPassword, string? username = null, string? email = null);
    HashedPassword HashPassword(string plainPassword); // Simplified version
    bool VerifyPassword(HashedPassword hashedPassword, string plainPassword);
    string GetCombinedHash(HashedPassword hashedPassword);
    PasswordStrength CalculatePasswordStrength(string plainPassword);
}

public interface IPasswordValidator
{
    Result<bool> ValidatePassword(string plainPassword, string? username = null, string? email = null);
    PasswordStrength CalculateStrength(string plainPassword);
}

public enum PasswordStrength
{
    VeryWeak = 0,
    Weak = 1,
    Fair = 2,
    Good = 3,
    Strong = 4,
    VeryStrong = 5
}