using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Commands;

/// <summary>
/// Command to update a timesheet
/// </summary>
public record UpdateTimeSheetCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int TimeSheetId { get; init; }
    public decimal? LeaveHours { get; init; }
    public decimal? HolidayHours { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Handler for UpdateTimeSheetCommand
/// </summary>
public class UpdateTimeSheetCommandHandler : IRequestHandler<UpdateTimeSheetCommand, Result<int>>
{
    private readonly ITimeSheetRepository _timeSheetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateTimeSheetCommandHandler(
        ITimeSheetRepository timeSheetRepository,
        IUnitOfWork unitOfWork)
    {
        _timeSheetRepository = timeSheetRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(UpdateTimeSheetCommand request, CancellationToken cancellationToken)
    {
        // Get existing timesheet
        var timeSheet = await _timeSheetRepository.GetByIdAsync(request.TimeSheetId, cancellationToken);
        if (timeSheet == null)
        {
            return Result<int>.Failure(
                Error.NotFound("TimeSheet", $"TimeSheet with ID {request.TimeSheetId} not found"));
        }

        // Check if timesheet is locked
        if (timeSheet.IsLocked)
        {
            return Result<int>.Failure(
                Error.Conflict("TimeSheet", "Cannot update locked timesheet"));
        }

        // Update the timesheet
        if (request.LeaveHours.HasValue)
            timeSheet.SetLeaveHours(request.LeaveHours.Value);

        if (request.HolidayHours.HasValue)
            timeSheet.SetHolidayHours(request.HolidayHours.Value);

        if (!string.IsNullOrEmpty(request.Notes))
            timeSheet.SetNotes(request.Notes);

        // Save changes
        _timeSheetRepository.Update(timeSheet);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(timeSheet.Id);
    }
}
