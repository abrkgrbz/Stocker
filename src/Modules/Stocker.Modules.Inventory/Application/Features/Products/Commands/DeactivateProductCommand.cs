using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Command to deactivate a product
/// </summary>
public class DeactivateProductCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
}

/// <summary>
/// Handler for DeactivateProductCommand
/// </summary>
public class DeactivateProductCommandHandler : IRequestHandler<DeactivateProductCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeactivateProductCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeactivateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result.Failure(Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        product.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
