using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.DeletePackage;

public class DeletePackageCommand : IRequest<Result<bool>>
{
    public Guid PackageId { get; set; }
}