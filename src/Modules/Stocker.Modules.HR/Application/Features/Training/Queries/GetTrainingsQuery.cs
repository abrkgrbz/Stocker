using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Enums;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Queries;

/// <summary>
/// Query to get trainings with filters
/// </summary>
public record GetTrainingsQuery : IRequest<Result<List<TrainingDto>>>
{
    public TrainingStatus? Status { get; init; }
    public bool? MandatoryOnly { get; init; }
    public bool? OnlineOnly { get; init; }
    public bool? WithCertification { get; init; }
    public DateTime? StartDateFrom { get; init; }
    public DateTime? StartDateTo { get; init; }
    public bool IncludeInactive { get; init; } = false;
    public bool? UpcomingOnly { get; init; }
    public int? UpcomingDays { get; init; } = 30;
}

/// <summary>
/// Handler for GetTrainingsQuery
/// </summary>
public class GetTrainingsQueryHandler : IRequestHandler<GetTrainingsQuery, Result<List<TrainingDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetTrainingsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<TrainingDto>>> Handle(GetTrainingsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Training> trainings;

        // Get trainings based on filters
        if (request.UpcomingOnly == true)
        {
            trainings = await _unitOfWork.Trainings.GetUpcomingAsync(
                request.UpcomingDays ?? 30, cancellationToken);
        }
        else if (request.Status.HasValue)
        {
            trainings = await _unitOfWork.Trainings.GetByStatusAsync(
                request.Status.Value, cancellationToken);
        }
        else if (request.MandatoryOnly == true)
        {
            trainings = await _unitOfWork.Trainings.GetMandatoryTrainingsAsync(cancellationToken);
        }
        else
        {
            trainings = await _unitOfWork.Trainings.GetAllAsync(cancellationToken);
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
