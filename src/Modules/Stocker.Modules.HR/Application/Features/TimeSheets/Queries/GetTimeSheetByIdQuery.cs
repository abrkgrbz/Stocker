using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Queries;

public record GetTimeSheetByIdQuery(int Id) : IRequest<TimeSheetDto?>;

public class GetTimeSheetByIdQueryHandler : IRequestHandler<GetTimeSheetByIdQuery, TimeSheetDto?>
{
    private readonly ITimeSheetRepository _repository;

    public GetTimeSheetByIdQueryHandler(ITimeSheetRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<TimeSheetDto?> Handle(GetTimeSheetByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null) return null;

        return new TimeSheetDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            PeriodStart = entity.PeriodStart,
            PeriodEnd = entity.PeriodEnd,
            Status = entity.Status.ToString(),
            TotalWorkHours = entity.TotalWorkHours,
            RegularHours = entity.RegularHours,
            OvertimeHours = entity.OvertimeHours,
            LeaveHours = entity.LeaveHours,
            HolidayHours = entity.HolidayHours,
            BillableHours = entity.BillableHours,
            NonBillableHours = entity.NonBillableHours,
            SubmittedDate = entity.SubmittedDate,
            ApprovedById = entity.ApprovedById,
            ApprovalDate = entity.ApprovalDate,
            ApprovalNotes = entity.ApprovalNotes,
            RejectionReason = entity.RejectionReason,
            Notes = entity.Notes,
            IsLocked = entity.IsLocked,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };
    }
}
