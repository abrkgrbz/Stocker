using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Documents.Commands.DeleteDocument;

public record DeleteDocumentCommand(int DocumentId) : IRequest<Result>;
