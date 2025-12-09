using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Setup.Commands.CompleteSetup;

/// <summary>
/// Command to complete post-registration setup
/// Company billing information is collected later when user creates first invoice
/// </summary>
public sealed record CompleteSetupCommand : IRequest<Result<CompleteSetupResponse>>
{
    public Guid UserId { get; init; }
    public Guid TenantId { get; init; }

    /// <summary>
    /// Ready package ID (for pre-defined packages)
    /// </summary>
    public Guid? PackageId { get; init; }

    /// <summary>
    /// Custom package configuration (for user-built packages)
    /// </summary>
    public CustomPackageRequest? CustomPackage { get; init; }
}
