using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Queries;

public record GetOvertimesQuery() : IRequest<List<OvertimeDto>>;

public class GetOvertimesQueryHandler : IRequestHandler<GetOvertimesQuery, List<OvertimeDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetOvertimesQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<OvertimeDto>> Handle(GetOvertimesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.Overtimes.GetAllAsync(cancellationToken);
        return entities.Select(e => new OvertimeDto
        {
            Id = e.Id,
            EmployeeId = e.EmployeeId,
            OvertimeType = e.OvertimeType.ToString(),
            Status = e.Status.ToString(),
            Date = e.Date,
            StartTime = e.StartTime,
            EndTime = e.EndTime,
            PlannedHours = e.PlannedHours,
            ActualHours = e.ActualHours,
            BreakMinutes = e.BreakMinutes,
            PayMultiplier = e.PayMultiplier,
            CalculatedAmount = e.CalculatedAmount,
            Currency = e.Currency,
            ProjectId = e.ProjectId,
            ProjectName = e.ProjectName,
            TaskId = e.TaskId,
            CostCenter = e.CostCenter,
            Reason = e.Reason.ToString(),
            Description = e.Description,
            WorkDetails = e.WorkDetails,
            RequestDate = e.RequestDate,
            ApprovedById = e.ApprovedById,
            ApprovalDate = e.ApprovalDate,
            ApprovalNotes = e.ApprovalNotes,
            RejectionReason = e.RejectionReason,
            IsPaid = e.IsPaid,
            PaidDate = e.PaidDate,
            PayrollId = e.PayrollId,
            IsCompensatoryTimeOff = e.IsCompensatoryTimeOff,
            CompensatoryHoursEarned = e.CompensatoryHoursEarned,
            CompensatoryHoursUsed = e.CompensatoryHoursUsed,
            IsPreApproved = e.IsPreApproved,
            IsEmergency = e.IsEmergency,
            Notes = e.Notes,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();
    }
}
