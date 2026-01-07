using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Commands;

/// <summary>
/// Command to submit a timesheet for approval
/// </summary>
public record SubmitTimeSheetCommand(int TimeSheetId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for SubmitTimeSheetCommand
/// </summary>
public class SubmitTimeSheetCommandHandler : IRequestHandler<SubmitTimeSheetCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public SubmitTimeSheetCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(SubmitTimeSheetCommand request, CancellationToken cancellationToken)
    {
        var timeSheet = await _unitOfWork.TimeSheets.GetByIdAsync(request.TimeSheetId, cancellationToken);
        if (timeSheet == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("TimeSheet", $"TimeSheet with ID {request.TimeSheetId} not found"));
        }

        try
        {
            timeSheet.Submit();
            await _unitOfWork.TimeSheets.UpdateAsync(timeSheet, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("TimeSheet.Submit", ex.Message));
        }
    }
}
