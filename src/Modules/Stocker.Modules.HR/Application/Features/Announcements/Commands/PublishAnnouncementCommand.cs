using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Commands;

/// <summary>
/// Command to publish an announcement
/// </summary>
public class PublishAnnouncementCommand : IRequest<Result<AnnouncementDto>>
{
    public Guid TenantId { get; set; }
    public int AnnouncementId { get; set; }
}

/// <summary>
/// Validator for PublishAnnouncementCommand
/// </summary>
public class PublishAnnouncementCommandValidator : AbstractValidator<PublishAnnouncementCommand>
{
    public PublishAnnouncementCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.AnnouncementId)
            .GreaterThan(0).WithMessage("Valid announcement ID is required");
    }
}

/// <summary>
/// Handler for PublishAnnouncementCommand
/// </summary>
public class PublishAnnouncementCommandHandler : IRequestHandler<PublishAnnouncementCommand, Result<AnnouncementDto>>
{
    private readonly IAnnouncementRepository _announcementRepository;
    private readonly IUnitOfWork _unitOfWork;

    public PublishAnnouncementCommandHandler(
        IAnnouncementRepository announcementRepository,
        IUnitOfWork unitOfWork)
    {
        _announcementRepository = announcementRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AnnouncementDto>> Handle(PublishAnnouncementCommand request, CancellationToken cancellationToken)
    {
        var announcement = await _announcementRepository.GetByIdAsync(request.AnnouncementId, cancellationToken);
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
