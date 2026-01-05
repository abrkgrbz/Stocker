using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Commands;

/// <summary>
/// Command to enroll an employee in a training
/// </summary>
public record EnrollEmployeeCommand : IRequest<Result<EmployeeTrainingDto>>
{
    public int EmployeeId { get; init; }
    public int TrainingId { get; init; }
    public string? Notes { get; init; }
}

/// <summary>
/// Validator for EnrollEmployeeCommand
/// </summary>
public class EnrollEmployeeCommandValidator : AbstractValidator<EnrollEmployeeCommand>
{
    public EnrollEmployeeCommandValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID is required");

        RuleFor(x => x.TrainingId)
            .GreaterThan(0).WithMessage("Training ID is required");

        RuleFor(x => x.Notes)
            .MaximumLength(500).WithMessage("Notes must not exceed 500 characters");
    }
}

/// <summary>
/// Handler for EnrollEmployeeCommand
/// </summary>
public class EnrollEmployeeCommandHandler : IRequestHandler<EnrollEmployeeCommand, Result<EmployeeTrainingDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public EnrollEmployeeCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeTrainingDto>> Handle(EnrollEmployeeCommand request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Verify training exists
        var training = await _unitOfWork.Trainings.GetWithParticipantsAsync(request.TrainingId, cancellationToken);
        if (training == null)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.NotFound("Training", $"Training with ID {request.TrainingId} not found"));
        }

        // Check if training is active
        if (!training.IsActive)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.Validation("Training.Status", "Cannot enroll in inactive training"));
        }

        // Check if training is in a valid status for enrollment
        if (training.Status == Domain.Enums.TrainingStatus.Completed ||
            training.Status == Domain.Enums.TrainingStatus.Cancelled)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.Validation("Training.Status", $"Cannot enroll in {training.Status.ToString().ToLower()} training"));
        }

        // Check if employee is already enrolled
        var existingEnrollment = await _unitOfWork.EmployeeTrainings.GetByEmployeeAndTrainingAsync(
            request.EmployeeId, request.TrainingId, cancellationToken);

        if (existingEnrollment != null && existingEnrollment.Status != EmployeeTrainingStatus.Cancelled)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.Conflict("EmployeeTraining", "Employee is already enrolled in this training"));
        }

        // Check if training has available slots
        if (!training.HasAvailableSlots())
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.Validation("Training.Capacity", "Training has reached maximum capacity"));
        }

        // Create employee training enrollment
        var employeeTraining = new EmployeeTraining(request.EmployeeId, request.TrainingId);

        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            employeeTraining.SetNotes(request.Notes);
        }

        // Set tenant ID
        employeeTraining.SetTenantId(_unitOfWork.TenantId);

        // Save to repository
        await _unitOfWork.EmployeeTrainings.AddAsync(employeeTraining, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Map to DTO
        var employeeTrainingDto = new EmployeeTrainingDto
        {
            Id = employeeTraining.Id,
            EmployeeId = employeeTraining.EmployeeId,
            EmployeeName = $"{employee.FirstName} {employee.LastName}",
            EmployeeCode = employee.EmployeeCode,
            TrainingId = employeeTraining.TrainingId,
            TrainingTitle = training.Title,
            EnrollmentDate = employeeTraining.EnrollmentDate,
            Status = employeeTraining.Status,
            CompletedDate = employeeTraining.CompletedDate,
            Score = employeeTraining.Score,
            IsPassed = employeeTraining.IsPassed,
            CertificateNumber = employeeTraining.CertificateNumber,
            CertificateUrl = employeeTraining.CertificateUrl,
            CertificateIssueDate = employeeTraining.CertificateIssueDate,
            CertificateExpiryDate = employeeTraining.CertificateExpiryDate,
            Feedback = employeeTraining.Feedback,
            FeedbackRating = employeeTraining.FeedbackRating,
            Notes = employeeTraining.Notes,
            CancellationReason = employeeTraining.CancellationReason,
            CreatedAt = employeeTraining.CreatedDate
        };

        return Result<EmployeeTrainingDto>.Success(employeeTrainingDto);
    }
}
