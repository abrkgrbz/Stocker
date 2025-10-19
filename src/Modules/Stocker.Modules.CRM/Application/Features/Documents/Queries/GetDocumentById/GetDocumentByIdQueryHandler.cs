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
            document.Id,
            document.FileName,
            document.OriginalFileName,
            document.ContentType,
            document.FileSize,
            document.StoragePath,
            document.EntityId,
            document.EntityType,
            document.Category,
            document.Description,
            document.Tags,
            document.Version,
            document.UploadedAt,
            document.UploadedBy,
            document.ExpiresAt,
            document.AccessLevel,
            document.IsArchived
        );

        return Result<DocumentDto>.Success(dto);
    }
}
