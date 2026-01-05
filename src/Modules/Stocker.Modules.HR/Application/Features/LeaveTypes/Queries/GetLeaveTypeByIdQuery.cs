using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Queries;

/// <summary>
/// Query to get a leave type by ID
/// </summary>
public record GetLeaveTypeByIdQuery(int LeaveTypeId) : IRequest<Result<LeaveTypeDto>>;

/// <summary>
/// Validator for GetLeaveTypeByIdQuery
/// </summary>
public class GetLeaveTypeByIdQueryValidator : AbstractValidator<GetLeaveTypeByIdQuery>
{
    public GetLeaveTypeByIdQueryValidator()
    {
        RuleFor(x => x.LeaveTypeId)
            .GreaterThan(0).WithMessage("Valid leave type ID is required");
    }
}

/// <summary>
/// Handler for GetLeaveTypeByIdQuery
/// </summary>
public class GetLeaveTypeByIdQueryHandler : IRequestHandler<GetLeaveTypeByIdQuery, Result<LeaveTypeDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetLeaveTypeByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeaveTypeDto>> Handle(GetLeaveTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(request.LeaveTypeId, cancellationToken);
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
