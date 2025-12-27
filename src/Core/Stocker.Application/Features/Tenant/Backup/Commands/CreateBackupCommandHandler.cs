using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Backup;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.Backup.Commands;

/// <summary>
/// Handler for creating a new backup
/// </summary>
public class CreateBackupCommandHandler : IRequestHandler<CreateBackupCommand, Result<BackupDto>>
{
    private readonly IMasterDbContext _masterDbContext;
    private readonly ILogger<CreateBackupCommandHandler> _logger;

    public CreateBackupCommandHandler(
        IMasterDbContext masterDbContext,
        ILogger<CreateBackupCommandHandler> logger)
    {
        _masterDbContext = masterDbContext;
        _logger = logger;
    }

    public async Task<Result<BackupDto>> Handle(CreateBackupCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Create backup entity
            var backup = TenantBackup.Create(
                request.TenantId,
                request.BackupName,
                request.BackupType,
                request.CreatedBy,
                request.IncludeDatabase,
                request.IncludeFiles,
                request.IncludeConfiguration,
                request.Compress,
                request.Encrypt,
                request.Description);

            // Add to database
            _masterDbContext.TenantBackups.Add(backup);
            await _masterDbContext.SaveChangesAsync(cancellationToken);

            _logger.LogInformation(
                "Backup created: {BackupId} for tenant {TenantId} by {CreatedBy}",
                backup.Id, request.TenantId, request.CreatedBy);

            // Return DTO
            var dto = new BackupDto
            {
                Id = backup.Id,
                BackupName = backup.BackupName,
                BackupType = backup.BackupType,
                Status = backup.Status,
                CreatedAt = backup.CreatedAt,
                CompletedAt = backup.CompletedAt,
                CreatedBy = backup.CreatedBy,
                SizeInBytes = backup.SizeInBytes,
                StorageLocation = backup.StorageLocation,
                IncludesDatabase = backup.IncludesDatabase,
                IncludesFiles = backup.IncludesFiles,
                IncludesConfiguration = backup.IncludesConfiguration,
                IsCompressed = backup.IsCompressed,
                IsEncrypted = backup.IsEncrypted,
                IsRestorable = backup.IsRestorable,
                ExpiresAt = backup.ExpiresAt,
                Description = backup.Description
            };

            return Result<BackupDto>.Success(dto);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid backup request for tenant {TenantId}", request.TenantId);
            return Result<BackupDto>.Failure(
                new Error("Backup.InvalidRequest", ex.Message, ErrorType.Validation));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create backup for tenant {TenantId}", request.TenantId);
            return Result<BackupDto>.Failure(
                new Error("Backup.CreateFailed", "Yedekleme oluşturulamadı", ErrorType.Failure));
        }
    }
}
