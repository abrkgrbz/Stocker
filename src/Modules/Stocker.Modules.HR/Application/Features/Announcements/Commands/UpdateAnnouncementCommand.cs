using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Commands;

/// <summary>
/// Command to update an existing announcement
/// </summary>
public record UpdateAnnouncementCommand : IRequest<Result<AnnouncementDto>>
{
    public int AnnouncementId { get; init; }
    public UpdateAnnouncementDto AnnouncementData { get; init; } = null!;
}

/// <summary>
/// Validator for UpdateAnnouncementCommand
/// </summary>
public class UpdateAnnouncementCommandValidator : AbstractValidator<UpdateAnnouncementCommand>
{
    public UpdateAnnouncementCommandValidator()
    {
        RuleFor(x => x.AnnouncementId)
            .GreaterThan(0).WithMessage("Valid announcement ID is required");

        RuleFor(x => x.AnnouncementData)
            .NotNull().WithMessage("Announcement data is required");

        When(x => x.AnnouncementData != null, () =>
        {
            RuleFor(x => x.AnnouncementData.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(200).WithMessage("Title must not exceed 200 characters");

            RuleFor(x => x.AnnouncementData.Content)
                .NotEmpty().WithMessage("Content is required");

            RuleFor(x => x.AnnouncementData.AnnouncementType)
                .NotEmpty().WithMessage("Announcement type is required");

            RuleFor(x => x.AnnouncementData.Priority)
                .NotEmpty().WithMessage("Priority is required");
        });
    }
}

/// <summary>
/// Handler for UpdateAnnouncementCommand
/// </summary>
public class UpdateAnnouncementCommandHandler : IRequestHandler<UpdateAnnouncementCommand, Result<AnnouncementDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public UpdateAnnouncementCommandHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AnnouncementDto>> Handle(UpdateAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _unitOfWork.Announcements.GetByIdAsync(request.AnnouncementId, cancellationToken);
        if (announcement == null)
        {
            return Result<AnnouncementDto>.Failure(
                Error.NotFound("Announcement.NotFound", $"Announcement with ID {request.AnnouncementId} not found"));
        }

        var data = request.AnnouncementData;

        // Parse enum values from string
        if (!Enum.TryParse<AnnouncementType>(data.AnnouncementType, true, out var announcementType))
        {
            announcementType = AnnouncementType.General;
        }

        if (!Enum.TryParse<AnnouncementPriority>(data.Priority, true, out var priority))
        {
            priority = AnnouncementPriority.Normal;
        }

        announcement.Update(
            data.Title,
            data.Content,
            announcementType,
            priority,
            data.TargetDepartmentId);

        announcement.SetExpiryDate(data.ExpiryDate);

        if (data.RequiresAcknowledgment != announcement.RequiresAcknowledgment)
        {
            announcement.SetRequiresAcknowledgment(data.RequiresAcknowledgment);
        }

        if (data.IsPinned && !announcement.IsPinned)
        {
            announcement.Pin();
        }
        else if (!data.IsPinned && announcement.IsPinned)
        {
            announcement.Unpin();
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new AnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            AnnouncementType = announcement.Type.ToString(),
            Priority = announcement.Priority.ToString(),
            AuthorId = announcement.AuthorId,
            PublishDate = announcement.PublishDate,
            ExpiryDate = announcement.ExpiryDate,
            IsPublished = announcement.IsPublished,
            IsPinned = announcement.IsPinned,
            RequiresAcknowledgment = announcement.RequiresAcknowledgment,
            TargetDepartmentId = announcement.DepartmentId,
            ViewCount = announcement.ViewCount,
            CreatedAt = announcement.CreatedDate
        };

        return Result<AnnouncementDto>.Success(dto);
    }
}
