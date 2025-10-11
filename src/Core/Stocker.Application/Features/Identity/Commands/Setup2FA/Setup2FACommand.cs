using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Setup2FA;

public record Setup2FACommand : IRequest<Result<Setup2FAResponse>>
{
    public Guid UserId { get; init; }
}

public class Setup2FAResponse
{
    public string Secret { get; set; } = string.Empty;
    public string QrCodeUrl { get; set; } = string.Empty;
    public string ManualEntryKey { get; set; } = string.Empty;
    public List<string> BackupCodes { get; set; } = new();
}
