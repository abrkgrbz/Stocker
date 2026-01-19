using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
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
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Geçerli bir konsinye stok ID'si gereklidir");
    }
}

/// <summary>
/// Handler for DeleteConsignmentStockCommand
/// </summary>
public class DeleteConsignmentStockCommandHandler : IRequestHandler<DeleteConsignmentStockCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public DeleteConsignmentStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.ConsignmentStocks.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.NotFound", $"Konsinye stok kaydı bulunamadı (ID: {request.Id})", ErrorType.NotFound));
        }

        // Cannot delete if there's outstanding quantity or amount
        if (entity.CurrentQuantity > 0)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.HasStock", "Stoku olan konsinye kaydı silinemez. Önce tedarikçiye iade yapın.", ErrorType.Validation));
        }

        if (entity.OutstandingAmount > 0)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.HasOutstanding", "Ödenmemiş tutarı olan konsinye kaydı silinemez.", ErrorType.Validation));
        }

        try
        {
            entity.Close(request.Reason ?? "Kullanıcı tarafından silindi");
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("ConsignmentStock.InvalidOperation", ex.Message, ErrorType.Validation));
        }

        await _unitOfWork.ConsignmentStocks.UpdateAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
