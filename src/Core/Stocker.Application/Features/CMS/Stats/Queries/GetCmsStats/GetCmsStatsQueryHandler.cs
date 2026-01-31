using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Enums.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Stats.Queries.GetCmsStats;

public class GetCmsStatsQueryHandler : IRequestHandler<GetCmsStatsQuery, Result<CmsStatsDto>>
{
    private readonly IMasterDbContext _context;

    public GetCmsStatsQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CmsStatsDto>> Handle(GetCmsStatsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var weekAgo = now.AddDays(-7);
        var monthAgo = now.AddDays(-30);

        // Total pages
        var totalPages = await _context.CmsPages.CountAsync(cancellationToken);
        var pagesThisWeek = await _context.CmsPages
            .CountAsync(p => p.CreatedAt >= weekAgo, cancellationToken);

        // Total posts
        var totalPosts = await _context.BlogPosts.CountAsync(cancellationToken);
        var postsThisMonth = await _context.BlogPosts
            .CountAsync(p => p.Status == PostStatus.Published && p.PublishDate >= monthAgo, cancellationToken);

        // Total views (pages + posts)
        var totalPageViews = await _context.CmsPages.SumAsync(p => p.Views, cancellationToken);
        var totalPostViews = await _context.BlogPosts.SumAsync(p => p.Views, cancellationToken);
        var totalViews = totalPageViews + totalPostViews;

        // Storage usage
        var mediaStats = await _context.CmsMedia
            .GroupBy(m => 1)
            .Select(g => new
            {
                TotalSize = g.Sum(m => m.Size),
                FileCount = g.Count()
            })
            .FirstOrDefaultAsync(cancellationToken);

        // Recent activity - simulated based on recent changes
        var recentActivity = new List<RecentActivityDto>();

        // Get recent posts
        var recentPosts = await _context.BlogPosts
            .Include(p => p.Author)
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .Select(p => new RecentActivityDto
            {
                Id = p.Id.ToString(),
                User = p.Author != null ? p.Author.FirstName + " " + p.Author.LastName.Substring(0, 1) + "." : "Bilinmeyen",
                Action = "created_post",
                Target = p.Title,
                Timestamp = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        // Get recent pages
        var recentPages = await _context.CmsPages
            .Include(p => p.Author)
            .OrderByDescending(p => p.CreatedAt)
            .Take(5)
            .Select(p => new RecentActivityDto
            {
                Id = p.Id.ToString(),
                User = p.Author != null ? p.Author.FirstName + " " + p.Author.LastName.Substring(0, 1) + "." : "Bilinmeyen",
                Action = "created_page",
                Target = p.Title,
                Timestamp = p.CreatedAt
            })
            .ToListAsync(cancellationToken);

        recentActivity.AddRange(recentPosts);
        recentActivity.AddRange(recentPages);
        recentActivity = recentActivity
            .OrderByDescending(a => a.Timestamp)
            .Take(10)
            .ToList();

        var stats = new CmsStatsDto
        {
            TotalPages = new StatItemDto
            {
                Count = totalPages,
                Change = pagesThisWeek,
                Period = "week"
            },
            TotalPosts = new StatItemDto
            {
                Count = totalPosts,
                Change = postsThisMonth,
                Period = "month"
            },
            TotalVisitors = new VisitorStatDto
            {
                Count = totalViews,
                ChangePercentage = 0, // Would need historical data to calculate
                Period = "30d"
            },
            Storage = new StorageStatDto
            {
                UsedBytes = mediaStats?.TotalSize ?? 0,
                FileCount = mediaStats?.FileCount ?? 0,
                UsedFormatted = FormatBytes(mediaStats?.TotalSize ?? 0)
            },
            RecentActivity = recentActivity
        };

        return Result<CmsStatsDto>.Success(stats);
    }

    private static string FormatBytes(long bytes)
    {
        string[] sizes = { "B", "KB", "MB", "GB", "TB" };
        double len = bytes;
        int order = 0;
        while (len >= 1024 && order < sizes.Length - 1)
        {
            order++;
            len = len / 1024;
        }
        return $"{len:0.##} {sizes[order]}";
    }
}
