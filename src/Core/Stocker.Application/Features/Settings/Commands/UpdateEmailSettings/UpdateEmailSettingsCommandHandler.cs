using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Entities.Settings;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Settings.Commands.UpdateEmailSettings;

public sealed class UpdateEmailSettingsCommandHandler : IRequestHandler<UpdateEmailSettingsCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;
    private readonly IEncryptionService _encryptionService;
    private readonly ILogger<UpdateEmailSettingsCommandHandler> _logger;

    public UpdateEmailSettingsCommandHandler(
        IApplicationDbContext context,
        IEncryptionService encryptionService,
        ILogger<UpdateEmailSettingsCommandHandler> logger)
    {
        _context = context;
        _encryptionService = encryptionService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(UpdateEmailSettingsCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Updating email settings");

            // Update or create SMTP Host
            await UpdateOrCreateSettingAsync("Smtp.Host", request.SmtpHost, "Email", cancellationToken);
            
            // Update or create SMTP Port
            await UpdateOrCreateSettingAsync("Smtp.Port", request.SmtpPort.ToString(), "Email", cancellationToken);
            
            // Update or create SMTP Username
            await UpdateOrCreateSettingAsync("Smtp.Username", request.SmtpUsername, "Email", cancellationToken);
            
            // Update or create SMTP Password - ENCRYPTED!
            if (!string.IsNullOrEmpty(request.SmtpPassword))
            {
                // Only update if password is provided (not masked)
                if (request.SmtpPassword != "********")
                {
                    var encryptedPassword = _encryptionService.Encrypt(request.SmtpPassword);
                    await UpdateOrCreateSettingAsync("Smtp.Password", encryptedPassword, "Email", cancellationToken);
                    _logger.LogInformation("SMTP password encrypted and saved successfully");
                }
            }
            else
            {
                // If empty password, clear it
                await UpdateOrCreateSettingAsync("Smtp.Password", string.Empty, "Email", cancellationToken);
            }
            
            // Update or create EnableSsl
            await UpdateOrCreateSettingAsync("Smtp.EnableSsl", request.EnableSsl.ToString(), "Email", cancellationToken);
            
            // Update or create FromEmail
            await UpdateOrCreateSettingAsync("Email.FromAddress", request.FromEmail, "Email", cancellationToken);
            
            // Update or create FromName
            await UpdateOrCreateSettingAsync("Email.FromName", request.FromName, "Email", cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);
            
            _logger.LogInformation("Email settings updated successfully");
            return Result.Success(true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating email settings");
            return Result.Failure<bool>(new Error("UpdateEmailSettings.Failed", 
                "Failed to update email settings", 
                ErrorType.Failure));
        }
    }

    private async Task UpdateOrCreateSettingAsync(string key, string value, string category, CancellationToken cancellationToken)
    {
        var setting = await _context.SystemSettings
            .FirstOrDefaultAsync(s => s.Key == key, cancellationToken);

        if (setting == null)
        {
            // Create new setting
            var isEncrypted = key == "Smtp.Password";
            setting = new SystemSettings(
                category,
                key,
                value,
                GetSettingDescription(key),
                false, // isSystem - these are user-configurable settings
                isEncrypted
            );
            _context.SystemSettings.Add(setting);
        }
        else
        {
            // Update existing setting
            setting.UpdateValue(value);
        }
    }

    private string GetSettingDescription(string key)
    {
        return key switch
        {
            "Smtp.Host" => "SMTP server host address",
            "Smtp.Port" => "SMTP server port number",
            "Smtp.Username" => "SMTP authentication username",
            "Smtp.Password" => "SMTP authentication password (encrypted)",
            "Smtp.EnableSsl" => "Enable SSL/TLS for SMTP connection",
            "Email.FromAddress" => "Default sender email address",
            "Email.FromName" => "Default sender display name",
            _ => string.Empty
        };
    }
}