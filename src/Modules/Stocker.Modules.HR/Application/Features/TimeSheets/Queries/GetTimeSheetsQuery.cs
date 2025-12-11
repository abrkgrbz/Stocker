using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Queries;

public record GetTimeSheetsQuery() : IRequest<List<TimeSheetDto>>;

public class GetTimeSheetsQueryHandler : IRequestHandler<GetTimeSheetsQuery, List<TimeSheetDto>>
{
    private readonly ITimeSheetRepository _repository;

    public GetTimeSheetsQueryHandler(ITimeSheetRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<List<TimeSheetDto>> Handle(GetTimeSheetsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(cancellationToken);
        return entities.Select(e => new TimeSheetDto
        {
            Id = e.Id,
            EmployeeId = e.EmployeeId,
            PeriodStart = e.PeriodStart,
            PeriodEnd = e.PeriodEnd,
            Status = e.Status.ToString(),
            TotalWorkHours = e.TotalWorkHours,
            RegularHours = e.RegularHours,
            OvertimeHours = e.OvertimeHours,
            LeaveHours = e.LeaveHours,
            HolidayHours = e.HolidayHours,
            BillableHours = e.BillableHours,
            NonBillableHours = e.NonBillableHours,
            SubmittedDate = e.SubmittedDate,
            ApprovedById = e.ApprovedById,
            ApprovalDate = e.ApprovalDate,
            ApprovalNotes = e.ApprovalNotes,
            RejectionReason = e.RejectionReason,
            Notes = e.Notes,
            IsLocked = e.IsLocked,
            CreatedAt = e.CreatedDate,
            UpdatedAt = e.UpdatedDate
        }).ToList();
    }
}
