using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Commands;

/// <summary>
/// Command to update an existing leave type
/// </summary>
public record UpdateLeaveTypeCommand : IRequest<Result<LeaveTypeDto>>
{
    public int LeaveTypeId { get; init; }
    public UpdateLeaveTypeDto LeaveTypeData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdateLeaveTypeCommand
/// </summary>
public class UpdateLeaveTypeCommandValidator : AbstractValidator<UpdateLeaveTypeCommand>
{
    public UpdateLeaveTypeCommandValidator()
    {
        RuleFor(x => x.LeaveTypeId)
            .GreaterThan(0).WithMessage("Valid leave type ID is required");

        RuleFor(x => x.LeaveTypeData)
            .NotNull().WithMessage("Leave type data is required");

        When(x => x.LeaveTypeData != null, () =>
        {
            RuleFor(x => x.LeaveTypeData.Name)
                .NotEmpty().WithMessage("Leave type name is required")
                .MaximumLength(100).WithMessage("Leave type name must not exceed 100 characters");

            RuleFor(x => x.LeaveTypeData.Description)
                .MaximumLength(500).WithMessage("Description must not exceed 500 characters");

            RuleFor(x => x.LeaveTypeData.DefaultDays)
                .GreaterThanOrEqualTo(0).WithMessage("Default days must be 0 or greater");

            RuleFor(x => x.LeaveTypeData.MaxCarryForwardDays)
                .GreaterThanOrEqualTo(0).When(x => x.LeaveTypeData.MaxCarryForwardDays.HasValue)
                .WithMessage("Max carry forward days must be 0 or greater");
        });
    }
}

/// <summary>
/// Handler for UpdateLeaveTypeCommand
/// </summary>
public class UpdateLeaveTypeCommandHandler : IRequestHandler<UpdateLeaveTypeCommand, Result<LeaveTypeDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateLeaveTypeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeaveTypeDto>> Handle(UpdateLeaveTypeCommand request, CancellationToken cancellationToken)
    {
        var leaveType = await _unitOfWork.LeaveTypes.GetByIdAsync(request.LeaveTypeId, cancellationToken);
        if (leaveType == null)
        {
            return Result<LeaveTypeDto>.Failure(
                Error.NotFound("LeaveType.NotFound", $"Leave type with ID {request.LeaveTypeId} not found"));
        }

        var data = request.LeaveTypeData;

        leaveType.Update(
            data.Name,
            data.Description,
            data.DefaultDays,
            null, // maxDays - not in DTO
            data.IsPaid,
            data.RequiresApproval,
            data.RequiresDocument,
            data.MinNoticeDays ?? 0,
            data.AllowHalfDay,
            data.AllowNegativeBalance);

        leaveType.SetCarryForwardPolicy(
            data.CarryForward,
            data.MaxCarryForwardDays,
            null); // expiryMonths - not in DTO

        if (!string.IsNullOrEmpty(data.Color))
        {
            leaveType.SetColor(data.Color);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
