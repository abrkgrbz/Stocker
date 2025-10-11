using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Queries.CheckEmail;

public record CheckEmailQuery : IRequest<Result<CheckEmailResponse>>
{
    public string Email { get; init; } = string.Empty;
}

public class CheckEmailResponse
{
    public bool Exists { get; set; }
    public TenantInfo? Tenant { get; set; }
}

public class TenantInfo
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Signature { get; set; } = string.Empty;
    public long Timestamp { get; set; }
}
