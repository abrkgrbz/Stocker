using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Queries;

/// <summary>
/// Query to get all announcements with optional filtering
/// </summary>
public class GetAnnouncementsQuery : IRequest<Result<List<AnnouncementDto>>>
{
    public Guid TenantId { get; set; }
    public string? Type { get; set; }
    public bool? IsPublished { get; set; }
    public bool? IsActive { get; set; }
    public int? DepartmentId { get; set; }
}

/// <summary>
/// Handler for GetAnnouncementsQuery
/// </summary>
public class GetAnnouncementsQueryHandler : IRequestHandler<GetAnnouncementsQuery, Result<List<AnnouncementDto>>>
{
    private readonly IAnnouncementRepository _announcementRepository;

    public GetAnnouncementsQueryHandler(IAnnouncementRepository announcementRepository)
    {
        _announcementRepository = announcementRepository;
    }

    public async Task<Result<List<AnnouncementDto>>> Handle(GetAnnouncementsQuery request, CancellationToken cancellationToken)
    {
        var announcements = await _announcementRepository.GetAllAsync(cancellationToken);

        // Apply filters
        var filtered = announcements.AsEnumerable();

        if (!string.IsNullOrEmpty(request.Type))
        {
            if (Enum.TryParse<AnnouncementType>(request.Type, true, out var typeEnum))
            {
                filtered = filtered.Where(a => a.Type == typeEnum);
            }
        }

        if (request.IsPublished.HasValue)
        {
            filtered = filtered.Where(a => a.IsPublished == request.IsPublished.Value);
        }

        if (request.IsActive.HasValue)
        {
            filtered = filtered.Where(a => a.IsActive == request.IsActive.Value);
        }

        if (request.DepartmentId.HasValue)
        {
            filtered = filtered.Where(a => a.DepartmentId == request.DepartmentId.Value);
        }

        var dtos = filtered.Select(a => new AnnouncementDto
        {
            Id = a.Id,
            Title = a.Title,
            Content = a.Content,
            AnnouncementType = a.Type.ToString(),
            Priority = a.Priority.ToString(),
            AuthorId = a.AuthorId,
            PublishDate = a.PublishDate,
            ExpiryDate = a.ExpiryDate,
            IsPublished = a.IsPublished,
            IsPinned = a.IsPinned,
            RequiresAcknowledgment = a.RequiresAcknowledgment,
            TargetDepartmentId = a.DepartmentId,
            ViewCount = a.ViewCount,
            CreatedAt = a.CreatedDate
        }).OrderByDescending(a => a.IsPinned)
          .ThenByDescending(a => a.Priority)
          .ThenByDescending(a => a.PublishDate)
          .ToList();

        return Result<List<AnnouncementDto>>.Success(dtos);
    }
}
