using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Queries;

/// <summary>
/// Query to get all leave types with optional filtering
/// </summary>
public class GetLeaveTypesQuery : IRequest<Result<List<LeaveTypeDto>>>
{
    public Guid TenantId { get; set; }
    public bool? IsPaid { get; set; }
    public bool? RequiresApproval { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetLeaveTypesQuery
/// </summary>
public class GetLeaveTypesQueryHandler : IRequestHandler<GetLeaveTypesQuery, Result<List<LeaveTypeDto>>>
{
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public GetLeaveTypesQueryHandler(ILeaveTypeRepository leaveTypeRepository)
    {
        _leaveTypeRepository = leaveTypeRepository;
    }

    public async Task<Result<List<LeaveTypeDto>>> Handle(GetLeaveTypesQuery request, CancellationToken cancellationToken)
    {
        var leaveTypes = await _leaveTypeRepository.GetAllAsync(cancellationToken);

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
