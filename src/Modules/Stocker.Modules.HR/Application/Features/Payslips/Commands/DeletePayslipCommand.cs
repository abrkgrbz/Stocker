using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Payslips.Commands;

/// <summary>
/// Command to delete a payslip
/// </summary>
public record DeletePayslipCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; init; }
    public int PayslipId { get; init; }
}

/// <summary>
/// Handler for DeletePayslipCommand
/// </summary>
public class DeletePayslipCommandHandler : IRequestHandler<DeletePayslipCommand, Result<bool>>
{
    private readonly IPayslipRepository _payslipRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeletePayslipCommandHandler(
        IPayslipRepository payslipRepository,
        IUnitOfWork unitOfWork)
    {
        _payslipRepository = payslipRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeletePayslipCommand request, CancellationToken cancellationToken)
    {
        // Get existing payslip
        var payslip = await _payslipRepository.GetByIdAsync(request.PayslipId, cancellationToken);
        if (payslip == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Payslip", $"Payslip with ID {request.PayslipId} not found"));
        }

        // Check if payslip can be deleted
        if (payslip.Status == PayslipStatus.Paid)
        {
            return Result<bool>.Failure(
                Error.Conflict("Payslip", "Cannot delete paid payslip"));
        }

        if (payslip.Status == PayslipStatus.Sent)
        {
            return Result<bool>.Failure(
                Error.Conflict("Payslip", "Cannot delete sent payslip. Please cancel it first."));
        }

        // Soft delete
        _payslipRepository.Remove(payslip);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
