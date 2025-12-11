using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ConsignmentStocks.Commands;

/// <summary>
/// Command to delete/close a consignment stock
/// </summary>
public class DeleteConsignmentStockCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
    public string? Reason { get; set; }
}

/// <summary>
/// Validator for DeleteConsignmentStockCommand
/// </summary>
public class DeleteConsignmentStockCommandValidator : AbstractValidator<DeleteConsignmentStockCommand>
{
    public DeleteConsignmentStockCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.Id).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteConsignmentStockCommand
/// </summary>
public class DeleteConsignmentStockCommandHandler : IRequestHandler<DeleteConsignmentStockCommand, Result<bool>>
{
    private readonly IConsignmentStockRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteConsignmentStockCommandHandler(IConsignmentStockRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.NotFound", $"Consignment stock with ID {request.Id} not found", ErrorType.NotFound));
        }

        // Cannot delete if there's outstanding quantity or amount
        if (entity.CurrentQuantity > 0)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.HasStock", "Cannot delete consignment with remaining stock. Return to supplier first.", ErrorType.Validation));
        }

        if (entity.OutstandingAmount > 0)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.HasOutstanding", "Cannot delete consignment with outstanding payment.", ErrorType.Validation));
        }

        try
        {
            entity.Close(request.Reason ?? "Deleted by user");
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.InvalidOperation", ex.Message, ErrorType.Validation));
        }

        await _repository.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
