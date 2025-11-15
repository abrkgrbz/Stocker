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
    long Size,
    string StoragePath,
    string EntityId,
    string EntityType,
    DocumentCategory Category,
    string? Description,
    string? Tags,
    int Version,
    DateTime UploadedAt,
    Guid UploadedBy,
    string? UploadedByName,
    DateTime? ExpiresAt,
    AccessLevel AccessLevel,
    bool IsArchived
);
