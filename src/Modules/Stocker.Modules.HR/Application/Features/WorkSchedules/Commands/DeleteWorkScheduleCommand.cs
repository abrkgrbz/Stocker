using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.WorkSchedules.Commands;

/// <summary>
/// Command to delete a work schedule
/// </summary>
public class DeleteWorkScheduleCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int ScheduleId { get; set; }
}

/// <summary>
/// Validator for DeleteWorkScheduleCommand
/// </summary>
public class DeleteWorkScheduleCommandValidator : AbstractValidator<DeleteWorkScheduleCommand>
{
    public DeleteWorkScheduleCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.ScheduleId)
            .GreaterThan(0).WithMessage("Valid schedule ID is required");
    }
}

/// <summary>
/// Handler for DeleteWorkScheduleCommand
/// </summary>
public class DeleteWorkScheduleCommandHandler : IRequestHandler<DeleteWorkScheduleCommand, Result<bool>>
{
    private readonly IWorkScheduleRepository _scheduleRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteWorkScheduleCommandHandler(
        IWorkScheduleRepository scheduleRepository,
        IUnitOfWork unitOfWork)
    {
        _scheduleRepository = scheduleRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteWorkScheduleCommand request, CancellationToken cancellationToken)
    {
        var schedule = await _scheduleRepository.GetByIdAsync(request.ScheduleId, cancellationToken);
        if (schedule == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("WorkSchedule.NotFound", $"Work schedule with ID {request.ScheduleId} not found"));
        }

        _scheduleRepository.Remove(schedule);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
