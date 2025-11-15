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
            UploadedByName: null, // TODO: Join with user table
            ExpiresAt: d.ExpiresAt,
            AccessLevel: d.AccessLevel,
            IsArchived: d.IsArchived
        )).ToList();

        return Result<List<DocumentDto>>.Success(dtos);
    }
}
