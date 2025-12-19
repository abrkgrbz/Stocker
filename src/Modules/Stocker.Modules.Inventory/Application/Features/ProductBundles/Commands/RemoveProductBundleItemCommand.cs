using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductBundles.Commands;

/// <summary>
/// Command to remove an item from a product bundle
/// </summary>
public class RemoveProductBundleItemCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int BundleId { get; set; }
    public int ItemId { get; set; }
}

/// <summary>
/// Validator for RemoveProductBundleItemCommand
/// </summary>
public class RemoveProductBundleItemCommandValidator : AbstractValidator<RemoveProductBundleItemCommand>
{
    public RemoveProductBundleItemCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BundleId).NotEmpty();
        RuleFor(x => x.ItemId).NotEmpty();
    }
}

/// <summary>
/// Handler for RemoveProductBundleItemCommand
/// </summary>
public class RemoveProductBundleItemCommandHandler : IRequestHandler<RemoveProductBundleItemCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public RemoveProductBundleItemCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(RemoveProductBundleItemCommand request, CancellationToken cancellationToken)
    {
        var bundle = await _unitOfWork.ProductBundles.GetWithItemsAsync(request.BundleId, cancellationToken);

        if (bundle == null)
        {
            return Result.Failure(
                new Error("ProductBundle.NotFound", $"Product bundle with ID {request.BundleId} not found", ErrorType.NotFound));
        }

        var item = bundle.Items?.FirstOrDefault(i => i.Id == request.ItemId);
        if (item == null)
        {
            return Result.Failure(
                new Error("ProductBundleItem.NotFound", $"Bundle item with ID {request.ItemId} not found", ErrorType.NotFound));
        }

        // Check minimum items for bundle validity
        if (bundle.Items?.Count <= 1)
        {
            return Result.Failure(
                new Error("ProductBundle.MinimumItems", "Cannot remove the last item from a bundle", ErrorType.Validation));
        }

        bundle.RemoveItem(item.ProductId);

        _unitOfWork.ProductBundles.Update(bundle);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
