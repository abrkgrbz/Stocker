using System.Text.Json;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Entities;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.DTOs.DataMigration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Commands;

public class UploadMigrationChunkCommand : IRequest<Result<UploadChunkResponse>>
{
    public Guid TenantId { get; set; }
    public Guid SessionId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int ChunkIndex { get; set; }
    public int TotalChunks { get; set; }
    public List<Dictionary<string, object?>> Data { get; set; } = new();
}

public class UploadMigrationChunkCommandHandler : IRequestHandler<UploadMigrationChunkCommand, Result<UploadChunkResponse>>
{
    private readonly IMasterDbContext _context;
    private const int MaxRecordsPerChunk = 1000;

    public UploadMigrationChunkCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UploadChunkResponse>> Handle(UploadMigrationChunkCommand request, CancellationToken cancellationToken)
    {
        // Get session
        var session = await _context.MigrationSessions
            .FirstOrDefaultAsync(s => s.Id == request.SessionId && s.TenantId == request.TenantId, cancellationToken);

        if (session == null)
        {
            return Result<UploadChunkResponse>.Failure(Error.NotFound("SessionNotFound", "Migrasyon oturumu bulunamadı"));
        }

        // Validate session status
        if (session.Status != MigrationSessionStatus.Created && session.Status != MigrationSessionStatus.Uploading)
        {
            return Result<UploadChunkResponse>.Failure(Error.Validation("InvalidStatus", $"Bu durumda veri yüklenemez: {session.Status}"));
        }

        // Parse entity type
        if (!Enum.TryParse<MigrationEntityType>(request.EntityType, true, out var entityType))
        {
            return Result<UploadChunkResponse>.Failure(Error.Validation("InvalidEntityType", $"Geçersiz veri türü: {request.EntityType}"));
        }

        // Validate entity type is in session
        if (!session.Entities.Contains(entityType))
        {
            return Result<UploadChunkResponse>.Failure(Error.Validation("EntityNotInSession", $"Bu veri türü oturumda tanımlı değil: {request.EntityType}"));
        }

        // Validate data
        if (request.Data.Count == 0)
        {
            return Result<UploadChunkResponse>.Failure(Error.Validation("NoData", "Veri boş olamaz"));
        }

        if (request.Data.Count > MaxRecordsPerChunk)
        {
            return Result<UploadChunkResponse>.Failure(Error.Validation("TooManyRecords", $"Chunk başına maksimum {MaxRecordsPerChunk} kayıt yüklenebilir"));
        }

        // Check for duplicate chunk
        var existingChunk = await _context.MigrationChunks
            .AnyAsync(c => c.SessionId == request.SessionId && c.EntityType == entityType && c.ChunkIndex == request.ChunkIndex, cancellationToken);

        if (existingChunk)
        {
            return Result<UploadChunkResponse>.Failure(Error.Validation("DuplicateChunk", $"Bu chunk zaten yüklendi: {request.ChunkIndex}"));
        }

        // Mark session as uploading
        if (session.Status == MigrationSessionStatus.Created)
        {
            session.MarkAsUploading();
        }

        // Serialize data
        var rawDataJson = JsonSerializer.Serialize(request.Data);

        // Create chunk
        var chunk = new MigrationChunk(
            request.SessionId,
            entityType,
            request.ChunkIndex,
            request.TotalChunks,
            rawDataJson,
            request.Data.Count);

        _context.MigrationChunks.Add(chunk);

        // Create validation results for each record
        var globalRowOffset = await _context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId && r.EntityType == entityType)
            .CountAsync(cancellationToken);

        var validationResults = new List<MigrationValidationResult>();
        for (int i = 0; i < request.Data.Count; i++)
        {
            var originalDataJson = JsonSerializer.Serialize(request.Data[i]);
            var result = new MigrationValidationResult(
                request.SessionId,
                chunk.Id,
                entityType,
                i,
                originalDataJson);

            result.SetGlobalRowIndex(globalRowOffset + i);
            validationResults.Add(result);
        }

        _context.MigrationValidationResults.AddRange(validationResults);

        await _context.SaveChangesAsync(cancellationToken);

        // Get upload progress
        var uploadedChunks = await _context.MigrationChunks
            .Where(c => c.SessionId == request.SessionId && c.EntityType == entityType)
            .CountAsync(cancellationToken);

        var totalRecords = await _context.MigrationValidationResults
            .Where(r => r.SessionId == request.SessionId)
            .CountAsync(cancellationToken);

        return Result<UploadChunkResponse>.Success(new UploadChunkResponse
        {
            ChunkId = chunk.Id,
            ChunkIndex = chunk.ChunkIndex,
            RecordsReceived = chunk.RecordCount,
            TotalChunksReceived = uploadedChunks,
            TotalChunksExpected = request.TotalChunks,
            TotalRecordsReceived = totalRecords,
            IsComplete = uploadedChunks >= request.TotalChunks
        });
    }
}
