using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Commands;

public record CancelProductionOrderCommand(int Id, string Reason) : IRequest<Unit>;

public class CancelProductionOrderCommandValidator : AbstractValidator<CancelProductionOrderCommand>
{
    public CancelProductionOrderCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Üretim emri ID zorunludur.");
        RuleFor(x => x.Reason).NotEmpty().WithMessage("İptal nedeni zorunludur.");
    }
}

public class CancelProductionOrderCommandHandler : IRequestHandler<CancelProductionOrderCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public CancelProductionOrderCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(CancelProductionOrderCommand command, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var productionOrder = await _unitOfWork.ProductionOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Üretim emri bulunamadı.");

        // Entity's Cancel() method raises ProductionOrderCancelledDomainEvent
        productionOrder.Cancel(userId.ToString(), command.Reason);

        _unitOfWork.ProductionOrders.Update(productionOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
