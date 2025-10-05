using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.AddPackageFeature;

public record AddPackageFeatureCommand : IRequest<Result<bool>>
{
    public Guid PackageId { get; set; }
    public string FeatureCode { get; set; } = string.Empty;
    public string FeatureName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsHighlighted { get; set; }
}
