using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Commands;

public record DeactivateWorkLocationCommand(int WorkLocationId) : IRequest<Result<bool>>;

public class DeactivateWorkLocationCommandValidator : AbstractValidator<DeactivateWorkLocationCommand>
{
    public DeactivateWorkLocationCommandValidator()
    {
        RuleFor(x => x.WorkLocationId).GreaterThan(0);
    }
}

public class DeactivateWorkLocationCommandHandler : IRequestHandler<DeactivateWorkLocationCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeactivateWorkLocationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeactivateWorkLocationCommand request, CancellationToken cancellationToken)
    {
        var workLocation = await _unitOfWork.WorkLocations.GetByIdAsync(request.WorkLocationId, cancellationToken);
        if (workLocation == null)
            return Result<bool>.Failure(Error.NotFound("WorkLocation", $"WorkLocation with ID {request.WorkLocationId} not found"));

        if (!workLocation.IsActive)
            return Result<bool>.Failure(Error.Conflict("WorkLocation", "WorkLocation is already inactive"));

        workLocation.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
