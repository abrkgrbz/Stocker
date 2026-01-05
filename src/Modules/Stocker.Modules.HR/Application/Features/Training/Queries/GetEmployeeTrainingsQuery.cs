using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Queries;

/// <summary>
/// Query to get trainings for a specific employee
/// </summary>
public record GetEmployeeTrainingsQuery : IRequest<Result<List<EmployeeTrainingDto>>>
{
    public int EmployeeId { get; init; }
    public EmployeeTrainingStatus? Status { get; init; }
    public bool OnlyActive { get; init; } = true;
    public bool? ActiveCertificatesOnly { get; init; }
}

/// <summary>
/// Handler for GetEmployeeTrainingsQuery
/// </summary>
public class GetEmployeeTrainingsQueryHandler : IRequestHandler<GetEmployeeTrainingsQuery, Result<List<EmployeeTrainingDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeTrainingsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<EmployeeTrainingDto>>> Handle(GetEmployeeTrainingsQuery request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _unitOfWork.Employees.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<List<EmployeeTrainingDto>>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Get employee trainings
        IReadOnlyList<EmployeeTraining> employeeTrainings;

        if (request.Status.HasValue)
        {
            employeeTrainings = await _unitOfWork.EmployeeTrainings.GetByEmployeeAndStatusAsync(
                request.EmployeeId, request.Status.Value, cancellationToken);
        }
        else
        {
            employeeTrainings = await _unitOfWork.EmployeeTrainings.GetByEmployeeAsync(
                request.EmployeeId, cancellationToken);
        }

        // Filter by active status if needed
        var filteredTrainings = employeeTrainings.AsEnumerable();

        if (request.ActiveCertificatesOnly == true)
        {
            filteredTrainings = filteredTrainings.Where(et =>
                et.CertificateExpiryDate.HasValue &&
                et.CertificateExpiryDate.Value >= DateTime.UtcNow);
        }

        // Map to DTOs
        var employeeTrainingDtos = new List<EmployeeTrainingDto>();

        foreach (var employeeTraining in filteredTrainings)
        {
            // Get training details
            var training = await _unitOfWork.Trainings.GetByIdAsync(employeeTraining.TrainingId, cancellationToken);
            if (training == null || (request.OnlyActive && !training.IsActive))
            {
                continue;
            }

            employeeTrainingDtos.Add(new EmployeeTrainingDto
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
            });
        }

        // Order by enrollment date descending
        var orderedDtos = employeeTrainingDtos
            .OrderByDescending(et => et.EnrollmentDate)
            .ToList();

        return Result<List<EmployeeTrainingDto>>.Success(orderedDtos);
    }
}
