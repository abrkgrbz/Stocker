using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payslips.Commands;

/// <summary>
/// Command to cancel a payslip (reject)
/// </summary>
public record CancelPayslipCommand(int PayslipId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for CancelPayslipCommand
/// </summary>
public class CancelPayslipCommandHandler : IRequestHandler<CancelPayslipCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CancelPayslipCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(CancelPayslipCommand request, CancellationToken cancellationToken)
    {
        var payslip = await _unitOfWork.Payslips.GetByIdAsync(request.PayslipId, cancellationToken);
        if (payslip == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Payslip", $"Payslip with ID {request.PayslipId} not found"));
        }

        try
        {
            payslip.Cancel();
            await _unitOfWork.Payslips.UpdateAsync(payslip, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Payslip.Cancel", ex.Message));
        }
    }
}
