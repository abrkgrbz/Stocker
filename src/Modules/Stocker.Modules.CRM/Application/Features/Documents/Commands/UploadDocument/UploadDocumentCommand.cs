using MediatR;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Commands.UploadDocument;

public record UploadDocumentCommand(
    string OriginalFileName,
    string ContentType,
    long FileSize,
    byte[] FileData,
    string EntityId,
    string EntityType,
    DocumentCategory Category,
    string? Description = null,
    string? Tags = null,
    AccessLevel AccessLevel = AccessLevel.Private,
    DateTime? ExpiresAt = null
) : IRequest<Result<UploadDocumentResponse>>;

public record UploadDocumentResponse(
    int DocumentId,
    string FileName,
    string StoragePath,
    long FileSize,
    DateTime UploadedAt
);
