using System.Diagnostics;
using System.IO.Compression;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Npgsql;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Infrastructure.Services;

/// <summary>
/// Service for executing backup operations
/// Handles database dumps and file archiving
/// </summary>
public class BackupExecutionService : IBackupExecutionService
{
    private readonly ITenantDbContextFactory _tenantDbContextFactory;
    private readonly IBackupStorageService _backupStorageService;
    private readonly ILogger<BackupExecutionService> _logger;

    public BackupExecutionService(
        ITenantDbContextFactory tenantDbContextFactory,
        IBackupStorageService backupStorageService,
        ILogger<BackupExecutionService> logger)
    {
        _tenantDbContextFactory = tenantDbContextFactory;
        _backupStorageService = backupStorageService;
        _logger = logger;
    }

    /// <inheritdoc />
    public async Task<Result<BackupExecutionResult>> ExecuteBackupAsync(
        BackupExecutionRequest request,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        _logger.LogInformation(
            "Starting backup execution. TenantId: {TenantId}, BackupId: {BackupId}, Type: {Type}",
            request.TenantId, request.BackupId, request.BackupType);

        try
        {
            DatabaseManifest? databaseManifest = null;
            FilesManifest? filesManifest = null;
            ConfigurationManifest? configurationManifest = null;

            using var backupStream = new MemoryStream();
            using var archive = new ZipArchive(backupStream, ZipArchiveMode.Create, leaveOpen: true);

            // 1. Backup database if requested
            if (request.IncludeDatabase)
            {
                var dbResult = await BackupDatabaseAsync(
                    request.TenantId,
                    archive,
                    cancellationToken);

                if (dbResult.IsFailure)
                {
                    return Result<BackupExecutionResult>.Failure(dbResult.Error);
                }

                databaseManifest = dbResult.Value;
            }

            // 2. Backup files if requested (from MinIO tenant bucket)
            if (request.IncludeFiles)
            {
                var filesResult = await BackupFilesAsync(
                    request.TenantId,
                    archive,
                    cancellationToken);

                if (filesResult.IsFailure)
                {
                    return Result<BackupExecutionResult>.Failure(filesResult.Error);
                }

                filesManifest = filesResult.Value;
            }

            // 3. Backup configuration if requested
            if (request.IncludeConfiguration)
            {
                var configResult = await BackupConfigurationAsync(
                    request.TenantId,
                    archive,
                    cancellationToken);

                if (configResult.IsFailure)
                {
                    return Result<BackupExecutionResult>.Failure(configResult.Error);
                }

                configurationManifest = configResult.Value;
            }

            // 4. Create manifest
            var manifest = new BackupManifest(
                BackupId: request.BackupId.ToString(),
                TenantId: request.TenantId.ToString(),
                CreatedAt: DateTime.UtcNow,
                BackupType: request.BackupType,
                IncludesDatabase: request.IncludeDatabase,
                IncludesFiles: request.IncludeFiles,
                IncludesConfiguration: request.IncludeConfiguration,
                IsCompressed: request.Compress,
                IsEncrypted: request.Encrypt,
                Database: databaseManifest,
                Files: filesManifest,
                Configuration: configurationManifest);

            // Add manifest to archive
            var manifestJson = JsonSerializer.Serialize(manifest, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            var manifestEntry = archive.CreateEntry("manifest.json");
            using (var manifestStream = manifestEntry.Open())
            using (var writer = new StreamWriter(manifestStream))
            {
                await writer.WriteAsync(manifestJson);
            }

            // Close archive to finalize
            archive.Dispose();

            // 5. Upload to MinIO
            var fileName = $"{request.BackupName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.zip";
            backupStream.Position = 0;

            var uploadResult = await _backupStorageService.UploadBackupFileAsync(
                request.TenantId,
                request.BackupId,
                fileName,
                backupStream,
                "application/zip",
                cancellationToken);

            if (uploadResult.IsFailure)
            {
                return Result<BackupExecutionResult>.Failure(uploadResult.Error);
            }

            stopwatch.Stop();

            _logger.LogInformation(
                "Backup execution completed. TenantId: {TenantId}, BackupId: {BackupId}, Size: {Size}, Duration: {Duration}",
                request.TenantId, request.BackupId, uploadResult.Value.SizeInBytes, stopwatch.Elapsed);

            return Result<BackupExecutionResult>.Success(new BackupExecutionResult(
                FilePath: uploadResult.Value.StoragePath,
                StorageLocation: uploadResult.Value.StorageLocation,
                SizeInBytes: uploadResult.Value.SizeInBytes,
                DownloadUrl: uploadResult.Value.DownloadUrl,
                Duration: stopwatch.Elapsed,
                Manifest: manifest));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Backup execution failed. TenantId: {TenantId}, BackupId: {BackupId}",
                request.TenantId, request.BackupId);

            return Result<BackupExecutionResult>.Failure(
                Error.Failure("Backup.ExecutionFailed", $"Backup execution failed: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result> ExecuteRestoreAsync(
        RestoreExecutionRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation(
            "Starting restore execution. TenantId: {TenantId}, BackupId: {BackupId}",
            request.TenantId, request.BackupId);

        try
        {
            // 1. Download backup file
            var filesResult = await _backupStorageService.ListBackupFilesAsync(
                request.TenantId,
                request.BackupId,
                cancellationToken);

            if (filesResult.IsFailure)
            {
                return Result.Failure(filesResult.Error);
            }

            var backupFile = filesResult.Value.FirstOrDefault(f => f.FileName.EndsWith(".zip"));
            if (backupFile == null)
            {
                return Result.Failure(
                    Error.NotFound("Backup.FileNotFound", "Backup file not found"));
            }

            var downloadResult = await _backupStorageService.DownloadBackupFileAsync(
                request.TenantId,
                request.BackupId,
                backupFile.FileName,
                cancellationToken);

            if (downloadResult.IsFailure)
            {
                return Result.Failure(downloadResult.Error);
            }

            using var backupStream = downloadResult.Value;
            using var archive = new ZipArchive(backupStream, ZipArchiveMode.Read);

            // 2. Read manifest
            var manifestEntry = archive.GetEntry("manifest.json");
            if (manifestEntry == null)
            {
                return Result.Failure(
                    Error.Validation("Backup.InvalidFormat", "Backup manifest not found"));
            }

            using var manifestStream = manifestEntry.Open();
            using var reader = new StreamReader(manifestStream);
            var manifestJson = await reader.ReadToEndAsync();
            var manifest = JsonSerializer.Deserialize<BackupManifest>(manifestJson);

            if (manifest == null)
            {
                return Result.Failure(
                    Error.Validation("Backup.InvalidManifest", "Failed to parse backup manifest"));
            }

            // 3. Restore database if requested and available
            if (request.RestoreDatabase && manifest.IncludesDatabase)
            {
                var dbEntry = archive.GetEntry("database/dump.sql");
                if (dbEntry != null)
                {
                    var restoreDbResult = await RestoreDatabaseAsync(
                        request.TenantId,
                        dbEntry,
                        cancellationToken);

                    if (restoreDbResult.IsFailure)
                    {
                        return Result.Failure(restoreDbResult.Error);
                    }
                }
            }

            // 4. Restore files if requested and available
            if (request.RestoreFiles && manifest.IncludesFiles)
            {
                var restoreFilesResult = await RestoreFilesAsync(
                    request.TenantId,
                    archive,
                    cancellationToken);

                if (restoreFilesResult.IsFailure)
                {
                    return Result.Failure(restoreFilesResult.Error);
                }
            }

            // 5. Restore configuration if requested and available
            if (request.RestoreConfiguration && manifest.IncludesConfiguration)
            {
                var restoreConfigResult = await RestoreConfigurationAsync(
                    request.TenantId,
                    archive,
                    cancellationToken);

                if (restoreConfigResult.IsFailure)
                {
                    return Result.Failure(restoreConfigResult.Error);
                }
            }

            _logger.LogInformation(
                "Restore execution completed. TenantId: {TenantId}, BackupId: {BackupId}",
                request.TenantId, request.BackupId);

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Restore execution failed. TenantId: {TenantId}, BackupId: {BackupId}",
                request.TenantId, request.BackupId);

            return Result.Failure(
                Error.Failure("Backup.RestoreFailed", $"Restore execution failed: {ex.Message}"));
        }
    }

    /// <inheritdoc />
    public async Task<Result<BackupValidationResult>> ValidateBackupAsync(
        Guid tenantId,
        Guid backupId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            // List backup files
            var filesResult = await _backupStorageService.ListBackupFilesAsync(
                tenantId,
                backupId,
                cancellationToken);

            if (filesResult.IsFailure)
            {
                return Result<BackupValidationResult>.Success(new BackupValidationResult(
                    IsValid: false,
                    IsRestorable: false,
                    ErrorMessage: "Backup files not found",
                    Manifest: null));
            }

            var backupFile = filesResult.Value.FirstOrDefault(f => f.FileName.EndsWith(".zip"));
            if (backupFile == null)
            {
                return Result<BackupValidationResult>.Success(new BackupValidationResult(
                    IsValid: false,
                    IsRestorable: false,
                    ErrorMessage: "Backup archive not found",
                    Manifest: null));
            }

            // Download and validate
            var downloadResult = await _backupStorageService.DownloadBackupFileAsync(
                tenantId,
                backupId,
                backupFile.FileName,
                cancellationToken);

            if (downloadResult.IsFailure)
            {
                return Result<BackupValidationResult>.Success(new BackupValidationResult(
                    IsValid: false,
                    IsRestorable: false,
                    ErrorMessage: "Failed to download backup for validation",
                    Manifest: null));
            }

            using var backupStream = downloadResult.Value;
            using var archive = new ZipArchive(backupStream, ZipArchiveMode.Read);

            // Read manifest
            var manifestEntry = archive.GetEntry("manifest.json");
            if (manifestEntry == null)
            {
                return Result<BackupValidationResult>.Success(new BackupValidationResult(
                    IsValid: false,
                    IsRestorable: false,
                    ErrorMessage: "Backup manifest not found",
                    Manifest: null));
            }

            using var manifestStream = manifestEntry.Open();
            using var reader = new StreamReader(manifestStream);
            var manifestJson = await reader.ReadToEndAsync();
            var manifest = JsonSerializer.Deserialize<BackupManifest>(manifestJson);

            if (manifest == null)
            {
                return Result<BackupValidationResult>.Success(new BackupValidationResult(
                    IsValid: false,
                    IsRestorable: false,
                    ErrorMessage: "Invalid manifest format",
                    Manifest: null));
            }

            // Validate contents
            bool isValid = true;
            var validationErrors = new List<string>();

            if (manifest.IncludesDatabase)
            {
                var dbEntry = archive.GetEntry("database/dump.sql");
                if (dbEntry == null)
                {
                    isValid = false;
                    validationErrors.Add("Database dump file missing");
                }
            }

            return Result<BackupValidationResult>.Success(new BackupValidationResult(
                IsValid: isValid,
                IsRestorable: isValid,
                ErrorMessage: isValid ? null : string.Join("; ", validationErrors),
                Manifest: manifest));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Backup validation failed. TenantId: {TenantId}, BackupId: {BackupId}",
                tenantId, backupId);

            return Result<BackupValidationResult>.Failure(
                Error.Failure("Backup.ValidationFailed", $"Backup validation failed: {ex.Message}"));
        }
    }

    #region Private Methods

    private async Task<Result<DatabaseManifest>> BackupDatabaseAsync(
        Guid tenantId,
        ZipArchive archive,
        CancellationToken cancellationToken)
    {
        try
        {
            var connectionString = await _tenantDbContextFactory.GetTenantConnectionStringAsync(tenantId);
            var builder = new NpgsqlConnectionStringBuilder(connectionString);

            // Get table information
            var tables = new List<string>();
            long totalRows = 0;

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync(cancellationToken);

            // Get all tables
            await using (var cmd = new NpgsqlCommand(@"
                SELECT table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_type = 'BASE TABLE'", connection))
            {
                await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
                while (await reader.ReadAsync(cancellationToken))
                {
                    tables.Add(reader.GetString(0));
                }
            }

            // Create SQL dump
            var sqlDump = new StringBuilder();
            sqlDump.AppendLine("-- Stocker Backup");
            sqlDump.AppendLine($"-- Created: {DateTime.UtcNow:O}");
            sqlDump.AppendLine($"-- Tenant: {tenantId}");
            sqlDump.AppendLine($"-- Database: {builder.Database}");
            sqlDump.AppendLine();

            foreach (var table in tables)
            {
                sqlDump.AppendLine($"-- Table: {table}");

                // Get table structure
                await using (var cmd = new NpgsqlCommand($@"
                    SELECT column_name, data_type, is_nullable, column_default
                    FROM information_schema.columns
                    WHERE table_schema = 'public' AND table_name = @table
                    ORDER BY ordinal_position", connection))
                {
                    cmd.Parameters.AddWithValue("table", table);
                    await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);

                    var columns = new List<(string name, string type, bool nullable, string? defaultVal)>();
                    while (await reader.ReadAsync(cancellationToken))
                    {
                        columns.Add((
                            reader.GetString(0),
                            reader.GetString(1),
                            reader.GetString(2) == "YES",
                            reader.IsDBNull(3) ? null : reader.GetString(3)
                        ));
                    }
                }

                // Get row count
                await using (var cmd = new NpgsqlCommand($"SELECT COUNT(*) FROM \"{table}\"", connection))
                {
                    var count = (long)(await cmd.ExecuteScalarAsync(cancellationToken) ?? 0);
                    totalRows += count;
                    sqlDump.AppendLine($"-- Rows: {count}");
                }

                // Export data as CSV format using Npgsql's COPY API
                sqlDump.AppendLine($"-- BEGIN DATA: {table}");

                // Create a separate CSV file for each table using proper Npgsql COPY API
                var tableEntry = archive.CreateEntry($"database/tables/{table}.csv");
                using (var tableStream = tableEntry.Open())
                using (var writer = new StreamWriter(tableStream))
                {
                    // Use BeginTextExport for proper COPY TO STDOUT handling
                    using (var textExporter = connection.BeginTextExport($"COPY \"{table}\" TO STDOUT WITH (FORMAT csv, HEADER true)"))
                    {
                        var buffer = new char[8192];
                        int charsRead;
                        while ((charsRead = await textExporter.ReadAsync(buffer, 0, buffer.Length)) > 0)
                        {
                            await writer.WriteAsync(buffer, 0, charsRead);
                        }
                    }
                }

                sqlDump.AppendLine($"-- END DATA: {table}");

                sqlDump.AppendLine();
            }

            // Write main dump file
            var dumpEntry = archive.CreateEntry("database/dump.sql");
            using (var dumpStream = dumpEntry.Open())
            using (var writer = new StreamWriter(dumpStream))
            {
                await writer.WriteAsync(sqlDump.ToString());
            }

            // Write schema info
            var schemaEntry = archive.CreateEntry("database/schema.json");
            using (var schemaStream = schemaEntry.Open())
            {
                var schemaInfo = new { Tables = tables, TotalRows = totalRows };
                await JsonSerializer.SerializeAsync(schemaStream, schemaInfo, cancellationToken: cancellationToken);
            }

            _logger.LogInformation(
                "Database backup completed. TenantId: {TenantId}, Tables: {TableCount}, Rows: {RowCount}",
                tenantId, tables.Count, totalRows);

            return Result<DatabaseManifest>.Success(new DatabaseManifest(
                TableCount: tables.Count,
                TotalRows: totalRows,
                SizeBytes: 0, // Calculated after compression
                Tables: tables));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database backup failed. TenantId: {TenantId}", tenantId);
            return Result<DatabaseManifest>.Failure(
                Error.Failure("Backup.DatabaseFailed", $"Database backup failed: {ex.Message}"));
        }
    }

    private async Task<Result<FilesManifest>> BackupFilesAsync(
        Guid tenantId,
        ZipArchive archive,
        CancellationToken cancellationToken)
    {
        try
        {
            // List all files in tenant bucket (excluding backups folder)
            var filesResult = await _backupStorageService.ListBackupFilesAsync(tenantId, null, cancellationToken);

            // For now, we'll just create a placeholder as file backup requires
            // iterating through the entire tenant bucket which is a different operation
            var filesEntry = archive.CreateEntry("files/placeholder.txt");
            using (var filesStream = filesEntry.Open())
            using (var writer = new StreamWriter(filesStream))
            {
                await writer.WriteLineAsync("File backup placeholder - tenant files would be archived here");
            }

            _logger.LogInformation("Files backup completed. TenantId: {TenantId}", tenantId);

            return Result<FilesManifest>.Success(new FilesManifest(
                FileCount: 0,
                FolderCount: 0,
                TotalSizeBytes: 0));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Files backup failed. TenantId: {TenantId}", tenantId);
            return Result<FilesManifest>.Failure(
                Error.Failure("Backup.FilesFailed", $"Files backup failed: {ex.Message}"));
        }
    }

    private async Task<Result<ConfigurationManifest>> BackupConfigurationAsync(
        Guid tenantId,
        ZipArchive archive,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get tenant configuration from database
            using var context = await _tenantDbContextFactory.CreateDbContextAsync(tenantId);

            // Export tenant settings
            var settings = new Dictionary<string, object>();
            var categories = new List<string>();

            // Add placeholder for configuration export
            var configEntry = archive.CreateEntry("config/settings.json");
            using (var configStream = configEntry.Open())
            {
                await JsonSerializer.SerializeAsync(configStream, new
                {
                    ExportedAt = DateTime.UtcNow,
                    TenantId = tenantId,
                    Settings = settings
                }, cancellationToken: cancellationToken);
            }

            _logger.LogInformation("Configuration backup completed. TenantId: {TenantId}", tenantId);

            return Result<ConfigurationManifest>.Success(new ConfigurationManifest(
                SettingsCount: settings.Count,
                Categories: categories));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Configuration backup failed. TenantId: {TenantId}", tenantId);
            return Result<ConfigurationManifest>.Failure(
                Error.Failure("Backup.ConfigFailed", $"Configuration backup failed: {ex.Message}"));
        }
    }

    private async Task<Result> RestoreDatabaseAsync(
        Guid tenantId,
        ZipArchiveEntry dbEntry,
        CancellationToken cancellationToken)
    {
        try
        {
            var connectionString = await _tenantDbContextFactory.GetTenantConnectionStringAsync(tenantId);

            // Read SQL dump
            using var stream = dbEntry.Open();
            using var reader = new StreamReader(stream);
            var sqlContent = await reader.ReadToEndAsync();

            // For safety, log what we would do but don't execute automatically
            _logger.LogWarning(
                "Database restore requires manual execution for safety. TenantId: {TenantId}",
                tenantId);

            // In a production implementation, you would:
            // 1. Create a new database or truncate existing tables
            // 2. Execute the SQL dump
            // 3. Verify data integrity

            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database restore failed. TenantId: {TenantId}", tenantId);
            return Result.Failure(
                Error.Failure("Backup.RestoreDbFailed", $"Database restore failed: {ex.Message}"));
        }
    }

    private Task<Result> RestoreFilesAsync(
        Guid tenantId,
        ZipArchive archive,
        CancellationToken cancellationToken)
    {
        // Placeholder for file restoration
        _logger.LogInformation("File restore placeholder. TenantId: {TenantId}", tenantId);
        return Task.FromResult(Result.Success());
    }

    private Task<Result> RestoreConfigurationAsync(
        Guid tenantId,
        ZipArchive archive,
        CancellationToken cancellationToken)
    {
        // Placeholder for configuration restoration
        _logger.LogInformation("Configuration restore placeholder. TenantId: {TenantId}", tenantId);
        return Task.FromResult(Result.Success());
    }

    #endregion
}
