using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.Overtimes.Queries;

public record GetOvertimeByIdQuery(int Id) : IRequest<OvertimeDto?>;

public class GetOvertimeByIdQueryHandler : IRequestHandler<GetOvertimeByIdQuery, OvertimeDto?>
{
    private readonly IOvertimeRepository _repository;

    public GetOvertimeByIdQueryHandler(IOvertimeRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<OvertimeDto?> Handle(GetOvertimeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) return null;

        return new OvertimeDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            OvertimeType = entity.OvertimeType.ToString(),
            Status = entity.Status.ToString(),
            Date = entity.Date,
            StartTime = entity.StartTime,
            EndTime = entity.EndTime,
            PlannedHours = entity.PlannedHours,
            ActualHours = entity.ActualHours,
            BreakMinutes = entity.BreakMinutes,
            PayMultiplier = entity.PayMultiplier,
            CalculatedAmount = entity.CalculatedAmount,
            Currency = entity.Currency,
            ProjectId = entity.ProjectId,
            ProjectName = entity.ProjectName,
            TaskId = entity.TaskId,
            CostCenter = entity.CostCenter,
            Reason = entity.Reason.ToString(),
            Description = entity.Description,
            WorkDetails = entity.WorkDetails,
            RequestDate = entity.RequestDate,
            ApprovedById = entity.ApprovedById,
            ApprovalDate = entity.ApprovalDate,
            ApprovalNotes = entity.ApprovalNotes,
            RejectionReason = entity.RejectionReason,
            IsPaid = entity.IsPaid,
            PaidDate = entity.PaidDate,
            PayrollId = entity.PayrollId,
            IsCompensatoryTimeOff = entity.IsCompensatoryTimeOff,
            CompensatoryHoursEarned = entity.CompensatoryHoursEarned,
            CompensatoryHoursUsed = entity.CompensatoryHoursUsed,
            IsPreApproved = entity.IsPreApproved,
            IsEmergency = entity.IsEmergency,
            Notes = entity.Notes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };
    }
}
