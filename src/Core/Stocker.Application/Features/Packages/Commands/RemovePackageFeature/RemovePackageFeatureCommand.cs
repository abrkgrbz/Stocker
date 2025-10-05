using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.RemovePackageFeature;

public record RemovePackageFeatureCommand : IRequest<Result<bool>>
{
    public Guid PackageId { get; set; }
    public string FeatureCode { get; set; } = string.Empty;
}
