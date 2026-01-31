using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Media.Queries.GetMediaList;

public class GetMediaListQueryHandler : IRequestHandler<GetMediaListQuery, Result<PagedResult<CmsMediaListDto>>>
{
    private readonly IMasterDbContext _context;

    public GetMediaListQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<CmsMediaListDto>>> Handle(GetMediaListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CmsMedia.AsQueryable();

        // Filter by type
        if (request.Type.HasValue)
        {
            query = query.Where(m => m.Type == request.Type.Value);
        }

        // Filter by folder
        if (!string.IsNullOrWhiteSpace(request.Folder))
        {
            query = query.Where(m => m.Folder == request.Folder);
        }

        // Search filter
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.ToLower();
            query = query.Where(m => m.FileName.ToLower().Contains(searchLower) ||
                                    (m.Title != null && m.Title.ToLower().Contains(searchLower)));
        }

        // Order by most recent
        query = query.OrderByDescending(m => m.UploadedAt);

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply pagination
        var media = await query
            .Skip((request.Page - 1) * request.Limit)
            .Take(request.Limit)
            .Select(m => new CmsMediaListDto
            {
                Id = m.Id,
                FileName = m.FileName,
                Url = m.Url,
                Type = m.Type,
                MimeType = m.MimeType,
                Size = m.Size,
                SizeFormatted = FormatBytes(m.Size),
                Width = m.Width,
                Height = m.Height,
                Folder = m.Folder,
                UploadedAt = m.UploadedAt
            })
            .ToListAsync(cancellationToken);

        var result = new PagedResult<CmsMediaListDto>(media, totalCount, request.Page, request.Limit);

        return Result<PagedResult<CmsMediaListDto>>.Success(result);
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
