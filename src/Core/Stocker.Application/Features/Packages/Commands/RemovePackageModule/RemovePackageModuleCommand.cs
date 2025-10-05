using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.RemovePackageModule;

public record RemovePackageModuleCommand : IRequest<Result<bool>>
{
    public Guid PackageId { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
}
