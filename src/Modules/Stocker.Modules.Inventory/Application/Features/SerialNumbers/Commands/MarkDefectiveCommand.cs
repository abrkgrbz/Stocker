using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;

public class MarkDefectiveCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int SerialNumberId { get; set; }
    public string? Reason { get; set; }
}

public class MarkDefectiveCommandHandler : IRequestHandler<MarkDefectiveCommand, Result<bool>>
{
    private readonly ISerialNumberRepository _serialNumberRepository;

    public MarkDefectiveCommandHandler(ISerialNumberRepository serialNumberRepository)
    {
        _serialNumberRepository = serialNumberRepository;
    }

    public async Task<Result<bool>> Handle(MarkDefectiveCommand request, CancellationToken cancellationToken)
    {
        var serialNumber = await _serialNumberRepository.GetByIdAsync(request.SerialNumberId, cancellationToken);
        if (serialNumber == null)
        {
            return Result<bool>.Failure(new Error("SerialNumber.NotFound", $"Serial number with ID {request.SerialNumberId} not found", ErrorType.NotFound));
        }

        serialNumber.MarkDefective(request.Reason);
        await _serialNumberRepository.UpdateAsync(serialNumber, cancellationToken);
        return Result<bool>.Success(true);
    }
}
