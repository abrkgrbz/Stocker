using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;

public class ReceiveSerialNumberCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int SerialNumberId { get; set; }
    public Guid? PurchaseOrderId { get; set; }
}

public class ReceiveSerialNumberCommandHandler : IRequestHandler<ReceiveSerialNumberCommand, Result<bool>>
{
    private readonly ISerialNumberRepository _serialNumberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public ReceiveSerialNumberCommandHandler(ISerialNumberRepository serialNumberRepository, IUnitOfWork unitOfWork)
    {
        _serialNumberRepository = serialNumberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ReceiveSerialNumberCommand request, CancellationToken cancellationToken)
    {
        var serialNumber = await _serialNumberRepository.GetByIdAsync(request.SerialNumberId, cancellationToken);
        if (serialNumber == null)
        {
            return Result<bool>.Failure(new Error("SerialNumber.NotFound", $"Serial number with ID {request.SerialNumberId} not found", ErrorType.NotFound));
        }

        try
        {
            serialNumber.Receive(request.PurchaseOrderId);
            await _serialNumberRepository.UpdateAsync(serialNumber, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("SerialNumber.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
