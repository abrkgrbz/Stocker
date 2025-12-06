using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Queries;

/// <summary>
/// Query to get a single training by ID
/// </summary>
public class GetTrainingByIdQuery : IRequest<Result<TrainingDto>>
{
    public Guid TenantId { get; set; }
    public int TrainingId { get; set; }
    public bool IncludeParticipants { get; set; } = false;
}

/// <summary>
/// Handler for GetTrainingByIdQuery
/// </summary>
public class GetTrainingByIdQueryHandler : IRequestHandler<GetTrainingByIdQuery, Result<TrainingDto>>
{
    private readonly ITrainingRepository _trainingRepository;
    private readonly IEmployeeTrainingRepository _employeeTrainingRepository;
    private readonly IEmployeeRepository _employeeRepository;

    public GetTrainingByIdQueryHandler(
        ITrainingRepository trainingRepository,
        IEmployeeTrainingRepository employeeTrainingRepository,
        IEmployeeRepository employeeRepository)
    {
        _trainingRepository = trainingRepository;
        _employeeTrainingRepository = employeeTrainingRepository;
        _employeeRepository = employeeRepository;
    }

    public async Task<Result<TrainingDto>> Handle(GetTrainingByIdQuery request, CancellationToken cancellationToken)
    {
        // Get training
        Domain.Entities.Training? training;

        if (request.IncludeParticipants)
        {
            training = await _trainingRepository.GetWithParticipantsAsync(request.TrainingId, cancellationToken);
        }
        else
        {
            training = await _trainingRepository.GetByIdAsync(request.TrainingId, cancellationToken);
        }

        if (training == null)
        {
            return Result<TrainingDto>.Failure(
                Error.NotFound("Training", $"Training with ID {request.TrainingId} not found"));
        }

        // Map to DTO
        var trainingDto = new TrainingDto
        {
            Id = training.Id,
            Code = training.Code,
            Title = training.Title,
            Description = training.Description,
            Provider = training.Provider,
            Instructor = training.Instructor,
            Location = training.Location,
            IsOnline = training.IsOnline,
            OnlineUrl = training.OnlineUrl,
            StartDate = training.StartDate,
            EndDate = training.EndDate,
            DurationHours = training.DurationHours,
            MaxParticipants = training.MaxParticipants,
            CurrentParticipants = training.GetCurrentParticipantCount(),
            Cost = training.Cost,
            Currency = training.Currency,
            Status = training.Status,
            IsMandatory = training.IsMandatory,
            HasCertification = training.HasCertification,
            CertificationValidityMonths = training.CertificationValidityMonths,
            Notes = training.Notes,
            CreatedAt = training.CreatedDate
        };

        return Result<TrainingDto>.Success(trainingDto);
    }
}
