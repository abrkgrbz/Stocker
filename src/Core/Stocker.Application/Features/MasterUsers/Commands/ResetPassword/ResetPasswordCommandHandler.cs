using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Extensions;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;
using System.Security.Cryptography;

namespace Stocker.Application.Features.MasterUsers.Commands.ResetPassword;

public class ResetPasswordCommandHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IPasswordService _passwordService;
    private readonly IPasswordValidator _passwordValidator;
    private readonly ILogger<ResetPasswordCommandHandler> _logger;

    public ResetPasswordCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IPasswordService passwordService,
        IPasswordValidator passwordValidator,
        ILogger<ResetPasswordCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _passwordService = passwordService;
        _passwordValidator = passwordValidator;
        _logger = logger;
    }

    public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var user = await _unitOfWork.MasterUsers()
                .GetByIdAsync(request.UserId, cancellationToken);

            if (user == null)
            {
                return Result<string>.Failure(
                    Error.NotFound("MasterUser.NotFound", "Kullanıcı bulunamadı"));
            }

            string newPassword;

            if (string.IsNullOrEmpty(request.NewPassword))
            {
                // Generate random password
                newPassword = GenerateRandomPassword();
            }
            else
            {
                newPassword = request.NewPassword;

                // Validate provided password
                var passwordValidation = _passwordValidator.ValidatePassword(newPassword, user.Username, user.Email.Value);
                if (!passwordValidation.IsSuccess)
                {
                    return Result<string>.Failure(passwordValidation.Error);
                }
            }

            // Hash the new password
            var hashedPassword = _passwordService.CreateHashedPassword(newPassword, user.Username, user.Email.Value);

            // Update user password using ChangePassword method
            user.ChangePassword(hashedPassword.Hash, hashedPassword.Salt);

            await _unitOfWork.MasterUsers().UpdateAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("Password reset for user {UserId} ({Username}) by {ResetBy}", 
                user.Id, user.Username, request.ResetBy);

            return Result<string>.Success(newPassword);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resetting password for user {UserId}", request.UserId);
            return Result<string>.Failure(
                Error.Failure("MasterUser.ResetPasswordFailed", "Şifre sıfırlama işlemi başarısız oldu"));
        }
    }

    private string GenerateRandomPassword()
    {
        const string upperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const string lowerCase = "abcdefghijklmnopqrstuvwxyz";
        const string digits = "0123456789";
        const string special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        const string allChars = upperCase + lowerCase + digits + special;

        var password = new char[16];
        var random = RandomNumberGenerator.Create();
        var bytes = new byte[16];
        random.GetBytes(bytes);

        // Ensure at least one character from each category
        password[0] = upperCase[bytes[0] % upperCase.Length];
        password[1] = lowerCase[bytes[1] % lowerCase.Length];
        password[2] = digits[bytes[2] % digits.Length];
        password[3] = special[bytes[3] % special.Length];

        // Fill the rest randomly
        for (int i = 4; i < 16; i++)
        {
            password[i] = allChars[bytes[i] % allChars.Length];
        }

        // Shuffle the password
        for (int i = password.Length - 1; i > 0; i--)
        {
            random.GetBytes(bytes, 0, 1);
            int j = bytes[0] % (i + 1);
            (password[i], password[j]) = (password[j], password[i]);
        }

        return new string(password);
    }
}