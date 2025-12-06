using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Queries;

/// <summary>
/// Query to get an announcement by ID
/// </summary>
public class GetAnnouncementByIdQuery : IRequest<Result<AnnouncementDto>>
{
    public Guid TenantId { get; set; }
    public int AnnouncementId { get; set; }
}

/// <summary>
/// Handler for GetAnnouncementByIdQuery
/// </summary>
public class GetAnnouncementByIdQueryHandler : IRequestHandler<GetAnnouncementByIdQuery, Result<AnnouncementDto>>
{
    private readonly IAnnouncementRepository _announcementRepository;
    private readonly IAnnouncementAcknowledgmentRepository _acknowledgmentRepository;

    public GetAnnouncementByIdQueryHandler(
        IAnnouncementRepository announcementRepository,
        IAnnouncementAcknowledgmentRepository acknowledgmentRepository)
    {
        _announcementRepository = announcementRepository;
        _acknowledgmentRepository = acknowledgmentRepository;
    }

    public async Task<Result<AnnouncementDto>> Handle(GetAnnouncementByIdQuery request, CancellationToken cancellationToken)
    {
        var announcement = await _announcementRepository.GetByIdAsync(request.AnnouncementId, cancellationToken);
        if (announcement == null)
        {
            return Result<AnnouncementDto>.Failure(
                Error.NotFound("Announcement.NotFound", $"Announcement with ID {request.AnnouncementId} not found"));
        }

        // Get acknowledgments count
        var allAcknowledgments = await _acknowledgmentRepository.GetAllAsync(cancellationToken);
        var acknowledgmentCount = allAcknowledgments.Count(a => a.AnnouncementId == request.AnnouncementId);

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
            AcknowledgmentCount = acknowledgmentCount,
            TargetDepartmentId = announcement.DepartmentId,
            AttachmentUrl = announcement.AttachmentUrl,
            ViewCount = announcement.ViewCount,
            CreatedAt = announcement.CreatedDate,
            UpdatedAt = announcement.UpdatedDate
        };

        return Result<AnnouncementDto>.Success(dto);
    }
}
