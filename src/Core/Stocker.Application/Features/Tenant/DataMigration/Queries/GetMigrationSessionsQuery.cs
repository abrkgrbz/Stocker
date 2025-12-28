using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetMigrationSessionsQuery : IRequest<Result<PagedMigrationSessionsResponse>>
{
    public Guid TenantId { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Status { get; set; }
}

public class PagedMigrationSessionsResponse
{
    public List<MigrationSessionResponse> Sessions { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
}

public class GetMigrationSessionsQueryHandler : IRequestHandler<GetMigrationSessionsQuery, Result<PagedMigrationSessionsResponse>>
{
    private readonly IMasterDbContext _context;

    public GetMigrationSessionsQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedMigrationSessionsResponse>> Handle(GetMigrationSessionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.MigrationSessions
            .AsNoTracking()
            .Where(s => s.TenantId == request.TenantId);

        // Filter by status
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<MigrationSessionStatus>(request.Status, true, out var status))
        {
            query = query.Where(s => s.Status == status);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var sessions = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var response = new PagedMigrationSessionsResponse
        {
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize,
            Sessions = sessions.Select(s => new MigrationSessionResponse
            {
                SessionId = s.Id,
                TenantId = s.TenantId,
                SourceType = s.SourceType.ToString(),
                SourceName = s.SourceName,
                Status = s.Status.ToString(),
                Entities = s.Entities.Select(e => e.ToString()).ToList(),
                TotalRecords = s.TotalRecords,
                ValidRecords = s.ValidRecords,
                WarningRecords = s.WarningRecords,
                ErrorRecords = s.ErrorRecords,
                ImportedRecords = s.ImportedRecords,
                SkippedRecords = s.SkippedRecords,
                CreatedAt = s.CreatedAt,
                CompletedAt = s.CompletedAt,
                ExpiresAt = s.ExpiresAt
            }).ToList()
        };

        return Result<PagedMigrationSessionsResponse>.Success(response);
    }
}
