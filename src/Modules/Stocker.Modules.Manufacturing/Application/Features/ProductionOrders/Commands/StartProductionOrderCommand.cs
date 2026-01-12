using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Commands;

public record StartProductionOrderCommand(int Id, StartProductionOrderRequest Request) : IRequest<Unit>;

public class StartProductionOrderCommandValidator : AbstractValidator<StartProductionOrderCommand>
{
    public StartProductionOrderCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Üretim emri ID zorunludur.");
    }
}

public class StartProductionOrderCommandHandler : IRequestHandler<StartProductionOrderCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public StartProductionOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(StartProductionOrderCommand command, CancellationToken cancellationToken)
    {
        var productionOrder = await _unitOfWork.ProductionOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Üretim emri bulunamadı.");

        // Entity's Start() method raises ProductionOrderStartedDomainEvent
        productionOrder.Start();

        _unitOfWork.ProductionOrders.Update(productionOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
