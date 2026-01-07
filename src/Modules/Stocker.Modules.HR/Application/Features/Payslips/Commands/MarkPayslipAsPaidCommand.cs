using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payslips.Commands;

/// <summary>
/// Command to mark a payslip as paid
/// </summary>
public record MarkPayslipAsPaidCommand(int PayslipId, decimal Amount, string? PaymentReference = null) : IRequest<Result<bool>>;

/// <summary>
/// Validator for MarkPayslipAsPaidCommand
/// </summary>
public class MarkPayslipAsPaidCommandValidator : AbstractValidator<MarkPayslipAsPaidCommand>
{
    public MarkPayslipAsPaidCommandValidator()
    {
        RuleFor(x => x.PayslipId)
            .GreaterThan(0).WithMessage("Payslip ID must be greater than 0");

        RuleFor(x => x.Amount)
            .GreaterThan(0).WithMessage("Amount must be greater than 0");
    }
}

/// <summary>
/// Handler for MarkPayslipAsPaidCommand
/// </summary>
public class MarkPayslipAsPaidCommandHandler : IRequestHandler<MarkPayslipAsPaidCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public MarkPayslipAsPaidCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(MarkPayslipAsPaidCommand request, CancellationToken cancellationToken)
    {
        var payslip = await _unitOfWork.Payslips.GetByIdAsync(request.PayslipId, cancellationToken);
        if (payslip == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Payslip", $"Payslip with ID {request.PayslipId} not found"));
        }

        try
        {
            payslip.MarkAsPaid(request.Amount, request.PaymentReference);
            await _unitOfWork.Payslips.UpdateAsync(payslip, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }
        catch (InvalidOperationException ex)
        {
            return Result<bool>.Failure(Error.Validation("Payslip.MarkAsPaid", ex.Message));
        }
    }
}
