using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Commands;

/// <summary>
/// Command to mark an employee's training as complete
/// </summary>
public record CompleteTrainingCommand : IRequest<Result<EmployeeTrainingDto>>
{
    public int TrainingId { get; init; }
    public int EmployeeId { get; init; }
    public decimal? Score { get; init; }
    public bool IsPassed { get; init; } = true;
    public string? CompletionNotes { get; init; }
    public string? CertificateNumber { get; init; }
    public string? CertificateUrl { get; init; }
    public DateTime? CertificateExpiryDate { get; init; }
}

/// <summary>
/// Validator for CompleteTrainingCommand
/// </summary>
public class CompleteTrainingCommandValidator : AbstractValidator<CompleteTrainingCommand>
{
    public CompleteTrainingCommandValidator()
    {
        RuleFor(x => x.TrainingId)
            .GreaterThan(0).WithMessage("Training ID is required");

        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Employee ID is required");

        RuleFor(x => x.Score)
            .GreaterThanOrEqualTo(0).When(x => x.Score.HasValue)
            .WithMessage("Score must be greater than or equal to 0");

        RuleFor(x => x.CertificateNumber)
            .MaximumLength(100).WithMessage("Certificate number must not exceed 100 characters");

        RuleFor(x => x.CertificateUrl)
            .MaximumLength(500).WithMessage("Certificate URL must not exceed 500 characters");

        RuleFor(x => x.CertificateExpiryDate)
            .GreaterThan(DateTime.UtcNow).When(x => x.CertificateExpiryDate.HasValue)
            .WithMessage("Certificate expiry date must be in the future");
    }
}

/// <summary>
/// Handler for CompleteTrainingCommand
/// </summary>
public class CompleteTrainingCommandHandler : IRequestHandler<CompleteTrainingCommand, Result<EmployeeTrainingDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public CompleteTrainingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeTrainingDto>> Handle(CompleteTrainingCommand request, CancellationToken cancellationToken)
    {
        // Get employee training by employee and training IDs
        var employeeTraining = await _unitOfWork.EmployeeTrainings.GetByEmployeeAndTrainingAsync(
            request.EmployeeId, request.TrainingId, cancellationToken);

        if (employeeTraining == null)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.NotFound("EmployeeTraining", $"Employee training not found for employee {request.EmployeeId} and training {request.TrainingId}"));
        }

        // Verify training exists
        var training = await _unitOfWork.Trainings.GetByIdAsync(employeeTraining.TrainingId, cancellationToken);
        if (training == null)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.NotFound("Training", $"Training with ID {employeeTraining.TrainingId} not found"));
        }

        // Verify employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(employeeTraining.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.NotFound("Employee", $"Employee with ID {employeeTraining.EmployeeId} not found"));
        }

        // Check if training can be completed
        if (employeeTraining.Status == EmployeeTrainingStatus.Completed)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.Validation("EmployeeTraining.Status", "Training is already completed"));
        }

        if (employeeTraining.Status == EmployeeTrainingStatus.Cancelled)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.Validation("EmployeeTraining.Status", "Cannot complete cancelled training"));
        }

        // Complete the training
        try
        {
            employeeTraining.Complete(request.Score, request.IsPassed);
        }
        catch (InvalidOperationException ex)
        {
            return Result<EmployeeTrainingDto>.Failure(
                Error.Validation("EmployeeTraining.Status", ex.Message));
        }

        // Issue certificate if provided and training has certification
        if (training.HasCertification &&
            request.IsPassed &&
            !string.IsNullOrWhiteSpace(request.CertificateNumber))
        {
            try
            {
                employeeTraining.IssueCertificate(
                    request.CertificateNumber,
                    request.CertificateUrl,
                    request.CertificateExpiryDate);
            }
            catch (InvalidOperationException ex)
            {
                return Result<EmployeeTrainingDto>.Failure(
                    Error.Validation("EmployeeTraining.Certificate", ex.Message));
            }
        }

        // Save changes
        _unitOfWork.EmployeeTrainings.Update(employeeTraining);
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
