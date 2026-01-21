using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Products.Commands;

/// <summary>
/// Result of bulk status update operation
/// </summary>
public class BulkStatusResult
{
    public int TotalRequested { get; set; }
    public int SuccessCount { get; set; }
    public int FailedCount { get; set; }
    public List<BulkStatusError> Errors { get; set; } = new();
}

/// <summary>
/// Error detail for failed status update
/// </summary>
public class BulkStatusError
{
    public int Id { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Command to bulk activate products
/// </summary>
public class BulkActivateProductsCommand : IRequest<Result<BulkStatusResult>>
{
    public Guid TenantId { get; set; }
    public List<int> ProductIds { get; set; } = new();
}

/// <summary>
/// Validator for BulkActivateProductsCommand
/// </summary>
public class BulkActivateProductsCommandValidator : AbstractValidator<BulkActivateProductsCommand>
{
    public BulkActivateProductsCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.ProductIds).NotEmpty().WithMessage("En az bir ürün seçilmelidir");
        RuleFor(x => x.ProductIds.Count).LessThanOrEqualTo(100)
            .WithMessage("Aynı anda en fazla 100 ürün aktifleştirilebilir");
    }
}

/// <summary>
/// Handler for BulkActivateProductsCommand
/// </summary>
public class BulkActivateProductsCommandHandler : IRequestHandler<BulkActivateProductsCommand, Result<BulkStatusResult>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public BulkActivateProductsCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BulkStatusResult>> Handle(BulkActivateProductsCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkStatusResult
        {
            TotalRequested = request.ProductIds.Count
        };

        foreach (var productId in request.ProductIds)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);

                if (product == null)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = productId,
                        Reason = "Ürün bulunamadı"
                    });
                    continue;
                }

                if (product.IsActive)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = productId,
                        Reason = "Ürün zaten aktif"
                    });
                    continue;
                }

                product.Activate();
                _unitOfWork.Products.Update(product);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                result.Errors.Add(new BulkStatusError
                {
                    Id = productId,
                    Reason = ex.Message
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkStatusResult>.Success(result);
    }
}

/// <summary>
/// Command to bulk deactivate products
/// </summary>
public class BulkDeactivateProductsCommand : IRequest<Result<BulkStatusResult>>
{
    public Guid TenantId { get; set; }
    public List<int> ProductIds { get; set; } = new();
}

/// <summary>
/// Validator for BulkDeactivateProductsCommand
/// </summary>
public class BulkDeactivateProductsCommandValidator : AbstractValidator<BulkDeactivateProductsCommand>
{
    public BulkDeactivateProductsCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.ProductIds).NotEmpty().WithMessage("En az bir ürün seçilmelidir");
        RuleFor(x => x.ProductIds.Count).LessThanOrEqualTo(100)
            .WithMessage("Aynı anda en fazla 100 ürün pasifleştirilebilir");
    }
}

/// <summary>
/// Handler for BulkDeactivateProductsCommand
/// </summary>
public class BulkDeactivateProductsCommandHandler : IRequestHandler<BulkDeactivateProductsCommand, Result<BulkStatusResult>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public BulkDeactivateProductsCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BulkStatusResult>> Handle(BulkDeactivateProductsCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkStatusResult
        {
            TotalRequested = request.ProductIds.Count
        };

        foreach (var productId in request.ProductIds)
        {
            try
            {
                var product = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);

                if (product == null)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = productId,
                        Reason = "Ürün bulunamadı"
                    });
                    continue;
                }

                if (!product.IsActive)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = productId,
                        Reason = "Ürün zaten pasif"
                    });
                    continue;
                }

                product.Deactivate("system", "Bulk deactivation");
                _unitOfWork.Products.Update(product);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                result.Errors.Add(new BulkStatusError
                {
                    Id = productId,
                    Reason = ex.Message
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkStatusResult>.Success(result);
    }
}
