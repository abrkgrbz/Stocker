using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Packages.Commands.UpdatePackage;

public class UpdatePackageCommand : IRequest<Result<bool>>
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public string BillingCycle { get; set; } = "Monthly";
    public int MaxUsers { get; set; }
    public int MaxStorage { get; set; }
    public bool IsActive { get; set; }
    public string? ModifiedBy { get; set; }
}