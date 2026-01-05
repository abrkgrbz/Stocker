using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Queries;

/// <summary>
/// Query to get all leave types with optional filtering
/// </summary>
public record GetLeaveTypesQuery : IRequest<Result<List<LeaveTypeDto>>>
{
    public bool? IsPaid { get; init; }
    public bool? RequiresApproval { get; init; }
    public bool IncludeInactive { get; init; }
}

/// <summary>
/// Handler for GetLeaveTypesQuery
/// </summary>
public class GetLeaveTypesQueryHandler : IRequestHandler<GetLeaveTypesQuery, Result<List<LeaveTypeDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetLeaveTypesQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<LeaveTypeDto>>> Handle(GetLeaveTypesQuery request, CancellationToken cancellationToken)
    {
        var leaveTypes = await _unitOfWork.LeaveTypes.GetAllAsync(cancellationToken);

        var filtered = leaveTypes.AsEnumerable();

        if (request.IsPaid.HasValue)
        {
            filtered = filtered.Where(lt => lt.IsPaid == request.IsPaid.Value);
        }

        if (request.RequiresApproval.HasValue)
        {
            filtered = filtered.Where(lt => lt.RequiresApproval == request.RequiresApproval.Value);
        }

        if (!request.IncludeInactive)
        {
            filtered = filtered.Where(lt => lt.IsActive);
        }

        var dtos = filtered.Select(lt => new LeaveTypeDto
        {
            Id = lt.Id,
            Name = lt.Name,
            Code = lt.Code,
            Description = lt.Description,
            DefaultDays = lt.DefaultDays,
            IsPaid = lt.IsPaid,
            RequiresApproval = lt.RequiresApproval,
            RequiresDocument = lt.RequiresDocument,
            MaxConsecutiveDays = null, // Not in entity
            MinNoticeDays = lt.MinNoticeDays,
            AllowHalfDay = lt.AllowHalfDay,
            AllowNegativeBalance = lt.AllowNegativeBalance,
            CarryForward = lt.IsCarryForward,
            MaxCarryForwardDays = lt.MaxCarryForwardDays,
            IsActive = lt.IsActive,
            Color = lt.Color,
            CreatedAt = lt.CreatedDate
        }).OrderBy(lt => lt.Name).ToList();

        return Result<List<LeaveTypeDto>>.Success(dtos);
    }
}
