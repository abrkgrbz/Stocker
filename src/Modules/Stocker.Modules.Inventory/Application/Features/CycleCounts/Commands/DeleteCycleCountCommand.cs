using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.CycleCounts.Commands;

/// <summary>
/// Command to delete/cancel a cycle count
/// </summary>
public class DeleteCycleCountCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? CancellationReason { get; set; }
}

/// <summary>
/// Validator for DeleteCycleCountCommand
/// </summary>
public class DeleteCycleCountCommandValidator : AbstractValidator<DeleteCycleCountCommand>
{
    public DeleteCycleCountCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteCycleCountCommand
/// </summary>
public class DeleteCycleCountCommandHandler : IRequestHandler<DeleteCycleCountCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteCycleCountCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteCycleCountCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.CycleCounts.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("CycleCount.NotFound", $"Cycle count with ID {request.Id} not found", ErrorType.NotFound));
        }

        try
        {
            entity.Cancel(request.CancellationReason ?? "Deleted by user");
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("CycleCount.InvalidOperation", ex.Message, ErrorType.Validation));
        }

        await _unitOfWork.CycleCounts.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
