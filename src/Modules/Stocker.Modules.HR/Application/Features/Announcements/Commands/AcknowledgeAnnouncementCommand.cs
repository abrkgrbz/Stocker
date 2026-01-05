using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Commands;

/// <summary>
/// Command to acknowledge an announcement by an employee
/// </summary>
public record AcknowledgeAnnouncementCommand : IRequest<Result<bool>>
{
    public int AnnouncementId { get; init; }
    public int EmployeeId { get; init; }
    public AcknowledgeAnnouncementDto? AcknowledgmentData { get; init; }
}

/// <summary>
/// Validator for AcknowledgeAnnouncementCommand
/// </summary>
public class AcknowledgeAnnouncementCommandValidator : AbstractValidator<AcknowledgeAnnouncementCommand>
{
    public AcknowledgeAnnouncementCommandValidator()
    {
        RuleFor(x => x.AnnouncementId)
            .GreaterThan(0).WithMessage("Valid announcement ID is required");

        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Valid employee ID is required");

        When(x => x.AcknowledgmentData != null, () =>
        {
            RuleFor(x => x.AcknowledgmentData!.Comments)
                .MaximumLength(500).WithMessage("Comments must not exceed 500 characters");
        });
    }
}

/// <summary>
/// Handler for AcknowledgeAnnouncementCommand
/// </summary>
public class AcknowledgeAnnouncementCommandHandler : IRequestHandler<AcknowledgeAnnouncementCommand, Result<bool>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public AcknowledgeAnnouncementCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(AcknowledgeAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _unitOfWork.Announcements.GetByIdAsync(request.AnnouncementId, cancellationToken);
        if (announcement == null)
        {
            return Result<bool>.Failure(
                Error.NotFound("Announcement.NotFound", $"Announcement with ID {request.AnnouncementId} not found"));
        }

        if (!announcement.RequiresAcknowledgment)
        {
            return Result<bool>.Failure(
                Error.Validation("Announcement.NoAcknowledgmentRequired", "This announcement does not require acknowledgment"));
        }

        // Check if already acknowledged by getting all acknowledgments and filtering
        var allAcknowledgments = await _unitOfWork.AnnouncementAcknowledgments.GetAllAsync(cancellationToken);
        var existingAck = allAcknowledgments.FirstOrDefault(a =>
            a.AnnouncementId == request.AnnouncementId &&
            a.EmployeeId == request.EmployeeId);

        if (existingAck != null)
        {
            return Result<bool>.Failure(
                Error.Conflict("Announcement.AlreadyAcknowledged", "Employee has already acknowledged this announcement"));
        }

        var acknowledgment = new AnnouncementAcknowledgment(
            request.AnnouncementId,
            request.EmployeeId,
            request.AcknowledgmentData?.Comments);

        acknowledgment.SetTenantId(_unitOfWork.TenantId);

        await _unitOfWork.AnnouncementAcknowledgments.AddAsync(acknowledgment, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
