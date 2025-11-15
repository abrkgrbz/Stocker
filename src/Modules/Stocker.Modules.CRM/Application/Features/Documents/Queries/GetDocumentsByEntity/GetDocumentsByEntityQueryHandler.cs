using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentsByEntity;

public class GetDocumentsByEntityQueryHandler : IRequestHandler<GetDocumentsByEntityQuery, Result<List<DocumentDto>>>
{
    private readonly IDocumentRepository _documentRepository;
    private readonly ITenantDbContext _tenantContext;

    public GetDocumentsByEntityQueryHandler(
        IDocumentRepository documentRepository,
        ITenantDbContext tenantContext)
    {
        _documentRepository = documentRepository;
        _tenantContext = tenantContext;
    }

    public async Task<Result<List<DocumentDto>>> Handle(GetDocumentsByEntityQuery request, CancellationToken cancellationToken)
    {
        var documents = await _documentRepository.GetByEntityAsync(
            request.EntityId,
            request.EntityType,
            cancellationToken);

        // Get user IDs
        var userIds = documents.Select(d => d.UploadedBy).Distinct().ToList();

        // Join with UserTenants to get user names
        var users = await _tenantContext.UserTenants
            .Where(u => userIds.Contains(u.UserId))
            .Select(u => new { u.UserId, u.FirstName, u.LastName })
            .ToListAsync(cancellationToken);

        var userDict = users.ToDictionary(
            u => u.UserId,
            u => $"{u.FirstName} {u.LastName}".Trim());

        var dtos = documents.Select(d => new DocumentDto(
            Id: d.Id,
            FileName: d.FileName,
            OriginalFileName: d.OriginalFileName,
            ContentType: d.ContentType,
            Size: d.FileSize,
            StoragePath: d.StoragePath,
            EntityId: d.EntityId,
            EntityType: d.EntityType,
            Category: d.Category,
            Description: d.Description,
            Tags: d.Tags,
            Version: d.Version,
            UploadedAt: d.UploadedAt,
            UploadedBy: d.UploadedBy,
            UploadedByName: userDict.TryGetValue(d.UploadedBy, out var name) ? name : null,
            ExpiresAt: d.ExpiresAt,
            AccessLevel: d.AccessLevel,
            IsArchived: d.IsArchived
        )).ToList();

        return Result<List<DocumentDto>>.Success(dtos);
    }
}
