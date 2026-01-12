using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Categories.Commands;

/// <summary>
/// Command to activate a category
/// </summary>
public class ActivateCategoryCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int CategoryId { get; set; }
}

/// <summary>
/// Handler for ActivateCategoryCommand
/// </summary>
public class ActivateCategoryCommandHandler : IRequestHandler<ActivateCategoryCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ActivateCategoryCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId, cancellationToken);
        
        if (category == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Category", $"Category with ID {request.CategoryId} not found"));
        }

        // Verify tenant ownership
        if (category.TenantId != request.TenantId)
        {
            return Result<bool>.Failure(
                Error.NotFound("Category", $"Category with ID {request.CategoryId} not found"));
        }

        category.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
