using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Commands;

/// <summary>
/// Command to approve an overtime request
/// </summary>
public record ApproveOvertimeCommand(int OvertimeId, int ApprovedById, string? Notes = null) : IRequest<Result<bool>>;

/// <summary>
/// Handler for ApproveOvertimeCommand
/// </summary>
public class ApproveOvertimeCommandHandler : IRequestHandler<ApproveOvertimeCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public ApproveOvertimeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ApproveOvertimeCommand request, CancellationToken cancellationToken)
    {
        var overtime = await _unitOfWork.Overtimes.GetByIdAsync(request.OvertimeId, cancellationToken);
        if (overtime == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Overtime", $"Overtime with ID {request.OvertimeId} not found"));
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
            overtime.Approve(request.ApprovedById, request.Notes);
            await _unitOfWork.Overtimes.UpdateAsync(overtime, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Overtime.Approve", ex.Message));
        }
    }
}
