using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.AddPackageModule;

public record AddPackageModuleCommand : IRequest<Result<bool>>
{
    public Guid PackageId { get; set; }
    public string ModuleCode { get; set; } = string.Empty;
    public string ModuleName { get; set; } = string.Empty;
    public bool IsIncluded { get; set; } = true;
    public int? MaxEntities { get; set; }
}
