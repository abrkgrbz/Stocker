using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Interfaces;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.ProductionOrders.Commands;

public record ApproveProductionOrderCommand(int Id) : IRequest<Unit>;

public class ApproveProductionOrderCommandValidator : AbstractValidator<ApproveProductionOrderCommand>
{
    public ApproveProductionOrderCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Üretim emri ID zorunludur.");
    }
}

public class ApproveProductionOrderCommandHandler : IRequestHandler<ApproveProductionOrderCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ApproveProductionOrderCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(ApproveProductionOrderCommand command, CancellationToken cancellationToken)
    {
        var productionOrder = await _unitOfWork.ProductionOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Üretim emri bulunamadı.");

        // Plan the production order first (Draft -> Planned)
        productionOrder.Plan();

        _unitOfWork.ProductionOrders.Update(productionOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public record ReleaseProductionOrderCommand(int Id) : IRequest<Unit>;

public class ReleaseProductionOrderCommandValidator : AbstractValidator<ReleaseProductionOrderCommand>
{
    public ReleaseProductionOrderCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("Üretim emri ID zorunludur.");
    }
}

public class ReleaseProductionOrderCommandHandler : IRequestHandler<ReleaseProductionOrderCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;

    public ReleaseProductionOrderCommandHandler(
        IManufacturingUnitOfWork unitOfWork,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
    }

    public async Task<Unit> Handle(ReleaseProductionOrderCommand command, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId ?? throw new UnauthorizedAccessException("Kullanıcı bilgisi bulunamadı.");

        var productionOrder = await _unitOfWork.ProductionOrders.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("Üretim emri bulunamadı.");

        // Entity's Release() method raises ProductionOrderReleasedDomainEvent
        productionOrder.Release(userId.ToString());

        _unitOfWork.ProductionOrders.Update(productionOrder);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
