using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Application.Contracts;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Documents.Commands.UploadDocument;

public class UploadDocumentCommandHandler : IRequestHandler<UploadDocumentCommand, Result<UploadDocumentResponse>>
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IDocumentStorageService _storageService;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UploadDocumentCommandHandler> _logger;

    public UploadDocumentCommandHandler(
        IDocumentRepository documentRepository,
        IDocumentStorageService storageService,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<UploadDocumentCommandHandler> logger)
    {
        _documentRepository = documentRepository;
        _storageService = storageService;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<UploadDocumentResponse>> Handle(
        UploadDocumentCommand request,
        CancellationToken cancellationToken)
    {
        try
        {
            var tenantId = _tenantService.GetCurrentTenantId();
            if (!tenantId.HasValue)
                return Result<UploadDocumentResponse>.Failure(Error.Validation("Document", "Tenant context is required"));

            // Get current authenticated user ID
            var userId = _currentUserService.UserId;
            if (!userId.HasValue)
                return Result<UploadDocumentResponse>.Failure(Error.Validation("Document", "User context is required"));

            // Validate file size (e.g., max 50MB)
            const long maxFileSize = 50 * 1024 * 1024;
            if (request.FileSize > maxFileSize)
                return Result<UploadDocumentResponse>.Failure(Error.Validation("Document", $"File size exceeds maximum allowed size of {maxFileSize / (1024 * 1024)}MB"));

            // Upload file to storage with organized folder structure
            var uploadResult = await _storageService.UploadFileAsync(
                request.FileData,
                request.OriginalFileName,
                request.ContentType,
                tenantId.Value,
                request.EntityType,
                request.EntityId,
                cancellationToken);

            if (!uploadResult.IsSuccess)
                return Result<UploadDocumentResponse>.Failure(uploadResult.Error);

            // Create document entity
            var documentResult = Document.Create(
                request.OriginalFileName,
                request.ContentType,
                request.FileSize,
                uploadResult.Value.StoragePath,
                uploadResult.Value.Provider,
                request.EntityId,
                request.EntityType,
                request.Category,
                tenantId.Value,
                userId.Value,
                request.Description,
                request.Tags);

            if (!documentResult.IsSuccess)
            {
                // Rollback storage upload
                await _storageService.DeleteFileAsync(uploadResult.Value.StoragePath, cancellationToken);
                return Result<UploadDocumentResponse>.Failure(documentResult.Error);
            }

            var document = documentResult.Value;

            // Set optional properties
            if (request.AccessLevel != Domain.Enums.AccessLevel.Private)
                document.SetAccessLevel(request.AccessLevel);

            if (request.ExpiresAt.HasValue)
                document.SetExpirationDate(request.ExpiresAt);

            // Save to database
            await _documentRepository.AddAsync(document, cancellationToken);
            await _documentRepository.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Document uploaded successfully. DocumentId: {DocumentId}, FileName: {FileName}, EntityId: {EntityId}, EntityType: {EntityType}",
                document.Id, document.OriginalFileName, request.EntityId, request.EntityType);

            var response = new UploadDocumentResponse(
                document.Id,
                document.FileName,
                document.StoragePath,
                document.FileSize,
                document.UploadedAt);

            return Result<UploadDocumentResponse>.Success(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading document for entity {EntityId} ({EntityType})",
                request.EntityId, request.EntityType);
            return Result<UploadDocumentResponse>.Failure(Error.Failure("Document.Upload", $"Failed to upload document: {ex.Message}"));
        }
    }
}
