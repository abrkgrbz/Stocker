using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;

public class GetDocumentByIdQueryHandler : IRequestHandler<GetDocumentByIdQuery, Result<DocumentDto>>
{
    private readonly IDocumentRepository _documentRepository;

    public GetDocumentByIdQueryHandler(IDocumentRepository documentRepository)
    {
        _documentRepository = documentRepository;
    }

    public async Task<Result<DocumentDto>> Handle(GetDocumentByIdQuery request, CancellationToken cancellationToken)
    {
        var document = await _documentRepository.GetByIdAsync(request.DocumentId, cancellationToken);
        if (document == null)
            return Result<DocumentDto>.Failure(Error.Validation("Document", "Document not found"));

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
            UploadedByName: null, // TODO: Join with user table
            ExpiresAt: document.ExpiresAt,
            AccessLevel: document.AccessLevel,
            IsArchived: document.IsArchived
        );

        return Result<DocumentDto>.Success(dto);
    }
}
