using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Application.DTOs;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Commands;

public record CompleteProductionOrderCommand(int Id, CompleteProductionOrderRequest Request) : IRequest<Unit>;

public class CompleteProductionOrderCommandValidator : AbstractValidator<CompleteProductionOrderCommand>
{
    public CompleteProductionOrderCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Üretim emri ID zorunludur.");

        RuleFor(x => x.Request.CompletedQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Tamamlanan miktar negatif olamaz.");

        RuleFor(x => x.Request.ScrapQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Hurda miktarı negatif olamaz.");
    }
}

public class CompleteProductionOrderCommandHandler : IRequestHandler<CompleteProductionOrderCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public CompleteProductionOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(CompleteProductionOrderCommand command, CancellationToken cancellationToken)
    {
        var productionOrder = await _unitOfWork.ProductionOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Üretim emri bulunamadı.");

        var request = command.Request;

        // Record completion quantities first
        productionOrder.RecordCompletion(request.CompletedQuantity);
        if (request.ScrapQuantity > 0)
        {
            productionOrder.RecordScrap(request.ScrapQuantity);
        }

        // Entity's Complete() method raises ProductionOrderCompletedDomainEvent
        productionOrder.Complete();

        _unitOfWork.ProductionOrders.Update(productionOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
