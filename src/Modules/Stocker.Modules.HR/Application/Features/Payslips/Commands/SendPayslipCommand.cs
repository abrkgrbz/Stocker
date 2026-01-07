using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payslips.Commands;

/// <summary>
/// Command to send a payslip to employee
/// </summary>
public record SendPayslipCommand(int PayslipId) : IRequest<Result<bool>>;

/// <summary>
/// Handler for SendPayslipCommand
/// </summary>
public class SendPayslipCommandHandler : IRequestHandler<SendPayslipCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public SendPayslipCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(SendPayslipCommand request, CancellationToken cancellationToken)
    {
        var payslip = await _unitOfWork.Payslips.GetByIdAsync(request.PayslipId, cancellationToken);
        if (payslip == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Payslip", $"Payslip with ID {request.PayslipId} not found"));
        }

        try
        {
            payslip.Send();
            await _unitOfWork.Payslips.UpdateAsync(payslip, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Payslip.Send", ex.Message));
        }
    }
}
