using FluentValidation;
using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Queries;

/// <summary>
/// Query to get an announcement by ID
/// </summary>
public record GetAnnouncementByIdQuery(int AnnouncementId) : IRequest<Result<AnnouncementDto>>;

/// <summary>
/// Validator for GetAnnouncementByIdQuery
/// </summary>
public class GetAnnouncementByIdQueryValidator : AbstractValidator<GetAnnouncementByIdQuery>
{
    public GetAnnouncementByIdQueryValidator()
    {
        RuleFor(x => x.AnnouncementId)
            .GreaterThan(0).WithMessage("Announcement ID is required");
    }
}

/// <summary>
/// Handler for GetAnnouncementByIdQuery
/// </summary>
public class GetAnnouncementByIdQueryHandler : IRequestHandler<GetAnnouncementByIdQuery, Result<AnnouncementDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetAnnouncementByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<AnnouncementDto>> Handle(GetAnnouncementByIdQuery request, CancellationToken cancellationToken)
    {
        var announcement = await _unitOfWork.Announcements.GetByIdAsync(request.AnnouncementId, cancellationToken);
        if (announcement == null)
        {
            return Result<AnnouncementDto>.Failure(
                Error.NotFound("Announcement.NotFound", $"Announcement with ID {request.AnnouncementId} not found"));
        }

        // Get acknowledgments count
        var allAcknowledgments = await _unitOfWork.AnnouncementAcknowledgments.GetAllAsync(cancellationToken);
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
