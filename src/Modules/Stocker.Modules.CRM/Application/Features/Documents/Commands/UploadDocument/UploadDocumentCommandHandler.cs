using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Application.Contracts;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Enums;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Common;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Modules.CRM.Application.Features.Documents.Commands.UploadDocument;

public class UploadDocumentCommandHandler : IRequestHandler<UploadDocumentCommand, Result<UploadDocumentResponse>>
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IDocumentStorageService _storageService;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly CRMDbContext _context;
    private readonly ILogger<UploadDocumentCommandHandler> _logger;

    public UploadDocumentCommandHandler(
        IDocumentRepository documentRepository,
        IDocumentStorageService storageService,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        CRMDbContext context,
        ILogger<UploadDocumentCommandHandler> logger)
    {
        _documentRepository = documentRepository;
        _storageService = storageService;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _context = context;
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

            // Create Activity for document upload
            var activity = new Activity(
                tenantId: tenantId.Value,
                subject: $"Doküman yüklendi: {document.OriginalFileName}",
                type: ActivityType.Document,
                ownerId: 1); // TODO: Map UserId from Guid to int properly

            activity.UpdateDetails(
                subject: $"Doküman yüklendi: {document.OriginalFileName}",
                description: $"{document.Category} kategorisinde doküman yüklendi. Dosya boyutu: {document.FileSize / 1024:F2} KB",
                priority: ActivityPriority.Normal);

            // Link activity to the entity based on EntityType
            if (Guid.TryParse(request.EntityId, out var entityGuid))
            {
                switch (request.EntityType.ToLower())
                {
                    case "deal":
                        activity.RelateToDeal(entityGuid);
                        break;
                    case "customer":
                        activity.RelateToCustomer(entityGuid);
                        break;
                    case "contact":
                        activity.RelateToContact(entityGuid);
                        break;
                    case "lead":
                        activity.RelateToDeal(entityGuid);
                        break;
                    case "opportunity":
                        activity.RelateToOpportunity(entityGuid);
                        break;
                }
            }

            // Mark activity as completed since upload is done
            activity.Complete($"Doküman başarıyla yüklendi: {document.StoragePath}");

            // Save activity
            _context.Activities.Add(activity);
            await _context.SaveChangesAsync(cancellationToken);

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
