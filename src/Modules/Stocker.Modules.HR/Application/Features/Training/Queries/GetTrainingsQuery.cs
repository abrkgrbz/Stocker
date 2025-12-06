using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Queries;

/// <summary>
/// Query to get trainings with filters
/// </summary>
public class GetTrainingsQuery : IRequest<Result<List<TrainingDto>>>
{
    public Guid TenantId { get; set; }
    public TrainingStatus? Status { get; set; }
    public bool? MandatoryOnly { get; set; }
    public bool? OnlineOnly { get; set; }
    public bool? WithCertification { get; set; }
    public DateTime? StartDateFrom { get; set; }
    public DateTime? StartDateTo { get; set; }
    public bool IncludeInactive { get; set; } = false;
    public bool? UpcomingOnly { get; set; }
    public int? UpcomingDays { get; set; } = 30;
}

/// <summary>
/// Handler for GetTrainingsQuery
/// </summary>
public class GetTrainingsQueryHandler : IRequestHandler<GetTrainingsQuery, Result<List<TrainingDto>>>
{
    private readonly ITrainingRepository _trainingRepository;

    public GetTrainingsQueryHandler(ITrainingRepository trainingRepository)
    {
        _trainingRepository = trainingRepository;
    }

    public async Task<Result<List<TrainingDto>>> Handle(GetTrainingsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Training> trainings;

        // Get trainings based on filters
        if (request.UpcomingOnly == true)
        {
            trainings = await _trainingRepository.GetUpcomingAsync(
                request.UpcomingDays ?? 30, cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            trainings = await _trainingRepository.GetByStatusAsync(
                request.Status.Value, cancellationToken);
        }
        else if (request.MandatoryOnly == true)
        {
            trainings = await _trainingRepository.GetMandatoryTrainingsAsync(cancellationToken);
        }
        else
        {
            trainings = await _trainingRepository.GetAllAsync(cancellationToken);
        }

        // Apply additional filters
        var filteredTrainings = trainings.AsEnumerable();

        if (!request.IncludeInactive)
        {
            filteredTrainings = filteredTrainings.Where(t => t.IsActive);
        }

        if (request.MandatoryOnly.HasValue && request.UpcomingOnly != true)
        {
            filteredTrainings = filteredTrainings.Where(t => t.IsMandatory == request.MandatoryOnly.Value);
        }

        if (request.OnlineOnly.HasValue)
        {
            filteredTrainings = filteredTrainings.Where(t => t.IsOnline == request.OnlineOnly.Value);
        }

        if (request.WithCertification.HasValue)
        {
            filteredTrainings = filteredTrainings.Where(t => t.HasCertification == request.WithCertification.Value);
        }

        if (request.StartDateFrom.HasValue)
        {
            filteredTrainings = filteredTrainings.Where(t => t.StartDate >= request.StartDateFrom.Value);
        }

        if (request.StartDateTo.HasValue)
        {
            filteredTrainings = filteredTrainings.Where(t => t.StartDate <= request.StartDateTo.Value);
        }

        // Map to DTOs
        var trainingDtos = filteredTrainings.Select(training => new TrainingDto
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
        })
        .OrderBy(t => t.StartDate)
        .ThenBy(t => t.Title)
        .ToList();

        return Result<List<TrainingDto>>.Success(trainingDtos);
    }
}
