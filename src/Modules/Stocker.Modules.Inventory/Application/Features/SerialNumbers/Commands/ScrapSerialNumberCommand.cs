using MediatR;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;

public class ScrapSerialNumberCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int SerialNumberId { get; set; }
    public string? Reason { get; set; }
}

public class ScrapSerialNumberCommandHandler : IRequestHandler<ScrapSerialNumberCommand, Result<bool>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public ScrapSerialNumberCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ScrapSerialNumberCommand request, CancellationToken cancellationToken)
    {
        var serialNumber = await _unitOfWork.SerialNumbers.GetByIdAsync(request.SerialNumberId, cancellationToken);
        if (serialNumber == null)
        {
            return Result<bool>.Failure(new Error("SerialNumber.NotFound", $"Serial number with ID {request.SerialNumberId} not found", ErrorType.NotFound));
        }

        serialNumber.Scrap(request.Reason);
        await _unitOfWork.SerialNumbers.UpdateAsync(serialNumber, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
