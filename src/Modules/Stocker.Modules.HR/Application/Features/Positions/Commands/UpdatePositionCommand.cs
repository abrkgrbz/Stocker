using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Commands;

/// <summary>
/// Command to update a position
/// </summary>
public class UpdatePositionCommand : IRequest<Result<PositionDto>>
{
    public Guid TenantId { get; set; }
    public int PositionId { get; set; }
    public UpdatePositionDto PositionData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdatePositionCommand
/// </summary>
public class UpdatePositionCommandValidator : AbstractValidator<UpdatePositionCommand>
{
    public UpdatePositionCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PositionId)
            .GreaterThan(0).WithMessage("Position ID must be greater than 0");

        RuleFor(x => x.PositionData)
            .NotNull().WithMessage("Position data is required");

        When(x => x.PositionData != null, () =>
        {
            RuleFor(x => x.PositionData.Title)
                .NotEmpty().WithMessage("Position title is required")
                .MaximumLength(100).WithMessage("Position title must not exceed 100 characters");

            RuleFor(x => x.PositionData.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID is required");

            RuleFor(x => x.PositionData.MaxSalary)
                .GreaterThanOrEqualTo(x => x.PositionData.MinSalary)
                .WithMessage("Maximum salary must be greater than or equal to minimum salary");
        });
    }
}

/// <summary>
/// Handler for UpdatePositionCommand
/// </summary>
public class UpdatePositionCommandHandler : IRequestHandler<UpdatePositionCommand, Result<PositionDto>>
{
    private readonly IPositionRepository _positionRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdatePositionCommandHandler(
        IPositionRepository positionRepository,
        IDepartmentRepository departmentRepository,
        IUnitOfWork unitOfWork)
    {
        _positionRepository = positionRepository;
        _departmentRepository = departmentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PositionDto>> Handle(UpdatePositionCommand request, CancellationToken cancellationToken)
    {
        var data = request.PositionData;

        // Get existing position
        var position = await _positionRepository.GetByIdAsync(request.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<PositionDto>.Failure(
                Error.NotFound("Position", $"Position with ID {request.PositionId} not found"));
        }

        // Validate department
        var department = await _departmentRepository.GetByIdAsync(data.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<PositionDto>.Failure(
                Error.NotFound("Department", $"Department with ID {data.DepartmentId} not found"));
        }

        // Update the position
        position.Update(data.Title, data.Description, data.Level, data.HeadCount, data.Requirements, data.Responsibilities);
        position.UpdateSalaryRange(data.MinSalary, data.MaxSalary, data.Currency);

        if (position.DepartmentId != data.DepartmentId)
        {
            position.SetDepartment(data.DepartmentId);
        }

        // Save changes
        _positionRepository.Update(position);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Get employee count for this position
        var employeeCount = await _positionRepository.GetEmployeeCountAsync(position.Id, cancellationToken);

        // Map to DTO
        var positionDto = new PositionDto
        {
            Id = position.Id,
            Code = position.Code,
            Title = position.Title,
            Description = position.Description,
            DepartmentId = position.DepartmentId,
            DepartmentName = department.Name,
            Level = position.Level,
            MinSalary = position.MinSalary,
            MaxSalary = position.MaxSalary,
            Currency = position.Currency,
            HeadCount = position.HeadCount,
            FilledPositions = employeeCount,
            Vacancies = (position.HeadCount ?? 0) - employeeCount,
            Requirements = position.Requirements,
            Responsibilities = position.Responsibilities,
            IsActive = position.IsActive,
            CreatedAt = position.CreatedDate,
            UpdatedAt = position.UpdatedDate
        };

        return Result<PositionDto>.Success(positionDto);
    }
}
