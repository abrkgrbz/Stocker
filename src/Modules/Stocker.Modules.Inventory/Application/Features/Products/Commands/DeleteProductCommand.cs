using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Command to delete a product
/// </summary>
public class DeleteProductCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ProductId { get; set; }
}

/// <summary>
/// Validator for DeleteProductCommand
/// </summary>
public class DeleteProductCommandValidator : AbstractValidator<DeleteProductCommand>
{
    public DeleteProductCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.ProductId)
            .NotEmpty().WithMessage("Ürün kimliği gereklidir");
    }
}

/// <summary>
/// Handler for DeleteProductCommand
/// </summary>
public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteProductCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result.Failure(
                Error.NotFound("Product", $"Ürün bulunamadı (ID: {request.ProductId})"));
        }

        var totalStock = await _unitOfWork.Stocks.GetTotalQuantityByProductAsync(request.ProductId, cancellationToken);
        if (totalStock > 0)
        {
            return Result.Failure(
                Error.Conflict("Product.Stock", "Stoku olan ürün silinemez. Önce stok miktarını sıfırlayın."));
        }

        // Soft delete using BaseEntity's Delete method
        product.Delete("System");
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
