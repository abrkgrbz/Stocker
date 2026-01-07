using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Commands;

/// <summary>
/// Command to approve a timesheet
/// </summary>
public record ApproveTimeSheetCommand(int TimeSheetId, int ApprovedById, string? Notes = null) : IRequest<Result<bool>>;

/// <summary>
/// Handler for ApproveTimeSheetCommand
/// </summary>
public class ApproveTimeSheetCommandHandler : IRequestHandler<ApproveTimeSheetCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ApproveTimeSheetCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ApproveTimeSheetCommand request, CancellationToken cancellationToken)
    {
        var timeSheet = await _unitOfWork.TimeSheets.GetByIdAsync(request.TimeSheetId, cancellationToken);
        if (timeSheet == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("TimeSheet", $"TimeSheet with ID {request.TimeSheetId} not found"));
        }

        // Verify approver exists
        var approver = await _unitOfWork.Employees.GetByIdAsync(request.ApprovedById, cancellationToken);
        if (approver == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Employee", $"Approver with ID {request.ApprovedById} not found"));
        }

        try
        {
            timeSheet.Approve(request.ApprovedById, request.Notes);
            await _unitOfWork.TimeSheets.UpdateAsync(timeSheet, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("TimeSheet.Approve", ex.Message));
        }
    }
}
