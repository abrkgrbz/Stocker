using MediatR;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Commands.UpdateDocument;

public record UpdateDocumentCommand(
    int DocumentId,
    string? Description = null,
    string? Tags = null,
    DocumentCategory? Category = null,
    AccessLevel? AccessLevel = null
) : IRequest<Result>;
