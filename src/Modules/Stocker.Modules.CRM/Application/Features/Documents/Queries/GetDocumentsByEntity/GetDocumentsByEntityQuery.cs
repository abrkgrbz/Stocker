using MediatR;
using Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentsByEntity;

public record GetDocumentsByEntityQuery(
    string EntityId,
    string EntityType
) : IRequest<Result<List<DocumentDto>>>;
