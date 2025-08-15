using MediatR;
using Stocker.Application.DTOs.Package;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Queries.GetPublicPackages;

public class GetPublicPackagesQuery : IRequest<Result<List<PackageDto>>>
{
    // No parameters needed - get all active public packages
}