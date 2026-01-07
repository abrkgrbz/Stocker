using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payslips.Commands;

/// <summary>
/// Command to finalize a payslip (approve)
/// </summary>
public record FinalizePayslipCommand(int PayslipId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for FinalizePayslipCommand
/// </summary>
public class FinalizePayslipCommandHandler : IRequestHandler<FinalizePayslipCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public FinalizePayslipCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(FinalizePayslipCommand request, CancellationToken cancellationToken)
    {
        var payslip = await _unitOfWork.Payslips.GetByIdAsync(request.PayslipId, cancellationToken);
        if (payslip == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Payslip", $"Payslip with ID {request.PayslipId} not found"));
        }

        try
        {
            payslip.Finalize();
            await _unitOfWork.Payslips.UpdateAsync(payslip, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Payslip.Finalize", ex.Message));
        }
    }
}
