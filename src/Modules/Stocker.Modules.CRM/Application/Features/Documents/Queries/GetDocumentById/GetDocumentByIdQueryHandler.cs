using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;

public class GetDocumentByIdQueryHandler : IRequestHandler<GetDocumentByIdQuery, Result<DocumentDto>>
{
    private readonly IDocumentRepository _documentRepository;
    private readonly CRMDbContext _context;

    public GetDocumentByIdQueryHandler(
        IDocumentRepository documentRepository,
        CRMDbContext context)
    {
        _documentRepository = documentRepository;
        _context = context;
    }

    public async Task<Result<DocumentDto>> Handle(GetDocumentByIdQuery request, CancellationToken cancellationToken)
    {
        var document = await _documentRepository.GetByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
            return Result<DocumentDto>.Failure(Error.Validation("Document", "Document not found"));

        // Fetch user name
        var user = await _context.Set<Stocker.Domain.Tenant.Entities.UserTenant>()
            .Where(u => u.UserId == document.UploadedBy)
            .Select(u => new { u.FirstName, u.LastName })
            .FirstOrDefaultAsync(cancellationToken);

        var uploadedByName = user != null ? $"{user.FirstName} {user.LastName}".Trim() : null;

        var dto = new DocumentDto(
            Id: document.Id,
            FileName: document.FileName,
            OriginalFileName: document.OriginalFileName,
            ContentType: document.ContentType,
            Size: document.FileSize,
            StoragePath: document.StoragePath,
            EntityId: document.EntityId,
            EntityType: document.EntityType,
            Category: document.Category,
            Description: document.Description,
            Tags: document.Tags,
            Version: document.Version,
            UploadedAt: document.UploadedAt,
            UploadedBy: document.UploadedBy,
            UploadedByName: uploadedByName,
            ExpiresAt: document.ExpiresAt,
            AccessLevel: document.AccessLevel,
            IsArchived: document.IsArchived
        );

        return Result<DocumentDto>.Success(dto);
    }
}
