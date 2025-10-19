using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Application.Features.Documents.Commands.UpdateDocument;

public class UpdateDocumentCommandHandler : IRequestHandler<UpdateDocumentCommand, Result>
{
    private readonly IDocumentRepository _documentRepository;
    private readonly ILogger<UpdateDocumentCommandHandler> _logger;

    public UpdateDocumentCommandHandler(
        IDocumentRepository documentRepository,
        ILogger<UpdateDocumentCommandHandler> logger)
    {
        _documentRepository = documentRepository;
        _logger = logger;
    }

    public async Task<Result> Handle(UpdateDocumentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var document = await _documentRepository.GetByIdAsync(request.DocumentId, cancellationToken);
            if (document == null)
                return Result.Failure(Error.Validation("Document", "Document not found"));

            if (request.Description != null)
            {
                var result = document.UpdateDescription(request.Description);
                if (!result.IsSuccess) return result;
            }

            if (request.Tags != null)
            {
                var result = document.UpdateTags(request.Tags);
                if (!result.IsSuccess) return result;
            }

            if (request.Category.HasValue)
            {
                var result = document.SetCategory(request.Category.Value);
                if (!result.IsSuccess) return result;
            }

            if (request.AccessLevel.HasValue)
            {
                var result = document.SetAccessLevel(request.AccessLevel.Value);
                if (!result.IsSuccess) return result;
            }

            await _documentRepository.UpdateAsync(document, cancellationToken);
            await _documentRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Document updated successfully. DocumentId: {DocumentId}", request.DocumentId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating document {DocumentId}", request.DocumentId);
            return Result.Failure(Error.Failure("Document.Update", $"Failed to update document: {ex.Message}"));
        }
    }
}
