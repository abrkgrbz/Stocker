using MediatR;
using Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Queries.GetAllDocuments;

public class GetAllDocumentsQueryHandler : IRequestHandler<GetAllDocumentsQuery, Result<List<DocumentDto>>>
{
    private readonly IDocumentRepository _documentRepository;

    public GetAllDocumentsQueryHandler(IDocumentRepository documentRepository)
    {
        _documentRepository = documentRepository;
    }

    public async Task<Result<List<DocumentDto>>> Handle(GetAllDocumentsQuery request, CancellationToken cancellationToken)
    {
        var documents = await _documentRepository.GetAllAsync(cancellationToken);

        var dtos = documents.Select(d => new DocumentDto(
            d.Id,
            d.FileName,
            d.OriginalFileName,
            d.ContentType,
            d.FileSize,
            d.StoragePath,
            d.EntityId,
            d.EntityType,
            d.Category,
            d.Description,
            d.Tags,
            d.Version,
            d.UploadedAt,
            d.UploadedBy,
            d.ExpiresAt,
            d.AccessLevel,
            d.IsArchived
        )).ToList();

        return Result<List<DocumentDto>>.Success(dtos);
    }
}
