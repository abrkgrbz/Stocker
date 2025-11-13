using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Renci.SshNet;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.Features.SystemManagement.Commands.CleanDocker;
using Stocker.Application.Features.SystemManagement.Queries.GetDockerStats;
using System.Text.RegularExpressions;

namespace Stocker.Infrastructure.Services;

public class DockerManagementService : IDockerManagementService
{
    private readonly string _sshHost;
    private readonly string _sshUser;
    private readonly string _sshKeyPath;
    private readonly ILogger<DockerManagementService> _logger;

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
        var sshKeyFromVault = configuration["docker-management-ssh-key"];

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
            _logger.LogInformation("Connecting to SSH: {Host} as {User}", _sshHost, _sshUser);
            _logger.LogInformation("Using SSH key: {KeyPath}", _sshKeyPath);

            using var client = new SshClient(_sshHost, _sshUser, new PrivateKeyFile(_sshKeyPath));
            client.Connect();
            _logger.LogInformation("SSH connection successful");

            // Get docker system df output
            var dfCommand = client.RunCommand("docker system df");
            var output = dfCommand.Result;
            _logger.LogInformation("Docker command output length: {Length}", output?.Length ?? 0);
            _logger.LogDebug("Docker command output: {Output}", output);

            var stats = ParseDockerStats(output);
            _logger.LogInformation("Parsed stats - Containers: {Containers}, Images: {Images}, Volumes: {Volumes}",
                stats.Containers.Total, stats.Images.Total, stats.Volumes.Total);

            client.Disconnect();

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Docker stats from SSH host {Host}. Error: {Message}",
                _sshHost, ex.Message);

            // Fallback to mock data for development
            return new DockerStatsDto
            {
                Containers = new ContainerStats { Running = 0, Stopped = 0, Total = 0 },
                Images = new ImageStats { Total = 0, Size = "0B" },
                Volumes = new VolumeStats { Total = 0, Size = "0B" },
                Networks = 0,
                CacheInfo = new List<DockerCacheInfo>()
            };
        }
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
            using var client = new SshClient(_sshHost, _sshUser, new PrivateKeyFile(_sshKeyPath));
            client.Connect();

            var sshCommand = client.RunCommand(command);
            var output = sshCommand.Result;

            client.Disconnect();

            // Parse the output to extract space reclaimed
            var spaceMatch = Regex.Match(output, @"Total reclaimed space:\s+(.+)");
            var spaceClaimed = spaceMatch.Success ? spaceMatch.Groups[1].Value : "Unknown";

            return new DockerCleanupResult
            {
                Success = sshCommand.ExitStatus == 0,
                Message = $"{resourceType} başarıyla temizlendi",
                SpaceClaimed = spaceClaimed
            };
        }
        catch (Exception ex)
        {
            return new DockerCleanupResult
            {
                Success = false,
                Message = $"Temizlik sırasında hata oluştu: {ex.Message}"
            };
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
