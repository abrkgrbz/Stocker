using MediatR;
using Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentsByEntity;

public class GetDocumentsByEntityQueryHandler : IRequestHandler<GetDocumentsByEntityQuery, Result<List<DocumentDto>>>
{
    private readonly IDocumentRepository _documentRepository;

    public GetDocumentsByEntityQueryHandler(IDocumentRepository documentRepository)
    {
        _documentRepository = documentRepository;
    }

    public async Task<Result<List<DocumentDto>>> Handle(GetDocumentsByEntityQuery request, CancellationToken cancellationToken)
    {
        var documents = await _documentRepository.GetByEntityAsync(
            request.EntityId,
            request.EntityType,
            cancellationToken);

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
