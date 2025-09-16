using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Settings.Commands.UpdateEmailSettings;

public sealed record UpdateEmailSettingsCommand : IRequest<Result<bool>>
{
    public bool EnableEmail { get; init; } = true;
    public string Provider { get; init; } = "SMTP";
    public string SmtpHost { get; init; } = string.Empty;
    public int SmtpPort { get; init; }
    public string SmtpUsername { get; init; } = string.Empty;
    public string SmtpPassword { get; init; } = string.Empty;
    public bool SmtpEnableSsl { get; init; } = true;
    public string SmtpEncryption { get; init; } = "SSL";
    public string FromEmail { get; init; } = string.Empty;
    public string FromName { get; init; } = string.Empty;
}