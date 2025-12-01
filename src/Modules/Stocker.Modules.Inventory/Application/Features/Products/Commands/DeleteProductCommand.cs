using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Command to delete a product
/// </summary>
public class DeleteProductCommand : IRequest<Result>
{
    public int TenantId { get; set; }
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
            .GreaterThan(0).WithMessage("Tenant ID is required");

        RuleFor(x => x.ProductId)
            .GreaterThan(0).WithMessage("Product ID is required");
    }
}

/// <summary>
/// Handler for DeleteProductCommand
/// </summary>
public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result>
{
    private readonly IProductRepository _productRepository;
    private readonly IStockRepository _stockRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductCommandHandler(
        IProductRepository productRepository,
        IStockRepository stockRepository,
        IUnitOfWork unitOfWork)
    {
        _productRepository = productRepository;
        _stockRepository = stockRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId, cancellationToken);
        if (product == null)
        {
            return Result.Failure(
                Error.NotFound("Product", $"Product with ID {request.ProductId} not found"));
        }

        var totalStock = await _stockRepository.GetTotalQuantityByProductAsync(request.ProductId, cancellationToken);
        if (totalStock > 0)
        {
            return Result.Failure(
                Error.Conflict("Product.Stock", "Cannot delete product with existing stock. Please adjust stock to zero first."));
        }

        // Soft delete using BaseEntity's Delete method
        product.Delete("System");
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
