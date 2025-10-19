using MediatR;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;

public record GetDocumentByIdQuery(int DocumentId) : IRequest<Result<DocumentDto>>;

public record DocumentDto(
    int Id,
    string FileName,
    string OriginalFileName,
    string ContentType,
    long FileSize,
    string StoragePath,
    int EntityId,
    string EntityType,
    DocumentCategory Category,
    string? Description,
    string? Tags,
    int Version,
    DateTime UploadedAt,
    Guid UploadedBy,
    DateTime? ExpiresAt,
    AccessLevel AccessLevel,
    bool IsArchived
);
