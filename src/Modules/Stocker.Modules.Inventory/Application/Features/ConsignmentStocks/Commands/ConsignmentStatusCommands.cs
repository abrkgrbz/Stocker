using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ConsignmentStocks.Commands;

/// <summary>
/// Command to suspend a consignment stock
/// </summary>
public class SuspendConsignmentStockCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ConsignmentStockId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for SuspendConsignmentStockCommand
/// </summary>
public class SuspendConsignmentStockCommandHandler : IRequestHandler<SuspendConsignmentStockCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public SuspendConsignmentStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(SuspendConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var consignment = await _unitOfWork.ConsignmentStocks.GetByIdAsync(request.ConsignmentStockId, cancellationToken);

        if (consignment == null)
        {
            return Result.Failure(new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.TenantId != request.TenantId)
        {
            return Result.Failure(new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.Status != Domain.Entities.ConsignmentStatus.Active)
        {
            return Result.Failure(new Error("ConsignmentStock.NotActive", "Sadece aktif konsinye stoklar askıya alınabilir", ErrorType.Validation));
        }

        consignment.Suspend(request.Reason);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

/// <summary>
/// Command to reactivate a suspended consignment stock
/// </summary>
public class ReactivateConsignmentStockCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ConsignmentStockId { get; set; }
}

/// <summary>
/// Handler for ReactivateConsignmentStockCommand
/// </summary>
public class ReactivateConsignmentStockCommandHandler : IRequestHandler<ReactivateConsignmentStockCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ReactivateConsignmentStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(ReactivateConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var consignment = await _unitOfWork.ConsignmentStocks.GetByIdAsync(request.ConsignmentStockId, cancellationToken);

        if (consignment == null)
        {
            return Result.Failure(new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.TenantId != request.TenantId)
        {
            return Result.Failure(new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.Status != Domain.Entities.ConsignmentStatus.Suspended)
        {
            return Result.Failure(new Error("ConsignmentStock.NotSuspended", "Sadece askıya alınmış konsinye stoklar yeniden aktifleştirilebilir", ErrorType.Validation));
        }

        consignment.Reactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

/// <summary>
/// Command to close a consignment stock
/// </summary>
public class CloseConsignmentStockCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int ConsignmentStockId { get; set; }
    public string Reason { get; set; } = string.Empty;
}

/// <summary>
/// Handler for CloseConsignmentStockCommand
/// </summary>
public class CloseConsignmentStockCommandHandler : IRequestHandler<CloseConsignmentStockCommand, Result>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CloseConsignmentStockCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(CloseConsignmentStockCommand request, CancellationToken cancellationToken)
    {
        var consignment = await _unitOfWork.ConsignmentStocks.GetByIdAsync(request.ConsignmentStockId, cancellationToken);

        if (consignment == null)
        {
            return Result.Failure(new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.TenantId != request.TenantId)
        {
            return Result.Failure(new Error("ConsignmentStock.NotFound", "Konsinye stok bulunamadı", ErrorType.NotFound));
        }

        if (consignment.Status == Domain.Entities.ConsignmentStatus.Closed)
        {
            return Result.Failure(new Error("ConsignmentStock.AlreadyClosed", "Konsinye stok zaten kapalı", ErrorType.Validation));
        }

        consignment.Close(request.Reason);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
