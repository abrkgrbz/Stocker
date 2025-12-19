using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;

/// <summary>
/// Command to delete a product bundle
/// </summary>
public class DeleteProductBundleCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int BundleId { get; set; }
}

/// <summary>
/// Validator for DeleteProductBundleCommand
/// </summary>
public class DeleteProductBundleCommandValidator : AbstractValidator<DeleteProductBundleCommand>
{
    public DeleteProductBundleCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BundleId).NotEmpty();
    }
}

/// <summary>
/// Handler for DeleteProductBundleCommand
/// </summary>
public class DeleteProductBundleCommandHandler : IRequestHandler<DeleteProductBundleCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteProductBundleCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductBundleCommand request, CancellationToken cancellationToken)
    {
        var bundle = await _unitOfWork.ProductBundles.GetByIdAsync(request.BundleId, cancellationToken);

        if (bundle == null)
        {
            return Result.Failure(
                new Error("ProductBundle.NotFound", $"Product bundle with ID {request.BundleId} not found", ErrorType.NotFound));
        }

        // Check if bundle is currently active and in use
        if (bundle.IsActive)
        {
            return Result.Failure(
                new Error("ProductBundle.IsActive", "Cannot delete an active bundle. Deactivate it first.", ErrorType.Validation));
        }

        _unitOfWork.ProductBundles.Remove(bundle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
