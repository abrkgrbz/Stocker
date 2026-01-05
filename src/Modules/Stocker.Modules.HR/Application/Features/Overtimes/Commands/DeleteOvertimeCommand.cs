using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Commands;

/// <summary>
/// Command to delete an overtime
/// </summary>
public record DeleteOvertimeCommand : IRequest<Result<bool>>
{
    public int OvertimeId { get; init; }
}

/// <summary>
/// Handler for DeleteOvertimeCommand
/// </summary>
public class DeleteOvertimeCommandHandler : IRequestHandler<DeleteOvertimeCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteOvertimeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteOvertimeCommand request, CancellationToken cancellationToken)
    {
        // Get existing overtime
        var overtime = await _unitOfWork.Overtimes.GetByIdAsync(request.OvertimeId, cancellationToken);
        if (overtime == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Overtime", $"Overtime with ID {request.OvertimeId} not found"));
        }

        // Check if overtime can be deleted
        if (overtime.Status == OvertimeStatus.Approved || overtime.Status == OvertimeStatus.Completed)
        {
            return Result<bool>.Failure(
                Error.Conflict("Overtime", "Cannot delete approved or completed overtime. Please cancel it instead."));
        }

        if (overtime.IsPaid)
        {
            return Result<bool>.Failure(
                Error.Conflict("Overtime", "Cannot delete paid overtime"));
        }

        // Soft delete
        _unitOfWork.Overtimes.Remove(overtime);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
