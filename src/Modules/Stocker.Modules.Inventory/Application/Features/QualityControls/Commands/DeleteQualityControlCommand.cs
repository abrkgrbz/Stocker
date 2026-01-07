using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.QualityControls.Commands;

/// <summary>
/// Command to delete/cancel a quality control inspection
/// </summary>
public class DeleteQualityControlCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? CancellationReason { get; set; }
}

/// <summary>
/// Validator for DeleteQualityControlCommand
/// </summary>
public class DeleteQualityControlCommandValidator : AbstractValidator<DeleteQualityControlCommand>
{
    public DeleteQualityControlCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteQualityControlCommand
/// </summary>
public class DeleteQualityControlCommandHandler : IRequestHandler<DeleteQualityControlCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteQualityControlCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteQualityControlCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.QualityControls.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("QualityControl.NotFound", $"Quality control with ID {request.Id} not found", ErrorType.NotFound));
        }

        // Cannot delete completed QC records
        if (entity.Status == QualityControlStatus.Completed)
        {
            return Result<bool>.Failure(new Error("QualityControl.CannotDeleteCompleted", "Cannot delete completed quality control records", ErrorType.Validation));
        }

        // Cancel instead of hard delete for audit trail
        entity.Cancel(request.CancellationReason ?? "Deleted by user");
        await _unitOfWork.QualityControls.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
