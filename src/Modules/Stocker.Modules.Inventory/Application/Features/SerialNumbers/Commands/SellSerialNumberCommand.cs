using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SerialNumbers.Commands;

public class SellSerialNumberCommand : IRequest<Result<bool>>
{
    public int TenantId { get; set; }
    public int SerialNumberId { get; set; }
    public Guid CustomerId { get; set; }
    public Guid SalesOrderId { get; set; }
    public int? WarrantyMonths { get; set; }
}

public class SellSerialNumberCommandValidator : AbstractValidator<SellSerialNumberCommand>
{
    public SellSerialNumberCommandValidator()
    {
        RuleFor(x => x.SerialNumberId).GreaterThan(0);
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.SalesOrderId).NotEmpty();
        RuleFor(x => x.WarrantyMonths).GreaterThanOrEqualTo(0).When(x => x.WarrantyMonths.HasValue);
    }
}

public class SellSerialNumberCommandHandler : IRequestHandler<SellSerialNumberCommand, Result<bool>>
{
    private readonly ISerialNumberRepository _serialNumberRepository;

    public SellSerialNumberCommandHandler(ISerialNumberRepository serialNumberRepository)
    {
        _serialNumberRepository = serialNumberRepository;
    }

    public async Task<Result<bool>> Handle(SellSerialNumberCommand request, CancellationToken cancellationToken)
    {
        var serialNumber = await _serialNumberRepository.GetByIdAsync(request.SerialNumberId, cancellationToken);
        if (serialNumber == null)
        {
            return Result<bool>.Failure(new Error("SerialNumber.NotFound", $"Serial number with ID {request.SerialNumberId} not found", ErrorType.NotFound));
        }

        try
        {
            serialNumber.Sell(request.CustomerId, request.SalesOrderId, request.WarrantyMonths);
            await _serialNumberRepository.UpdateAsync(serialNumber, cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(new Error("SerialNumber.InvalidOperation", ex.Message, ErrorType.Validation));
        }
    }
}
