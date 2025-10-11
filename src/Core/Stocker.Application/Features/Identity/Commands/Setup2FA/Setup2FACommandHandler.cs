using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OtpNet;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;
using System.Security.Cryptography;
using System.Text;

namespace Stocker.Application.Features.Identity.Commands.Setup2FA;

public class Setup2FACommandHandler : IRequestHandler<Setup2FACommand, Result<Setup2FAResponse>>
{
    private readonly ILogger<Setup2FACommandHandler> _logger;
    private readonly IMasterDbContext _masterContext;

    public Setup2FACommandHandler(
        ILogger<Setup2FACommandHandler> logger,
        IMasterDbContext masterContext)
    {
        _logger = logger;
        _masterContext = masterContext;
    }

    public async Task<Result<Setup2FAResponse>> Handle(Setup2FACommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Setting up 2FA for user: {UserId}", request.UserId);

        try
        {
            // Find user
            var user = await _masterContext.Users
                .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

            if (user == null)
            {
                return Result.Failure<Setup2FAResponse>(
                    Error.NotFound("User.NotFound", "User not found"));
            }

            // Generate TOTP secret (Base32 encoded)
            var secretBytes = RandomNumberGenerator.GetBytes(20); // 160 bits
            var secret = Base32Encoding.ToString(secretBytes);

            // Create OtpAuth URL for QR code
            var issuer = "Stocker ERP";
            var qrCodeUrl = $"otpauth://totp/{Uri.EscapeDataString(issuer)}:{Uri.EscapeDataString(user.Email)}?" +
                           $"secret={secret}&issuer={Uri.EscapeDataString(issuer)}&algorithm=SHA1&digits=6&period=30";

            // Format manual entry key (easier to type)
            var manualEntryKey = FormatManualEntryKey(secret);

            // Generate 10 backup codes
            var backupCodes = GenerateBackupCodes(10);

            // Store secret in user record (will be activated after verification)
            // NOTE: In production, encrypt the secret before storing
            user.TwoFactorSecret = secret;
            user.BackupCodes = string.Join(",", backupCodes.Select(c => $"{c}:false")); // code:used format

            await _masterContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("2FA setup completed for user: {UserId}", request.UserId);

            return Result.Success(new Setup2FAResponse
            {
                Secret = secret,
                QrCodeUrl = qrCodeUrl,
                ManualEntryKey = manualEntryKey,
                BackupCodes = backupCodes
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting up 2FA for user: {UserId}", request.UserId);
            return Result.Failure<Setup2FAResponse>(
                Error.Failure("2FA.SetupError", "Failed to setup 2FA"));
        }
    }

    private static string FormatManualEntryKey(string secret)
    {
        // Format as: XXXX XXXX XXXX XXXX
        var formatted = new StringBuilder();
        for (int i = 0; i < secret.Length; i++)
        {
            if (i > 0 && i % 4 == 0)
                formatted.Append(' ');
            formatted.Append(secret[i]);
        }
        return formatted.ToString();
    }

    private static List<string> GenerateBackupCodes(int count)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Exclude confusing chars (0,O,1,I)
        var codes = new List<string>();

        for (int i = 0; i < count; i++)
        {
            var codeBytes = RandomNumberGenerator.GetBytes(8);
            var code = new StringBuilder(8);

            foreach (var b in codeBytes)
            {
                code.Append(chars[b % chars.Length]);
            }

            // Format as: XXXX-XXXX
            var formatted = $"{code.ToString().Substring(0, 4)}-{code.ToString().Substring(4, 4)}";
            codes.Add(formatted);
        }

        return codes;
    }
}
