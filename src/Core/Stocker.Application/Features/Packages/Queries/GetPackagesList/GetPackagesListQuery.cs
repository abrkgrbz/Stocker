using MediatR;
using Stocker.Application.DTOs.Package;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Queries.GetPackagesList;

public record GetPackagesListQuery : IRequest<Result<List<PackageDto>>>
{
    public bool OnlyActive { get; init; } = true;
}