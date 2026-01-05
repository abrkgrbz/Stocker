using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Commands;

/// <summary>
/// Command to delete a work schedule
/// </summary>
public record DeleteWorkScheduleCommand : IRequest<Result<bool>>
{
    public int ScheduleId { get; init; }
}

/// <summary>
/// Validator for DeleteWorkScheduleCommand
/// </summary>
public class DeleteWorkScheduleCommandValidator : AbstractValidator<DeleteWorkScheduleCommand>
{
    public DeleteWorkScheduleCommandValidator()
    {
        RuleFor(x => x.ScheduleId)
            .GreaterThan(0).WithMessage("Valid schedule ID is required");
    }
}

/// <summary>
/// Handler for DeleteWorkScheduleCommand
/// </summary>
public class DeleteWorkScheduleCommandHandler : IRequestHandler<DeleteWorkScheduleCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteWorkScheduleCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteWorkScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _unitOfWork.WorkSchedules.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("WorkSchedule.NotFound", $"Work schedule with ID {request.ScheduleId} not found"));
        }

        _unitOfWork.WorkSchedules.Remove(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
