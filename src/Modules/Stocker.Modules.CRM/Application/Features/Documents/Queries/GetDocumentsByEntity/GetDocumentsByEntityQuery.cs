using MediatR;
using Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentsByEntity;

public record GetDocumentsByEntityQuery(
    int EntityId,
    string EntityType
) : IRequest<Result<List<DocumentDto>>>;
