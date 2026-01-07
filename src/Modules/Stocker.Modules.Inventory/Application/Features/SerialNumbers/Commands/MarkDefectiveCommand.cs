using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;

public class MarkDefectiveCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int SerialNumberId { get; set; }
    public string? Reason { get; set; }
}

public class MarkDefectiveCommandHandler : IRequestHandler<MarkDefectiveCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public MarkDefectiveCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(MarkDefectiveCommand request, CancellationToken cancellationToken)
    {
        var serialNumber = await _unitOfWork.SerialNumbers.GetByIdAsync(request.SerialNumberId, cancellationToken);
        if (serialNumber == null)
        {
            return Result<bool>.Failure(new Error("SerialNumber.NotFound", $"Serial number with ID {request.SerialNumberId} not found", ErrorType.NotFound));
        }

        serialNumber.MarkDefective(request.Reason);
        await _unitOfWork.SerialNumbers.UpdateAsync(serialNumber, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
