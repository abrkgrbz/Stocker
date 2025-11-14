using MediatR;
using Stocker.Modules.CRM.Application.Features.Documents.Queries.GetDocumentById;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Queries.GetAllDocuments;

public record GetAllDocumentsQuery() : IRequest<Result<List<DocumentDto>>>;
