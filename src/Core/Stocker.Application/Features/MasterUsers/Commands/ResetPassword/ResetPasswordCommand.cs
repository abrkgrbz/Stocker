using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.ResetPassword;

public class ResetPasswordCommand : IRequest<Result<string>>
{
    public Guid UserId { get; set; }
    public string? NewPassword { get; set; } // If null, generate random password
    public string? ResetBy { get; set; }
}