using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.Modules.Inventory.Application.Features.Products.Commands;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Commands;

/// <summary>
/// Command to bulk activate categories
/// </summary>
public class BulkActivateCategoriesCommand : IRequest<Result<BulkStatusResult>>
{
    public Guid TenantId { get; set; }
    public List<int> CategoryIds { get; set; } = new();
}

/// <summary>
/// Validator for BulkActivateCategoriesCommand
/// </summary>
public class BulkActivateCategoriesCommandValidator : AbstractValidator<BulkActivateCategoriesCommand>
{
    public BulkActivateCategoriesCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.CategoryIds).NotEmpty().WithMessage("En az bir kategori seçilmelidir");
        RuleFor(x => x.CategoryIds.Count).LessThanOrEqualTo(50)
            .WithMessage("Aynı anda en fazla 50 kategori aktifleştirilebilir");
    }
}

/// <summary>
/// Handler for BulkActivateCategoriesCommand
/// </summary>
public class BulkActivateCategoriesCommandHandler : IRequestHandler<BulkActivateCategoriesCommand, Result<BulkStatusResult>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public BulkActivateCategoriesCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BulkStatusResult>> Handle(BulkActivateCategoriesCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkStatusResult
        {
            TotalRequested = request.CategoryIds.Count
        };

        foreach (var categoryId in request.CategoryIds)
        {
            try
            {
                var category = await _unitOfWork.Categories.GetByIdAsync(categoryId, cancellationToken);

                if (category == null)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = categoryId,
                        Reason = "Kategori bulunamadı"
                    });
                    continue;
                }

                if (category.IsActive)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = categoryId,
                        Reason = "Kategori zaten aktif"
                    });
                    continue;
                }

                category.Activate();
                _unitOfWork.Categories.Update(category);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                result.Errors.Add(new BulkStatusError
                {
                    Id = categoryId,
                    Reason = ex.Message
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkStatusResult>.Success(result);
    }
}

/// <summary>
/// Command to bulk deactivate categories
/// </summary>
public class BulkDeactivateCategoriesCommand : IRequest<Result<BulkStatusResult>>
{
    public Guid TenantId { get; set; }
    public List<int> CategoryIds { get; set; } = new();
}

/// <summary>
/// Validator for BulkDeactivateCategoriesCommand
/// </summary>
public class BulkDeactivateCategoriesCommandValidator : AbstractValidator<BulkDeactivateCategoriesCommand>
{
    public BulkDeactivateCategoriesCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.CategoryIds).NotEmpty().WithMessage("En az bir kategori seçilmelidir");
        RuleFor(x => x.CategoryIds.Count).LessThanOrEqualTo(50)
            .WithMessage("Aynı anda en fazla 50 kategori pasifleştirilebilir");
    }
}

/// <summary>
/// Handler for BulkDeactivateCategoriesCommand
/// </summary>
public class BulkDeactivateCategoriesCommandHandler : IRequestHandler<BulkDeactivateCategoriesCommand, Result<BulkStatusResult>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public BulkDeactivateCategoriesCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BulkStatusResult>> Handle(BulkDeactivateCategoriesCommand request, CancellationToken cancellationToken)
    {
        var result = new BulkStatusResult
        {
            TotalRequested = request.CategoryIds.Count
        };

        foreach (var categoryId in request.CategoryIds)
        {
            try
            {
                var category = await _unitOfWork.Categories.GetByIdAsync(categoryId, cancellationToken);

                if (category == null)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = categoryId,
                        Reason = "Kategori bulunamadı"
                    });
                    continue;
                }

                if (!category.IsActive)
                {
                    result.FailedCount++;
                    result.Errors.Add(new BulkStatusError
                    {
                        Id = categoryId,
                        Reason = "Kategori zaten pasif"
                    });
                    continue;
                }

                category.Deactivate();
                _unitOfWork.Categories.Update(category);
                result.SuccessCount++;
            }
            catch (Exception ex)
            {
                result.FailedCount++;
                result.Errors.Add(new BulkStatusError
                {
                    Id = categoryId,
                    Reason = ex.Message
                });
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<BulkStatusResult>.Success(result);
    }
}
