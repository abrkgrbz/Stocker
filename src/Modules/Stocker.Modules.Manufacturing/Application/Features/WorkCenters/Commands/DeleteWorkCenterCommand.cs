using FluentValidation;
using MediatR;
using Stocker.Modules.Manufacturing.Interfaces;

namespace Stocker.Modules.Manufacturing.Application.Features.WorkCenters.Commands;

public record DeleteWorkCenterCommand(int Id) : IRequest<Unit>;

public class DeleteWorkCenterCommandValidator : AbstractValidator<DeleteWorkCenterCommand>
{
    public DeleteWorkCenterCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0).WithMessage("İş merkezi ID geçerli olmalıdır.");
    }
}

public class DeleteWorkCenterCommandHandler : IRequestHandler<DeleteWorkCenterCommand, Unit>
{
    private readonly IManufacturingUnitOfWork _unitOfWork;

    public DeleteWorkCenterCommandHandler(IManufacturingUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(DeleteWorkCenterCommand command, CancellationToken cancellationToken)
    {
        var workCenter = await _unitOfWork.WorkCenters.GetByIdAsync(command.Id, cancellationToken)
            ?? throw new KeyNotFoundException("İş merkezi bulunamadı.");

        if (await _unitOfWork.WorkCenters.HasActiveOperationsAsync(command.Id, cancellationToken))
            throw new InvalidOperationException("Aktif operasyonları olan iş merkezi silinemez.");

        _unitOfWork.WorkCenters.Delete(workCenter);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
