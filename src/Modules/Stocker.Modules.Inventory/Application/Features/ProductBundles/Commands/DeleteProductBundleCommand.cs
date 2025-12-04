using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;

/// <summary>
/// Command to delete a product bundle
/// </summary>
public class DeleteProductBundleCommand : IRequest<Result>
{
    public int TenantId { get; set; }
    public int BundleId { get; set; }
}

/// <summary>
/// Validator for DeleteProductBundleCommand
/// </summary>
public class DeleteProductBundleCommandValidator : AbstractValidator<DeleteProductBundleCommand>
{
    public DeleteProductBundleCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.BundleId).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteProductBundleCommand
/// </summary>
public class DeleteProductBundleCommandHandler : IRequestHandler<DeleteProductBundleCommand, Result>
{
    private readonly IProductBundleRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductBundleCommandHandler(IProductBundleRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductBundleCommand request, CancellationToken cancellationToken)
    {
        var bundle = await _repository.GetByIdAsync(request.BundleId, cancellationToken);

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

        _repository.Remove(bundle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
