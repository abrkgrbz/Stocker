using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Application.Contracts;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;

namespace Stocker.Modules.CRM.Application.Features.Documents.Commands.DeleteDocument;

public class DeleteDocumentCommandHandler : IRequestHandler<DeleteDocumentCommand, Result>
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IDocumentStorageService _storageService;
    private readonly ILogger<DeleteDocumentCommandHandler> _logger;

    public DeleteDocumentCommandHandler(
        IDocumentRepository documentRepository,
        IDocumentStorageService storageService,
        ILogger<DeleteDocumentCommandHandler> logger)
    {
        _documentRepository = documentRepository;
        _storageService = storageService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteDocumentCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var document = await _documentRepository.GetByIdAsync(request.DocumentId, cancellationToken);
            if (document == null)
                return Result.Failure(Error.Validation("Document", "Document not found"));

            // Delete from storage
            var deleteResult = await _storageService.DeleteFileAsync(document.StoragePath, cancellationToken);
            if (!deleteResult.IsSuccess)
            {
                _logger.LogWarning("Failed to delete file from storage: {Error}", deleteResult.Error);
                // Continue with database deletion even if storage deletion fails
            }

            // Delete from database
            await _documentRepository.DeleteAsync(document, cancellationToken);
            await _documentRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Document deleted successfully. DocumentId: {DocumentId}", request.DocumentId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting document {DocumentId}", request.DocumentId);
            return Result.Failure(Error.Failure("Document.Delete", $"Failed to delete document: {ex.Message}"));
        }
    }
}
