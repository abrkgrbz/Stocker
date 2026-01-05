using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Queries;

/// <summary>
/// Query to get a single training by ID
/// </summary>
public record GetTrainingByIdQuery(int TrainingId, bool IncludeParticipants = false) : IRequest<Result<TrainingDto>>;

/// <summary>
/// Handler for GetTrainingByIdQuery
/// </summary>
public class GetTrainingByIdQueryHandler : IRequestHandler<GetTrainingByIdQuery, Result<TrainingDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetTrainingByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TrainingDto>> Handle(GetTrainingByIdQuery request, CancellationToken cancellationToken)
    {
        // Get training
        Domain.Entities.Training? training;

        if (request.IncludeParticipants)
        {
            training = await _unitOfWork.Trainings.GetWithParticipantsAsync(request.TrainingId, cancellationToken);
        }
        else
        {
            training = await _unitOfWork.Trainings.GetByIdAsync(request.TrainingId, cancellationToken);
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
