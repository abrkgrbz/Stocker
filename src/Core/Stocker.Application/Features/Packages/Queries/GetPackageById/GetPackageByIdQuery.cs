using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Package;

namespace Stocker.Application.Features.Packages.Queries.GetPackageById;

public class GetPackageByIdQuery : IRequest<Result<PackageDto>>
{
    public Guid Id { get; set; }

    public GetPackageByIdQuery(Guid id)
    {
        Id = id;
    }
}