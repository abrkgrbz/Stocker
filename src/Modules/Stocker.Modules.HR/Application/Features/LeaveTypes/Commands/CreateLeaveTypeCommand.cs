using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.LeaveTypes.Commands;

/// <summary>
/// Command to create a new leave type
/// </summary>
public class CreateLeaveTypeCommand : IRequest<Result<LeaveTypeDto>>
{
    public Guid TenantId { get; set; }
    public CreateLeaveTypeDto LeaveTypeData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateLeaveTypeCommand
/// </summary>
public class CreateLeaveTypeCommandValidator : AbstractValidator<CreateLeaveTypeCommand>
{
    public CreateLeaveTypeCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.LeaveTypeData)
            .NotNull().WithMessage("Leave type data is required");

        When(x => x.LeaveTypeData != null, () =>
        {
            RuleFor(x => x.LeaveTypeData.Name)
                .NotEmpty().WithMessage("Leave type name is required")
                .MaximumLength(100).WithMessage("Leave type name must not exceed 100 characters");

            RuleFor(x => x.LeaveTypeData.Code)
                .NotEmpty().WithMessage("Leave type code is required")
                .MaximumLength(20).WithMessage("Leave type code must not exceed 20 characters");

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
/// Handler for CreateLeaveTypeCommand
/// </summary>
public class CreateLeaveTypeCommandHandler : IRequestHandler<CreateLeaveTypeCommand, Result<LeaveTypeDto>>
{
    private readonly ILeaveTypeRepository _leaveTypeRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateLeaveTypeCommandHandler(
        ILeaveTypeRepository leaveTypeRepository,
        IUnitOfWork unitOfWork)
    {
        _leaveTypeRepository = leaveTypeRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<LeaveTypeDto>> Handle(CreateLeaveTypeCommand request, CancellationToken cancellationToken)
    {
        var data = request.LeaveTypeData;

        // Check if code already exists
        var existingByCode = await _leaveTypeRepository.GetByCodeAsync(data.Code, cancellationToken);
        if (existingByCode != null)
        {
            return Result<LeaveTypeDto>.Failure(
                Error.Conflict("LeaveType.CodeExists", $"A leave type with code '{data.Code}' already exists"));
        }

        var leaveType = new LeaveType(
            data.Code,
            data.Name,
            data.DefaultDays,
            data.IsPaid,
            data.RequiresApproval,
            data.Description,
            data.MinNoticeDays ?? 0);

        leaveType.SetTenantId(request.TenantId);

        // Update with additional properties
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

        if (data.CarryForward && data.MaxCarryForwardDays.HasValue)
        {
            leaveType.SetCarryForwardPolicy(true, data.MaxCarryForwardDays, null);
        }

        if (!string.IsNullOrEmpty(data.Color))
        {
            leaveType.SetColor(data.Color);
        }

        await _leaveTypeRepository.AddAsync(leaveType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = MapToDto(leaveType);
        return Result<LeaveTypeDto>.Success(dto);
    }

    private static LeaveTypeDto MapToDto(LeaveType leaveType)
    {
        return new LeaveTypeDto
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
    }
}
