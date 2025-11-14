using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Email.Commands.SendTestEmail;

/// <summary>
/// Command to send a test email
/// </summary>
public record SendTestEmailCommand(
    string To,
    string? Subject = null
) : IRequest<Result>;
