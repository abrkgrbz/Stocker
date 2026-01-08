using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkLocations.Commands;

public record ActivateWorkLocationCommand(int WorkLocationId) : IRequest<Result<bool>>;

public class ActivateWorkLocationCommandValidator : AbstractValidator<ActivateWorkLocationCommand>
{
    public ActivateWorkLocationCommandValidator()
    {
        RuleFor(x => x.WorkLocationId).GreaterThan(0);
    }
}

public class ActivateWorkLocationCommandHandler : IRequestHandler<ActivateWorkLocationCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ActivateWorkLocationCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ActivateWorkLocationCommand request, CancellationToken cancellationToken)
    {
        var workLocation = await _unitOfWork.WorkLocations.GetByIdAsync(request.WorkLocationId, cancellationToken);
        if (workLocation == null)
            return Result<bool>.Failure(Error.NotFound("WorkLocation", $"WorkLocation with ID {request.WorkLocationId} not found"));

        if (workLocation.IsActive)
            return Result<bool>.Failure(Error.Conflict("WorkLocation", "WorkLocation is already active"));

        workLocation.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true);
    }
}
