using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Commands;

/// <summary>
/// Command to create a new position
/// </summary>
public class CreatePositionCommand : IRequest<Result<PositionDto>>
{
    public Guid TenantId { get; set; }
    public CreatePositionDto PositionData { get; set; } = null!;
}

/// <summary>
/// Validator for CreatePositionCommand
/// </summary>
public class CreatePositionCommandValidator : AbstractValidator<CreatePositionCommand>
{
    public CreatePositionCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.PositionData)
            .NotNull().WithMessage("Position data is required");

        When(x => x.PositionData != null, () =>
        {
            RuleFor(x => x.PositionData.Code)
                .NotEmpty().WithMessage("Position code is required")
                .MaximumLength(50).WithMessage("Position code must not exceed 50 characters");

            RuleFor(x => x.PositionData.Title)
                .NotEmpty().WithMessage("Position title is required")
                .MaximumLength(100).WithMessage("Position title must not exceed 100 characters");

            RuleFor(x => x.PositionData.DepartmentId)
                .GreaterThan(0).WithMessage("Department ID is required");

            RuleFor(x => x.PositionData.Level)
                .GreaterThanOrEqualTo(0).WithMessage("Level must be a non-negative value");

            RuleFor(x => x.PositionData.MinSalary)
                .GreaterThanOrEqualTo(0).WithMessage("Minimum salary must be a non-negative value");

            RuleFor(x => x.PositionData.MaxSalary)
                .GreaterThanOrEqualTo(x => x.PositionData.MinSalary)
                .WithMessage("Maximum salary must be greater than or equal to minimum salary");
        });
    }
}

/// <summary>
/// Handler for CreatePositionCommand
/// </summary>
public class CreatePositionCommandHandler : IRequestHandler<CreatePositionCommand, Result<PositionDto>>
{
    private readonly IPositionRepository _positionRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreatePositionCommandHandler(
        IPositionRepository positionRepository,
        IDepartmentRepository departmentRepository,
        IUnitOfWork unitOfWork)
    {
        _positionRepository = positionRepository;
        _departmentRepository = departmentRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PositionDto>> Handle(CreatePositionCommand request, CancellationToken cancellationToken)
    {
        var data = request.PositionData;

        // Check if position with same code already exists
        var existingPosition = await _positionRepository.GetByCodeAsync(data.Code, cancellationToken);
        if (existingPosition != null)
        {
            return Result<PositionDto>.Failure(
                Error.Conflict("Position.Code", "A position with this code already exists"));
        }

        // Validate department
        var department = await _departmentRepository.GetByIdAsync(data.DepartmentId, cancellationToken);
        if (department == null)
        {
            return Result<PositionDto>.Failure(
                Error.NotFound("Department", $"Department with ID {data.DepartmentId} not found"));
        }

        // Create the position
        var position = new Position(
            data.Code,
            data.Title,
            data.DepartmentId,
            data.Level,
            data.MinSalary,
            data.MaxSalary,
            data.Currency,
            data.Description,
            data.HeadCount);

        // Set tenant ID
        position.SetTenantId(request.TenantId);

        // Update additional fields if provided
        if (!string.IsNullOrEmpty(data.Requirements) || !string.IsNullOrEmpty(data.Responsibilities))
        {
            position.Update(data.Title, data.Description, data.Level, data.HeadCount, data.Requirements, data.Responsibilities);
        }

        // Save to repository
        await _positionRepository.AddAsync(position, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            FilledPositions = 0,
            Vacancies = position.HeadCount ?? 0,
            Requirements = position.Requirements,
            Responsibilities = position.Responsibilities,
            IsActive = position.IsActive,
            CreatedAt = position.CreatedDate
        };

        return Result<PositionDto>.Success(positionDto);
    }
}
