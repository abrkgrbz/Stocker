using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Shared.Events.HR;

namespace Stocker.Modules.HR.Application.Features.Announcements.Commands;

/// <summary>
/// Command to publish an announcement
/// </summary>
public record PublishAnnouncementCommand : IRequest<Result<AnnouncementDto>>
{
    public int AnnouncementId { get; init; }
}

/// <summary>
/// Validator for PublishAnnouncementCommand
/// </summary>
public class PublishAnnouncementCommandValidator : AbstractValidator<PublishAnnouncementCommand>
{
    public PublishAnnouncementCommandValidator()
    {
        RuleFor(x => x.AnnouncementId)
            .GreaterThan(0).WithMessage("Valid announcement ID is required");
    }
}

/// <summary>
/// Handler for PublishAnnouncementCommand
/// </summary>
public class PublishAnnouncementCommandHandler : IRequestHandler<PublishAnnouncementCommand, Result<AnnouncementDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;
    private readonly IMediator _mediator;

    public PublishAnnouncementCommandHandler(IHRUnitOfWork unitOfWork, IMediator mediator)
    {
        _unitOfWork = unitOfWork;
        _mediator = mediator;
    }

    public async Task<Result<AnnouncementDto>> Handle(PublishAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _unitOfWork.Announcements.GetByIdAsync(request.AnnouncementId, cancellationToken);
        if (announcement == null)
        {
            return Result<AnnouncementDto>.Failure(
                Error.NotFound("Announcement.NotFound", $"Announcement with ID {request.AnnouncementId} not found"));
        }

        if (announcement.IsPublished)
        {
            return Result<AnnouncementDto>.Failure(
                Error.Conflict("Announcement.AlreadyPublished", "Announcement is already published"));
        }

        announcement.Publish();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new AnnouncementDto
        {
            Id = announcement.Id,
            Title = announcement.Title,
            Content = announcement.Content,
            AnnouncementType = announcement.Type.ToString(),
            Priority = announcement.Priority.ToString(),
            AuthorId = announcement.AuthorId,
            AuthorName = announcement.Author?.FullName ?? string.Empty,
            PublishDate = announcement.PublishDate,
            ExpiryDate = announcement.ExpiryDate,
            IsPublished = announcement.IsPublished,
            IsPinned = announcement.IsPinned,
            RequiresAcknowledgment = announcement.RequiresAcknowledgment,
            TargetDepartmentId = announcement.DepartmentId,
            TargetDepartmentName = announcement.Department?.Name,
            ViewCount = announcement.ViewCount,
            CreatedAt = announcement.CreatedDate
        };

        // Publish event to notify users about the new announcement
        var publishedEvent = new AnnouncementPublishedEvent(
            AnnouncementId: announcement.Id,
            TenantId: _unitOfWork.TenantId,
            Title: announcement.Title,
            Content: announcement.Content,
            Summary: null,
            AnnouncementType: announcement.Type.ToString(),
            Priority: announcement.Priority.ToString(),
            AuthorId: announcement.AuthorId,
            AuthorName: dto.AuthorName,
            TargetDepartmentId: announcement.DepartmentId,
            TargetDepartmentName: dto.TargetDepartmentName,
            RequiresAcknowledgment: announcement.RequiresAcknowledgment,
            PublishDate: announcement.PublishDate,
            ExpiryDate: announcement.ExpiryDate
        );

        await _mediator.Publish(publishedEvent, cancellationToken);

        return Result<AnnouncementDto>.Success(dto);
    }
}
