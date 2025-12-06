using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Commands;

/// <summary>
/// Command to create a new training program
/// </summary>
public class CreateTrainingCommand : IRequest<Result<TrainingDto>>
{
    public Guid TenantId { get; set; }
    public CreateTrainingDto TrainingData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateTrainingCommand
/// </summary>
public class CreateTrainingCommandValidator : AbstractValidator<CreateTrainingCommand>
{
    public CreateTrainingCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.TrainingData)
            .NotNull().WithMessage("Training data is required");

        When(x => x.TrainingData != null, () =>
        {
            RuleFor(x => x.TrainingData.Code)
                .NotEmpty().WithMessage("Training code is required")
                .MaximumLength(50).WithMessage("Training code must not exceed 50 characters");

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
/// Handler for CreateTrainingCommand
/// </summary>
public class CreateTrainingCommandHandler : IRequestHandler<CreateTrainingCommand, Result<TrainingDto>>
{
    private readonly ITrainingRepository _trainingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTrainingCommandHandler(
        ITrainingRepository trainingRepository,
        IUnitOfWork unitOfWork)
    {
        _trainingRepository = trainingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<TrainingDto>> Handle(CreateTrainingCommand request, CancellationToken cancellationToken)
    {
        // Check if training with same code already exists
        var existingTraining = await _trainingRepository.GetByCodeAsync(request.TrainingData.Code, cancellationToken);
        if (existingTraining != null)
        {
            return Result<TrainingDto>.Failure(
                Error.Conflict("Training.Code", "A training with this code already exists"));
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

        // Create the training
        var training = new Domain.Entities.Training(
            request.TrainingData.Code,
            request.TrainingData.Title,
            request.TrainingData.StartDate ?? DateTime.UtcNow,
            request.TrainingData.EndDate ?? DateTime.UtcNow.AddDays(1),
            request.TrainingData.DurationHours,
            request.TrainingData.Description,
            request.TrainingData.Provider,
            request.TrainingData.IsMandatory);

        // Set tenant ID
        training.SetTenantId(request.TenantId);

        // Update additional details
        training.Update(
            request.TrainingData.Title,
            request.TrainingData.Description,
            request.TrainingData.StartDate ?? DateTime.UtcNow,
            request.TrainingData.EndDate ?? DateTime.UtcNow.AddDays(1),
            request.TrainingData.DurationHours,
            request.TrainingData.Provider,
            request.TrainingData.Instructor,
            request.TrainingData.Location,
            request.TrainingData.MaxParticipants);

        // Set online details if applicable
        if (request.TrainingData.IsOnline)
        {
            training.SetOnlineDetails(true, request.TrainingData.OnlineUrl);
        }

        // Set cost if specified
        if (request.TrainingData.Cost.HasValue)
        {
            training.SetCost(request.TrainingData.Cost, request.TrainingData.Currency ?? "TRY");
        }

        // Set certification details if applicable
        if (request.TrainingData.HasCertification)
        {
            training.SetCertification(
                true,
                request.TrainingData.Title, // Use training title as certificate name
                request.TrainingData.CertificationValidityMonths);
        }

        // Set mandatory flag
        training.SetMandatory(request.TrainingData.IsMandatory);

        // Save to repository
        await _trainingRepository.AddAsync(training, cancellationToken);
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
            CurrentParticipants = 0,
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
