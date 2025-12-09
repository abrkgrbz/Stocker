using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Renci.SshNet;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.SystemManagement.Commands.CleanDocker;
using Stocker.Application.Features.SystemManagement.Queries.GetDockerStats;
using System.Text.RegularExpressions;

namespace Stocker.Infrastructure.Services;

public class DockerManagementService : IDockerManagementService, IDisposable
{
    private readonly string _sshHost;
    private readonly string _sshUser;
    private readonly string _sshKeyPath;
    private readonly ILogger<DockerManagementService> _logger;
    private readonly SemaphoreSlim _connectionLock = new(1, 1);
    private readonly int _maxRetries = 3;
    private readonly TimeSpan _retryDelay = TimeSpan.FromSeconds(2);
    private SshClient? _cachedClient;
    private DateTime _lastConnectionTime = DateTime.MinValue;
    private readonly TimeSpan _connectionTimeout = TimeSpan.FromMinutes(5);

    public DockerManagementService(
        IConfiguration configuration,
        ILogger<DockerManagementService> logger)
    {
        _logger = logger;
        _sshHost = configuration["DockerManagement:SshHost"] ?? "95.217.219.4";
        _sshUser = configuration["DockerManagement:SshUser"] ?? "root";
        _sshKeyPath = configuration["DockerManagement:SshKeyPath"] ?? "/app/keys/ssh_key";

        // Priority 1: Check Azure Key Vault (via configuration)
        // The SSH key should be stored in Azure Key Vault with the name "docker-management-ssh-key"
        // The KeyVault secret name "docker-management-ssh-key" is mapped to "DockerManagement:SshKey" by the configuration system
        var sshKeyFromVault = configuration["DockerManagement:SshKey"];

        if (!string.IsNullOrEmpty(sshKeyFromVault))
        {
            try
            {
                // The key from Azure Key Vault is already in plain text (not base64)
                Directory.CreateDirectory(Path.GetDirectoryName(_sshKeyPath)!);
                File.WriteAllText(_sshKeyPath, sshKeyFromVault);

                // Set proper permissions (600) on Linux
                if (!OperatingSystem.IsWindows())
                {
                    File.SetUnixFileMode(_sshKeyPath, UnixFileMode.UserRead | UnixFileMode.UserWrite);
                }

                _logger.LogInformation("SSH key loaded from Azure Key Vault and saved to {Path}", _sshKeyPath);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process SSH key from Azure Key Vault");
            }
        }
        // Priority 2: Fallback to environment variable (base64 encoded) - for local development
        else
        {
            var sshKeyBase64 = configuration["DockerManagement:SshKeyBase64"];
            if (!string.IsNullOrEmpty(sshKeyBase64))
            {
                try
                {
                    var keyBytes = Convert.FromBase64String(sshKeyBase64);
                    var keyContent = System.Text.Encoding.UTF8.GetString(keyBytes);

                    Directory.CreateDirectory(Path.GetDirectoryName(_sshKeyPath)!);
                    File.WriteAllText(_sshKeyPath, keyContent);

                    // Set proper permissions (600) on Linux
                    if (!OperatingSystem.IsWindows())
                    {
                        File.SetUnixFileMode(_sshKeyPath, UnixFileMode.UserRead | UnixFileMode.UserWrite);
                    }

                    _logger.LogInformation("SSH key decoded from environment variable and saved to {Path}", _sshKeyPath);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to decode SSH key from environment variable");
                }
            }
            else
            {
                _logger.LogWarning("No SSH key found in Azure Key Vault or environment variables. Docker management may not work.");
            }
        }
    }

    public async Task<DockerStatsDto> GetDockerStatsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var output = await ExecuteWithRetryAsync("docker system df", cancellationToken);

            if (string.IsNullOrEmpty(output))
            {
                return GetEmptyStats();
            }

            var stats = ParseDockerStats(output);
            _logger.LogInformation("Parsed stats - Containers: {Containers}, Images: {Images}, Volumes: {Volumes}",
                stats.Containers.Total, stats.Images.Total, stats.Volumes.Total);

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Docker stats from SSH host {Host}. Error: {Message}",
                _sshHost, ex.Message);

            return GetEmptyStats();
        }
    }

    private static DockerStatsDto GetEmptyStats() => new()
    {
        Containers = new ContainerStats { Running = 0, Stopped = 0, Total = 0 },
        Images = new ImageStats { Total = 0, Size = "0B" },
        Volumes = new VolumeStats { Total = 0, Size = "0B" },
        Networks = 0,
        CacheInfo = new List<DockerCacheInfo>()
    };

    /// <summary>
    /// Gets or creates a cached SSH connection with retry logic
    /// </summary>
    private async Task<SshClient> GetOrCreateConnectionAsync(CancellationToken cancellationToken)
    {
        await _connectionLock.WaitAsync(cancellationToken);
        try
        {
            // Check if cached client is still valid
            if (_cachedClient != null &&
                _cachedClient.IsConnected &&
                DateTime.UtcNow - _lastConnectionTime < _connectionTimeout)
            {
                return _cachedClient;
            }

            // Dispose old connection if exists
            if (_cachedClient != null)
            {
                try
                {
                    if (_cachedClient.IsConnected)
                    {
                        _cachedClient.Disconnect();
                    }
                    _cachedClient.Dispose();
                }
                catch { /* Ignore disposal errors */ }
                _cachedClient = null;
            }

            // Create new connection with retry
            for (int attempt = 1; attempt <= _maxRetries; attempt++)
            {
                try
                {
                    _logger.LogInformation("SSH connection attempt {Attempt}/{MaxRetries} to {Host}",
                        attempt, _maxRetries, _sshHost);

                    var client = new SshClient(_sshHost, _sshUser, new PrivateKeyFile(_sshKeyPath));
                    client.ConnectionInfo.Timeout = TimeSpan.FromSeconds(30);
                    client.Connect();

                    _cachedClient = client;
                    _lastConnectionTime = DateTime.UtcNow;
                    _logger.LogInformation("SSH connection established successfully");

                    return client;
                }
                catch (Exception ex) when (attempt < _maxRetries)
                {
                    _logger.LogWarning(ex,
                        "SSH connection attempt {Attempt} failed: {Message}. Retrying in {Delay}s...",
                        attempt, ex.Message, _retryDelay.TotalSeconds);

                    await Task.Delay(_retryDelay, cancellationToken);
                }
            }

            throw new InvalidOperationException($"Failed to connect to SSH after {_maxRetries} attempts");
        }
        finally
        {
            _connectionLock.Release();
        }
    }

    /// <summary>
    /// Executes SSH command with retry logic
    /// </summary>
    private async Task<string> ExecuteWithRetryAsync(string command, CancellationToken cancellationToken)
    {
        for (int attempt = 1; attempt <= _maxRetries; attempt++)
        {
            try
            {
                var client = await GetOrCreateConnectionAsync(cancellationToken);
                var sshCommand = client.RunCommand(command);

                _logger.LogDebug("SSH command '{Command}' executed with exit code {ExitCode}",
                    command, sshCommand.ExitStatus);

                return sshCommand.Result;
            }
            catch (Exception ex) when (attempt < _maxRetries &&
                (ex.Message.Contains("MaxStartups") || ex.Message.Contains("connection")))
            {
                _logger.LogWarning(ex,
                    "SSH command failed on attempt {Attempt}: {Message}. Invalidating connection and retrying...",
                    attempt, ex.Message);

                // Invalidate cached connection
                await _connectionLock.WaitAsync(cancellationToken);
                try
                {
                    if (_cachedClient != null)
                    {
                        try { _cachedClient.Dispose(); } catch { }
                        _cachedClient = null;
                    }
                }
                finally
                {
                    _connectionLock.Release();
                }

                // Wait with exponential backoff
                var delay = TimeSpan.FromSeconds(Math.Pow(2, attempt));
                await Task.Delay(delay, cancellationToken);
            }
        }

        throw new InvalidOperationException($"Failed to execute SSH command after {_maxRetries} attempts");
    }

    public async Task<DockerCleanupResult> CleanBuildCacheAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteDockerCleanup("docker builder prune -af", "Build cache", cancellationToken);
    }

    public async Task<DockerCleanupResult> CleanImagesAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteDockerCleanup("docker image prune -af", "Unused images", cancellationToken);
    }

    public async Task<DockerCleanupResult> CleanContainersAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteDockerCleanup("docker container prune -f", "Stopped containers", cancellationToken);
    }

    public async Task<DockerCleanupResult> CleanVolumesAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteDockerCleanup("docker volume prune -f", "Unused volumes", cancellationToken);
    }

    public async Task<DockerCleanupResult> CleanAllAsync(CancellationToken cancellationToken = default)
    {
        return await ExecuteDockerCleanup("docker system prune -af --volumes", "All Docker resources", cancellationToken);
    }

    private async Task<DockerCleanupResult> ExecuteDockerCleanup(string command, string resourceType, CancellationToken cancellationToken)
    {
        try
        {
            var output = await ExecuteWithRetryAsync(command, cancellationToken);

            // Parse the output to extract space reclaimed
            var spaceMatch = Regex.Match(output ?? "", @"Total reclaimed space:\s+(.+)");
            var spaceClaimed = spaceMatch.Success ? spaceMatch.Groups[1].Value : "Unknown";

            return new DockerCleanupResult
            {
                Success = true,
                Message = $"{resourceType} başarıyla temizlendi",
                SpaceClaimed = spaceClaimed
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Docker cleanup failed for {ResourceType}", resourceType);
            return new DockerCleanupResult
            {
                Success = false,
                Message = $"Temizlik sırasında hata oluştu: {ex.Message}"
            };
        }
    }

    public void Dispose()
    {
        _connectionLock.Wait();
        try
        {
            if (_cachedClient != null)
            {
                try
                {
                    if (_cachedClient.IsConnected)
                    {
                        _cachedClient.Disconnect();
                    }
                    _cachedClient.Dispose();
                }
                catch { /* Ignore disposal errors */ }
                _cachedClient = null;
            }
        }
        finally
        {
            _connectionLock.Release();
            _connectionLock.Dispose();
        }
    }

    private DockerStatsDto ParseDockerStats(string output)
    {
        var lines = output.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        var cacheInfoList = new List<DockerCacheInfo>();

        ImageStats? images = null;
        ContainerStats? containers = null;
        VolumeStats? volumes = null;

        // Parse docker system df output
        // Format: TYPE    TOTAL    ACTIVE    SIZE    RECLAIMABLE
        foreach (var line in lines.Skip(1)) // Skip header
        {
            var parts = Regex.Split(line.Trim(), @"\s{2,}"); // Split by 2+ spaces
            if (parts.Length >= 5)
            {
                var type = parts[0].ToLower();
                var cacheInfo = new DockerCacheInfo
                {
                    Type = parts[0],
                    Total = parts[1],
                    Active = parts[2],
                    Size = parts[3],
                    Reclaimable = parts[4]
                };

                cacheInfoList.Add(cacheInfo);

                // Parse specific stats
                if (type.Contains("images"))
                {
                    images = new ImageStats
                    {
                        Total = int.TryParse(parts[1], out var total) ? total : 0,
                        Size = parts[3]
                    };
                }
                else if (type.Contains("containers"))
                {
                    containers = new ContainerStats
                    {
                        Total = int.TryParse(parts[1], out var total) ? total : 0,
                        Running = int.TryParse(parts[2], out var active) ? active : 0,
                        Stopped = (int.TryParse(parts[1], out var t) ? t : 0) - (int.TryParse(parts[2], out var a) ? a : 0)
                    };
                }
                else if (type.Contains("volumes"))
                {
                    volumes = new VolumeStats
                    {
                        Total = int.TryParse(parts[1], out var total) ? total : 0,
                        Size = parts[3]
                    };
                }
            }
        }

        return new DockerStatsDto
        {
            Containers = containers ?? new ContainerStats { Running = 0, Stopped = 0, Total = 0 },
            Images = images ?? new ImageStats { Total = 0, Size = "0B" },
            Volumes = volumes ?? new VolumeStats { Total = 0, Size = "0B" },
            Networks = 0,
            CacheInfo = cacheInfoList
        };
    }
}
