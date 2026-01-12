using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Commands;

public record ActivateWorkCenterCommand(int Id) : IRequest<Unit>;

public class ActivateWorkCenterCommandValidator : AbstractValidator<ActivateWorkCenterCommand>
{
    public ActivateWorkCenterCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("İş merkezi ID geçerli olmalıdır.");
    }
}

public class ActivateWorkCenterCommandHandler : IRequestHandler<ActivateWorkCenterCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public ActivateWorkCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(ActivateWorkCenterCommand command, CancellationToken cancellationToken)
    {
        var workCenter = await _unitOfWork.WorkCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("İş merkezi bulunamadı.");

        workCenter.Activate();

        _unitOfWork.WorkCenters.Update(workCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}

public record DeactivateWorkCenterCommand(int Id) : IRequest<Unit>;

public class DeactivateWorkCenterCommandValidator : AbstractValidator<DeactivateWorkCenterCommand>
{
    public DeactivateWorkCenterCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("İş merkezi ID geçerli olmalıdır.");
    }
}

public class DeactivateWorkCenterCommandHandler : IRequestHandler<DeactivateWorkCenterCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeactivateWorkCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeactivateWorkCenterCommand command, CancellationToken cancellationToken)
    {
        var workCenter = await _unitOfWork.WorkCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("İş merkezi bulunamadı.");

        if (await _unitOfWork.WorkCenters.HasActiveOperationsAsync(command.Id, cancellationToken))
            throw new InvalidOperationException("Aktif operasyonları olan iş merkezi pasif yapılamaz.");

        workCenter.Deactivate();

        _unitOfWork.WorkCenters.Update(workCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
