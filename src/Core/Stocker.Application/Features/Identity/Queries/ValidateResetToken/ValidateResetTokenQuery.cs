using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.ValidateResetToken;

public record ValidateResetTokenQuery : IRequest<Result<ValidateResetTokenResponse>>
{
    public string Token { get; init; } = string.Empty;
}

public class ValidateResetTokenResponse
{
    public bool Valid { get; set; }
    public DateTime ExpiresAt { get; set; }
}
