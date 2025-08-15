using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.Package;

namespace Stocker.Application.Features.Packages.Commands.CreatePackage;

public class CreatePackageCommand : IRequest<Result<PackageDto>>
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string BillingCycle { get; set; } = "Monthly";
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; }
    public bool IsActive { get; set; } = true;
    public List<PackageFeatureDto>? Features { get; set; }
    public List<PackageModuleDto>? Modules { get; set; }
    public string? CreatedBy { get; set; }
}