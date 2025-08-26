using MediatR;
using Stocker.Application.DTOs.Settings;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Settings.Commands.UpdateGeneralSettings;

public class UpdateGeneralSettingsCommand : IRequest<Result<bool>>
{
    public string SiteName { get; set; } = string.Empty;
    public string SiteUrl { get; set; } = string.Empty;
    public string AdminEmail { get; set; } = string.Empty;
    public string DefaultLanguage { get; set; } = string.Empty;
    public string DefaultTimezone { get; set; } = string.Empty;
    public string DateFormat { get; set; } = string.Empty;
    public string TimeFormat { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public int MaxUploadSize { get; set; }
    public bool AllowRegistration { get; set; }
    public bool RequireEmailVerification { get; set; }
    public bool MaintenanceMode { get; set; }
}