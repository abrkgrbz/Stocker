using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Training.Commands;

/// <summary>
/// Command to delete a training
/// </summary>
public class DeleteTrainingCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int TrainingId { get; set; }
}

/// <summary>
/// Validator for DeleteTrainingCommand
/// </summary>
public class DeleteTrainingCommandValidator : AbstractValidator<DeleteTrainingCommand>
{
    public DeleteTrainingCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.TrainingId)
            .GreaterThan(0).WithMessage("Training ID is required");
    }
}

/// <summary>
/// Handler for DeleteTrainingCommand
/// </summary>
public class DeleteTrainingCommandHandler : IRequestHandler<DeleteTrainingCommand, Result<bool>>
{
    private readonly ITrainingRepository _trainingRepository;
    private readonly IEmployeeTrainingRepository _employeeTrainingRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteTrainingCommandHandler(
        ITrainingRepository trainingRepository,
        IEmployeeTrainingRepository employeeTrainingRepository,
        IUnitOfWork unitOfWork)
    {
        _trainingRepository = trainingRepository;
        _employeeTrainingRepository = employeeTrainingRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteTrainingCommand request, CancellationToken cancellationToken)
    {
        // Get the training with participants
        var training = await _trainingRepository.GetWithParticipantsAsync(request.TrainingId, cancellationToken);
        if (training == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Training", $"Training with ID {request.TrainingId} not found"));
        }

        // Check if training has enrolled participants
        var participants = await _employeeTrainingRepository.GetByTrainingAsync(request.TrainingId, cancellationToken);
        if (participants.Any(p => p.Status == EmployeeTrainingStatus.Enrolled || p.Status == EmployeeTrainingStatus.InProgress))
        {
            return Result<bool>.Failure(
                Error.Validation("Training.Participants", "Cannot delete training with active participants. Cancel the training first."));
        }

        // If training is completed, just deactivate instead of hard delete
        if (training.Status == Domain.Enums.TrainingStatus.Completed)
        {
            training.Deactivate();
            await _trainingRepository.UpdateAsync(training, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result<bool>.Success(true);
        }

        // Soft delete the training via deactivation
        training.Deactivate();
        await _trainingRepository.UpdateAsync(training, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
