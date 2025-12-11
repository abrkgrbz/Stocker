using MediatR;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeBenefits.Commands;

/// <summary>
/// Command to delete an employee benefit
/// </summary>
public record DeleteEmployeeBenefitCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; init; }
    public int EmployeeBenefitId { get; init; }
}

/// <summary>
/// Handler for DeleteEmployeeBenefitCommand
/// </summary>
public class DeleteEmployeeBenefitCommandHandler : IRequestHandler<DeleteEmployeeBenefitCommand, Result<bool>>
{
    private readonly IEmployeeBenefitRepository _employeeBenefitRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteEmployeeBenefitCommandHandler(
        IEmployeeBenefitRepository employeeBenefitRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeBenefitRepository = employeeBenefitRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<bool>> Handle(DeleteEmployeeBenefitCommand request, CancellationToken cancellationToken)
    {
        var employeeBenefit = await _employeeBenefitRepository.GetByIdAsync(request.EmployeeBenefitId, cancellationToken);
        if (employeeBenefit == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("EmployeeBenefit", $"Employee benefit with ID {request.EmployeeBenefitId} not found"));
        }

        _employeeBenefitRepository.Remove(employeeBenefit);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
