using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;

namespace Stocker.Modules.HR.Application.Features.TimeSheets.Queries;

public record GetTimeSheetByIdQuery(int Id) : IRequest<TimeSheetDto?>;

public class GetTimeSheetByIdQueryHandler : IRequestHandler<GetTimeSheetByIdQuery, TimeSheetDto?>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetTimeSheetByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<TimeSheetDto?> Handle(GetTimeSheetByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.TimeSheets.GetByIdAsync(request.Id, cancellationToken);
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
