using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Queries;

/// <summary>
/// Query to get a leave type by ID
/// </summary>
public class GetLeaveTypeByIdQuery : IRequest<Result<LeaveTypeDto>>
{
    public Guid TenantId { get; set; }
    public int LeaveTypeId { get; set; }
}

/// <summary>
/// Handler for GetLeaveTypeByIdQuery
/// </summary>
public class GetLeaveTypeByIdQueryHandler : IRequestHandler<GetLeaveTypeByIdQuery, Result<LeaveTypeDto>>
{
    private readonly ILeaveTypeRepository _leaveTypeRepository;

    public GetLeaveTypeByIdQueryHandler(ILeaveTypeRepository leaveTypeRepository)
    {
        _leaveTypeRepository = leaveTypeRepository;
    }

    public async Task<Result<LeaveTypeDto>> Handle(GetLeaveTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var leaveType = await _leaveTypeRepository.GetByIdAsync(request.LeaveTypeId, cancellationToken);
        if (leaveType == null)
        {
            return Result<LeaveTypeDto>.Failure(
                Error.NotFound("LeaveType.NotFound", $"Leave type with ID {request.LeaveTypeId} not found"));
        }

        var dto = new LeaveTypeDto
        {
            Id = leaveType.Id,
            Name = leaveType.Name,
            Code = leaveType.Code,
            Description = leaveType.Description,
            DefaultDays = leaveType.DefaultDays,
            IsPaid = leaveType.IsPaid,
            RequiresApproval = leaveType.RequiresApproval,
            RequiresDocument = leaveType.RequiresDocument,
            MaxConsecutiveDays = null, // Not in entity
            MinNoticeDays = leaveType.MinNoticeDays,
            AllowHalfDay = leaveType.AllowHalfDay,
            AllowNegativeBalance = leaveType.AllowNegativeBalance,
            CarryForward = leaveType.IsCarryForward,
            MaxCarryForwardDays = leaveType.MaxCarryForwardDays,
            IsActive = leaveType.IsActive,
            Color = leaveType.Color,
            CreatedAt = leaveType.CreatedDate
        };

        return Result<LeaveTypeDto>.Success(dto);
    }
}
