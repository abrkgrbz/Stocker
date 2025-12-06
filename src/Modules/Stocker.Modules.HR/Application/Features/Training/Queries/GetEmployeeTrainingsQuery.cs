using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Queries;

/// <summary>
/// Query to get trainings for a specific employee
/// </summary>
public class GetEmployeeTrainingsQuery : IRequest<Result<List<EmployeeTrainingDto>>>
{
    public Guid TenantId { get; set; }
    public int EmployeeId { get; set; }
    public EmployeeTrainingStatus? Status { get; set; }
    public bool OnlyActive { get; set; } = true;
    public bool? ActiveCertificatesOnly { get; set; }
}

/// <summary>
/// Handler for GetEmployeeTrainingsQuery
/// </summary>
public class GetEmployeeTrainingsQueryHandler : IRequestHandler<GetEmployeeTrainingsQuery, Result<List<EmployeeTrainingDto>>>
{
    private readonly IEmployeeTrainingRepository _employeeTrainingRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly ITrainingRepository _trainingRepository;

    public GetEmployeeTrainingsQueryHandler(
        IEmployeeTrainingRepository employeeTrainingRepository,
        IEmployeeRepository employeeRepository,
        ITrainingRepository trainingRepository)
    {
        _employeeTrainingRepository = employeeTrainingRepository;
        _employeeRepository = employeeRepository;
        _trainingRepository = trainingRepository;
    }

    public async Task<Result<List<EmployeeTrainingDto>>> Handle(GetEmployeeTrainingsQuery request, CancellationToken cancellationToken)
    {
        // Verify employee exists
        var employee = await _employeeRepository.GetByIdAsync(request.EmployeeId, cancellationToken);
        if (employee == null)
        {
            return Result<List<EmployeeTrainingDto>>.Failure(
                Error.NotFound("Employee", $"Employee with ID {request.EmployeeId} not found"));
        }

        // Get employee trainings
        IReadOnlyList<EmployeeTraining> employeeTrainings;

        if (request.Status.HasValue)
        {
            employeeTrainings = await _employeeTrainingRepository.GetByEmployeeAndStatusAsync(
                request.EmployeeId, request.Status.Value, cancellationToken);
        }
        else
        {
            employeeTrainings = await _employeeTrainingRepository.GetByEmployeeAsync(
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
            var training = await _trainingRepository.GetByIdAsync(employeeTraining.TrainingId, cancellationToken);
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
