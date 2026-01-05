using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Entities;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Announcements.Queries;

/// <summary>
/// Query to get all announcements with optional filtering
/// </summary>
public record GetAnnouncementsQuery : IRequest<Result<List<AnnouncementDto>>>
{
    public string? Type { get; init; }
    public bool? IsPublished { get; init; }
    public bool? IsActive { get; init; }
    public int? DepartmentId { get; init; }
}

/// <summary>
/// Handler for GetAnnouncementsQuery
/// </summary>
public class GetAnnouncementsQueryHandler : IRequestHandler<GetAnnouncementsQuery, Result<List<AnnouncementDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetAnnouncementsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<AnnouncementDto>>> Handle(GetAnnouncementsQuery request, CancellationToken cancellationToken)
    {
        var announcements = await _unitOfWork.Announcements.GetAllAsync(cancellationToken);

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
