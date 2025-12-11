using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.InventoryAdjustments.Commands;

/// <summary>
/// Command to delete/cancel an inventory adjustment
/// </summary>
public class DeleteInventoryAdjustmentCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? CancellationReason { get; set; }
}

/// <summary>
/// Validator for DeleteInventoryAdjustmentCommand
/// </summary>
public class DeleteInventoryAdjustmentCommandValidator : AbstractValidator<DeleteInventoryAdjustmentCommand>
{
    public DeleteInventoryAdjustmentCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteInventoryAdjustmentCommand
/// </summary>
public class DeleteInventoryAdjustmentCommandHandler : IRequestHandler<DeleteInventoryAdjustmentCommand, Result<bool>>
{
    private readonly IInventoryAdjustmentRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteInventoryAdjustmentCommandHandler(IInventoryAdjustmentRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteInventoryAdjustmentCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("InventoryAdjustment.NotFound", $"Inventory adjustment with ID {request.Id} not found", ErrorType.NotFound));
        }

        try
        {
            entity.Cancel(request.CancellationReason ?? "Deleted by user");
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("InventoryAdjustment.InvalidOperation", ex.Message, ErrorType.Validation));
        }

        await _repository.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
