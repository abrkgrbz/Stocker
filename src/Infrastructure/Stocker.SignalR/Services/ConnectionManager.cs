using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Stocker.SignalR.Services;

public interface IConnectionManager
{
    void AddConnection(string userId, string connectionId);
    void RemoveConnection(string connectionId);
    string? GetConnectionId(string userId);
    IEnumerable<string> GetConnections(string userId);
    IEnumerable<string> GetAllActiveConnections();
    bool IsUserOnline(string userId);
    int GetOnlineUsersCount();
}

public class ConnectionManager : IConnectionManager
{
    private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();
    private readonly ConcurrentDictionary<string, string> _connectionToUser = new();
    private readonly ILogger<ConnectionManager> _logger;

    public ConnectionManager(ILogger<ConnectionManager> logger)
    {
        _logger = logger;
    }

    public void AddConnection(string userId, string connectionId)
    {
        try
        {
            _connectionToUser.TryAdd(connectionId, userId);

            _userConnections.AddOrUpdate(userId,
                new HashSet<string> { connectionId },
                (key, connections) =>
                {
                    lock (connections)
                    {
                        connections.Add(connectionId);
                        return connections;
                    }
                });

            _logger.LogInformation("Connection {ConnectionId} added for user {UserId}", connectionId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding connection {ConnectionId} for user {UserId}", connectionId, userId);
        }
    }

    public void RemoveConnection(string connectionId)
    {
        try
        {
            if (_connectionToUser.TryRemove(connectionId, out var userId))
            {
                if (_userConnections.TryGetValue(userId, out var connections))
                {
                    lock (connections)
                    {
                        connections.Remove(connectionId);
                        if (connections.Count == 0)
                        {
                            _userConnections.TryRemove(userId, out _);
                        }
                    }
                }

                _logger.LogInformation("Connection {ConnectionId} removed for user {UserId}", connectionId, userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing connection {ConnectionId}", connectionId);
        }
    }

    public string? GetConnectionId(string userId)
    {
        return _userConnections.TryGetValue(userId, out var connections) 
            ? connections.FirstOrDefault() 
            : null;
    }

    public IEnumerable<string> GetConnections(string userId)
    {
        return _userConnections.TryGetValue(userId, out var connections) 
            ? connections.ToList() 
            : Enumerable.Empty<string>();
    }

    public IEnumerable<string> GetAllActiveConnections()
    {
        return _connectionToUser.Keys.ToList();
    }

    public bool IsUserOnline(string userId)
    {
        return _userConnections.ContainsKey(userId) && 
               _userConnections[userId].Any();
    }

    public int GetOnlineUsersCount()
    {
        return _userConnections.Count;
    }
}