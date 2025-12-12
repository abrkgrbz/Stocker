using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Achievements ====================
public class GetAchievementsQuery : IRequest<List<AchievementDto>>
{
}

public class GetAchievementsQueryHandler : IRequestHandler<GetAchievementsQuery, List<AchievementDto>>
{
    private readonly CMSDbContext _context;

    public GetAchievementsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<AchievementDto>> Handle(GetAchievementsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Achievements
            .OrderBy(x => x.SortOrder)
            .Select(e => new AchievementDto(
                e.Id, e.Title, e.Value, e.Icon, e.IconColor, e.Description, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Achievements ====================
public class GetActiveAchievementsQuery : IRequest<List<AchievementDto>>
{
}

public class GetActiveAchievementsQueryHandler : IRequestHandler<GetActiveAchievementsQuery, List<AchievementDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveAchievementsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<AchievementDto>> Handle(GetActiveAchievementsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Achievements
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new AchievementDto(
                e.Id, e.Title, e.Value, e.Icon, e.IconColor, e.Description, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Achievement By ID ====================
public class GetAchievementByIdQuery : IRequest<AchievementDto?>
{
    public Guid Id { get; set; }
}

public class GetAchievementByIdQueryHandler : IRequestHandler<GetAchievementByIdQuery, AchievementDto?>
{
    private readonly CMSDbContext _context;

    public GetAchievementByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<AchievementDto?> Handle(GetAchievementByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Achievements.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new AchievementDto(
            entity.Id, entity.Title, entity.Value, entity.Icon, entity.IconColor, entity.Description, entity.SortOrder, entity.IsActive, entity.CreatedAt);
    }
}
