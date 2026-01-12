using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Commands;

/// <summary>
/// Command to activate a brand
/// </summary>
public class ActivateBrandCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int BrandId { get; set; }
}

/// <summary>
/// Handler for ActivateBrandCommand
/// </summary>
public class ActivateBrandCommandHandler : IRequestHandler<ActivateBrandCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateBrandCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _unitOfWork.Brands.GetByIdAsync(request.BrandId, cancellationToken);

        if (brand == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Brand", $"Marka bulunamadı (ID: {request.BrandId})"));
        }

        // Verify tenant ownership
        if (brand.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Brand", $"Marka bulunamadı (ID: {request.BrandId})"));
        }

        brand.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
