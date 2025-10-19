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
