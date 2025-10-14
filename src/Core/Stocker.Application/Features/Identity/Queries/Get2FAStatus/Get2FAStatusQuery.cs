using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.Get2FAStatus;

public record Get2FAStatusQuery : IRequest<Result<Get2FAStatusResponse>>
{
    public Guid UserId { get; init; }
}

public class Get2FAStatusResponse
{
    public bool Enabled { get; set; }
    public int BackupCodesRemaining { get; set; }
}
