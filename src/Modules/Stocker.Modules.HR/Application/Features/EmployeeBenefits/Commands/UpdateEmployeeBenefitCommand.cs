using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeBenefits.Commands;

/// <summary>
/// Command to update an employee benefit
/// </summary>
public record UpdateEmployeeBenefitCommand : IRequest<Result<int>>
{
    public Guid TenantId { get; init; }
    public int EmployeeBenefitId { get; init; }
    public decimal? Amount { get; init; }
    public BenefitStatus? Status { get; init; }
    public DateTime? EndDate { get; init; }
    public DateTime? RenewalDate { get; init; }
    public int? ApprovedById { get; init; }
    public decimal? UsedAmount { get; init; }
    public string? PolicyNumber { get; init; }
    public string? CoverageLevel { get; init; }
    public bool? SpouseCovered { get; init; }
    public bool? ChildrenCovered { get; init; }
    public int? NumberOfDependents { get; init; }
    public decimal? FuelAllowance { get; init; }
    public int? MileageLimit { get; init; }
    public decimal? MonthlyLimit { get; init; }
    public decimal? DailyAmount { get; init; }
    public string? Description { get; init; }
    public string? Notes { get; init; }
    public string? DocumentUrl { get; init; }
}

/// <summary>
/// Handler for UpdateEmployeeBenefitCommand
/// </summary>
public class UpdateEmployeeBenefitCommandHandler : IRequestHandler<UpdateEmployeeBenefitCommand, Result<int>>
{
    private readonly IEmployeeBenefitRepository _employeeBenefitRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateEmployeeBenefitCommandHandler(
        IEmployeeBenefitRepository employeeBenefitRepository,
        IUnitOfWork unitOfWork)
    {
        _employeeBenefitRepository = employeeBenefitRepository;
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<int>> Handle(UpdateEmployeeBenefitCommand request, CancellationToken cancellationToken)
    {
        var employeeBenefit = await _employeeBenefitRepository.GetByIdAsync(request.EmployeeBenefitId, cancellationToken);
        if (employeeBenefit == null)
        {
            return Result<int>.Failure(
                Error.NotFound("EmployeeBenefit", $"Employee benefit with ID {request.EmployeeBenefitId} not found"));
        }

        if (request.Amount.HasValue)
            employeeBenefit.UpdateAmount(request.Amount.Value);

        if (request.Status.HasValue)
        {
            switch (request.Status.Value)
            {
                case BenefitStatus.Active:
                    employeeBenefit.Activate();
                    break;
                case BenefitStatus.Suspended:
                    employeeBenefit.Suspend();
                    break;
                case BenefitStatus.Terminated when request.EndDate.HasValue:
                    employeeBenefit.Terminate(request.EndDate.Value);
                    break;
            }
        }

        if (request.RenewalDate.HasValue)
            employeeBenefit.Renew(request.RenewalDate.Value, request.EndDate);

        if (request.ApprovedById.HasValue)
            employeeBenefit.Approve(request.ApprovedById.Value);

        if (request.UsedAmount.HasValue)
            employeeBenefit.RecordUsage(request.UsedAmount.Value);

        if (request.EndDate.HasValue)
            employeeBenefit.SetEndDate(request.EndDate);

        if (!string.IsNullOrEmpty(request.Description))
            employeeBenefit.SetDescription(request.Description);

        if (!string.IsNullOrEmpty(request.Notes))
            employeeBenefit.SetNotes(request.Notes);

        if (!string.IsNullOrEmpty(request.DocumentUrl))
            employeeBenefit.SetDocumentUrl(request.DocumentUrl);

        _employeeBenefitRepository.Update(employeeBenefit);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<int>.Success(employeeBenefit.Id);
    }
}
