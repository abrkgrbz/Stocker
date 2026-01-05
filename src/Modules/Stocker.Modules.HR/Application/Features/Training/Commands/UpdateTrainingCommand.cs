using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Commands;

/// <summary>
/// Command to update an existing training
/// </summary>
public record UpdateTrainingCommand : IRequest<Result<TrainingDto>>
{
    public int TrainingId { get; init; }
    public UpdateTrainingDto TrainingData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdateTrainingCommand
/// </summary>
public class UpdateTrainingCommandValidator : AbstractValidator<UpdateTrainingCommand>
{
    public UpdateTrainingCommandValidator()
    {
        RuleFor(x => x.TrainingId)
            .GreaterThan(0).WithMessage("Training ID is required");

        RuleFor(x => x.TrainingData)
            .NotNull().WithMessage("Training data is required");

        When(x => x.TrainingData != null, () =>
        {
            RuleFor(x => x.TrainingData.Title)
                .NotEmpty().WithMessage("Training title is required")
                .MaximumLength(200).WithMessage("Training title must not exceed 200 characters");

            RuleFor(x => x.TrainingData.Description)
                .MaximumLength(1000).WithMessage("Description must not exceed 1000 characters");

            RuleFor(x => x.TrainingData.DurationHours)
                .GreaterThan(0).WithMessage("Duration must be greater than 0");

            RuleFor(x => x.TrainingData.StartDate)
                .NotNull().WithMessage("Start date is required");

            RuleFor(x => x.TrainingData.EndDate)
                .NotNull().WithMessage("End date is required")
                .GreaterThan(x => x.TrainingData.StartDate ?? DateTime.MinValue)
                .When(x => x.TrainingData.StartDate.HasValue)
                .WithMessage("End date must be after start date");

            RuleFor(x => x.TrainingData.MaxParticipants)
                .GreaterThan(0).When(x => x.TrainingData.MaxParticipants.HasValue)
                .WithMessage("Max participants must be greater than 0");

            RuleFor(x => x.TrainingData.Cost)
                .GreaterThanOrEqualTo(0).When(x => x.TrainingData.Cost.HasValue)
                .WithMessage("Cost must be greater than or equal to 0");

            RuleFor(x => x.TrainingData.OnlineUrl)
                .NotEmpty().When(x => x.TrainingData.IsOnline)
                .WithMessage("Online URL is required for online trainings");

            RuleFor(x => x.TrainingData.CertificationValidityMonths)
                .GreaterThan(0).When(x => x.TrainingData.HasCertification && x.TrainingData.CertificationValidityMonths.HasValue)
                .WithMessage("Certification validity must be greater than 0");
        });
    }
}

/// <summary>
/// Handler for UpdateTrainingCommand
/// </summary>
public class UpdateTrainingCommandHandler : IRequestHandler<UpdateTrainingCommand, Result<TrainingDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateTrainingCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TrainingDto>> Handle(UpdateTrainingCommand request, CancellationToken cancellationToken)
    {
        // Get the training
        var training = await _unitOfWork.Trainings.GetByIdAsync(request.TrainingId, cancellationToken);
        if (training == null)
        {
            return Result<TrainingDto>.Failure(
                Error.NotFound("Training", $"Training with ID {request.TrainingId} not found"));
        }

        // Validate dates
        if (request.TrainingData.StartDate.HasValue && request.TrainingData.EndDate.HasValue)
        {
            if (request.TrainingData.EndDate.Value <= request.TrainingData.StartDate.Value)
            {
                return Result<TrainingDto>.Failure(
                    Error.Validation("Training.Dates", "End date must be after start date"));
            }
        }

        // Update training details
        training.Update(
            request.TrainingData.Title,
            request.TrainingData.Description,
            request.TrainingData.StartDate ?? training.StartDate,
            request.TrainingData.EndDate ?? training.EndDate,
            request.TrainingData.DurationHours,
            request.TrainingData.Provider,
            request.TrainingData.Instructor,
            request.TrainingData.Location,
            request.TrainingData.MaxParticipants);

        // Update online details
        training.SetOnlineDetails(request.TrainingData.IsOnline, request.TrainingData.OnlineUrl);

        // Update cost if specified
        if (request.TrainingData.Cost.HasValue)
        {
            training.SetCost(request.TrainingData.Cost, request.TrainingData.Currency ?? "TRY");
        }

        // Update certification details
        if (request.TrainingData.HasCertification)
        {
            training.SetCertification(
                true,
                request.TrainingData.Title, // Use training title as certificate name
                request.TrainingData.CertificationValidityMonths);
        }
        else
        {
            training.SetCertification(false);
        }

        // Update mandatory flag
        training.SetMandatory(request.TrainingData.IsMandatory);

        // Save changes
        _unitOfWork.Trainings.Update(training);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
