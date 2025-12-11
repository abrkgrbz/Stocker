using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Commands;

/// <summary>
/// Command to delete a timesheet
/// </summary>
public record DeleteTimeSheetCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int TimeSheetId { get; init; }
}

/// <summary>
/// Handler for DeleteTimeSheetCommand
/// </summary>
public class DeleteTimeSheetCommandHandler : IRequestHandler<DeleteTimeSheetCommand, Result<int>>
{
    private readonly ITimeSheetRepository _timeSheetRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTimeSheetCommandHandler(
        ITimeSheetRepository timeSheetRepository,
        IUnitOfWork unitOfWork)
    {
        _timeSheetRepository = timeSheetRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(DeleteTimeSheetCommand request, CancellationToken cancellationToken)
    {
        // Get existing timesheet
        var timeSheet = await _timeSheetRepository.GetByIdAsync(request.TimeSheetId, cancellationToken);
        if (timeSheet == null)
        {
            return Result<int>.Failure(
                Error.NotFound("TimeSheet", $"TimeSheet with ID {request.TimeSheetId} not found"));
        }

        // Check if timesheet can be deleted
        if (timeSheet.Status == TimeSheetStatus.Approved)
        {
            return Result<int>.Failure(
                Error.Conflict("TimeSheet", "Cannot delete approved timesheet"));
        }

        if (timeSheet.IsLocked)
        {
            return Result<int>.Failure(
                Error.Conflict("TimeSheet", "Cannot delete locked timesheet"));
        }

        // Soft delete
        _timeSheetRepository.Remove(timeSheet);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(timeSheet.Id);
    }
}
