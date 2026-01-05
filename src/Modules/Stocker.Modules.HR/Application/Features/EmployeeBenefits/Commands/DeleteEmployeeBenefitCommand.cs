using MediatR;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeBenefits.Commands;

/// <summary>
/// Command to delete an employee benefit
/// </summary>
public record DeleteEmployeeBenefitCommand : IRequest<Result<bool>>
{
    public int EmployeeBenefitId { get; init; }
}

/// <summary>
/// Handler for DeleteEmployeeBenefitCommand
/// </summary>
public class DeleteEmployeeBenefitCommandHandler : IRequestHandler<DeleteEmployeeBenefitCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public DeleteEmployeeBenefitCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteEmployeeBenefitCommand request, CancellationToken cancellationToken)
    {
        var employeeBenefit = await _unitOfWork.EmployeeBenefits.GetByIdAsync(request.EmployeeBenefitId, cancellationToken);
        if (employeeBenefit == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("EmployeeBenefit", $"Employee benefit with ID {request.EmployeeBenefitId} not found"));
        }

        _unitOfWork.EmployeeBenefits.Remove(employeeBenefit);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
