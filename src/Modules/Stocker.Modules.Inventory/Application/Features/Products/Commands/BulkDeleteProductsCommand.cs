using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Command to bulk delete products
/// </summary>
public class BulkDeleteProductsCommand : IRequest<Result<BulkDeleteResult>>
{
    public Guid TenantId { get; set; }
    public List<int> ProductIds { get; set; } = new();
}

/// <summary>
/// Result of bulk delete operation
/// </summary>
public class BulkDeleteResult
{
    public int TotalRequested { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<BulkDeleteError> Errors { get; set; } = new();
}

/// <summary>
/// Error detail for failed delete
/// </summary>
public class BulkDeleteError
{
    public int Id { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Validator for BulkDeleteProductsCommand
/// </summary>
public class BulkDeleteProductsCommandValidator : AbstractValidator<BulkDeleteProductsCommand>
{
    public BulkDeleteProductsCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.ProductIds).NotEmpty().WithMessage("En az bir ürün seçilmelidir");
        RuleFor(x => x.ProductIds.Count).LessThanOrEqualTo(100)
            .WithMessage("Aynı anda en fazla 100 ürün silinebilir");
    }
}

/// <summary>
/// Handler for BulkDeleteProductsCommand
/// </summary>
public class BulkDeleteProductsCommandHandler : IRequestHandler<BulkDeleteProductsCommand, Result<BulkDeleteResult>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public BulkDeleteProductsCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BulkDeleteResult>> Handle(BulkDeleteProductsCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkDeleteResult
        {
            TotalRequested = request.ProductIds.Count
        };

        foreach (var productId in request.ProductIds)
        {
            try
            {
                var product = await _unitOfWork.Products.GetWithDetailsAsync(productId, cancellationToken);

                if (product == null)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkDeleteError
                    {
                        Id = productId,
                        Reason = "Ürün bulunamadı"
                    });
                    continue;
                }

                // Check if product has stock
                var hasStock = await _unitOfWork.Stocks.HasStockAsync(productId, cancellationToken);
                if (hasStock)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkDeleteError
                    {
                        Id = productId,
                        Reason = "Ürünün stoğu bulunmaktadır"
                    });
                    continue;
                }

                // Soft delete the product
                product.Delete("system");
                _unitOfWork.Products.Update(product);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                result.Errors.Add(new BulkDeleteError
                {
                    Id = productId,
                    Reason = ex.Message
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkDeleteResult>.Success(result);
    }
}
