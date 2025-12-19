using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

namespace Stocker.SignalR.Services;

/// <summary>
/// In-memory implementation of IHubStateManager with thread-safe operations
/// Suitable for single-server deployments; use Redis implementation for distributed scenarios
/// </summary>
/// <typeparam name="TKey">The type of the key</typeparam>
/// <typeparam name="TValue">The type of the value</typeparam>
public class InMemoryHubStateManager<TKey, TValue> : IHubStateManager<TKey, TValue> where TKey : notnull
{
    private readonly ConcurrentDictionary<TKey, StateEntry> _state = new();
    private readonly ILogger<InMemoryHubStateManager<TKey, TValue>> _logger;
    private readonly Timer? _cleanupTimer;

    private class StateEntry
    {
        public TValue Value { get; set; } = default!;
        public DateTime? ExpiresAt { get; set; }

        public bool IsExpired => ExpiresAt.HasValue && DateTime.UtcNow > ExpiresAt.Value;
    }

    public InMemoryHubStateManager(ILogger<InMemoryHubStateManager<TKey, TValue>> logger)
    {
        _logger = logger;
        // Run cleanup every 5 minutes
        _cleanupTimer = new Timer(CleanupExpiredEntries, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(5));
    }

    public Task<TValue?> GetAsync(TKey key)
    {
        if (_state.TryGetValue(key, out var entry) && !entry.IsExpired)
        {
            return Task.FromResult<TValue?>(entry.Value);
        }

        // Remove expired entry if found
        if (entry?.IsExpired == true)
        {
            _state.TryRemove(key, out _);
        }

        return Task.FromResult<TValue?>(default);
    }

    public Task SetAsync(TKey key, TValue value, TimeSpan? expiry = null)
    {
        var entry = new StateEntry
        {
            Value = value,
            ExpiresAt = expiry.HasValue ? DateTime.UtcNow.Add(expiry.Value) : null
        };

        _state.AddOrUpdate(key, entry, (_, _) => entry);
        _logger.LogDebug("State entry set: Key={Key}, HasExpiry={HasExpiry}", key, expiry.HasValue);

        return Task.CompletedTask;
    }

    public Task<bool> RemoveAsync(TKey key)
    {
        var removed = _state.TryRemove(key, out _);
        if (removed)
        {
            _logger.LogDebug("State entry removed: Key={Key}", key);
        }
        return Task.FromResult(removed);
    }

    public Task<IEnumerable<TValue>> GetAllAsync()
    {
        var values = _state.Values
            .Where(e => !e.IsExpired)
            .Select(e => e.Value)
            .ToList();

        return Task.FromResult<IEnumerable<TValue>>(values);
    }

    public Task<IEnumerable<TKey>> GetAllKeysAsync()
    {
        var keys = _state
            .Where(kvp => !kvp.Value.IsExpired)
            .Select(kvp => kvp.Key)
            .ToList();

        return Task.FromResult<IEnumerable<TKey>>(keys);
    }

    public Task<bool> ExistsAsync(TKey key)
    {
        if (_state.TryGetValue(key, out var entry))
        {
            if (!entry.IsExpired)
            {
                return Task.FromResult(true);
            }
            // Remove expired entry
            _state.TryRemove(key, out _);
        }
        return Task.FromResult(false);
    }

    public Task<TValue> GetOrAddAsync(TKey key, Func<TKey, TValue> valueFactory)
    {
        var entry = _state.GetOrAdd(key, k => new StateEntry { Value = valueFactory(k) });

        if (entry.IsExpired)
        {
            // Replace expired entry
            var newEntry = new StateEntry { Value = valueFactory(key) };
            _state.TryUpdate(key, newEntry, entry);
            return Task.FromResult(newEntry.Value);
        }

        return Task.FromResult(entry.Value);
    }

    public Task<bool> UpdateAsync(TKey key, Func<TValue, TValue> updateFactory)
    {
        if (_state.TryGetValue(key, out var entry) && !entry.IsExpired)
        {
            var newEntry = new StateEntry
            {
                Value = updateFactory(entry.Value),
                ExpiresAt = entry.ExpiresAt
            };

            var updated = _state.TryUpdate(key, newEntry, entry);
            if (updated)
            {
                _logger.LogDebug("State entry updated: Key={Key}", key);
            }
            return Task.FromResult(updated);
        }

        return Task.FromResult(false);
    }

    public Task<int> GetCountAsync()
    {
        var count = _state.Values.Count(e => !e.IsExpired);
        return Task.FromResult(count);
    }

    public Task ClearAsync()
    {
        var count = _state.Count;
        _state.Clear();
        _logger.LogInformation("State cleared: EntriesRemoved={Count}", count);
        return Task.CompletedTask;
    }

    private void CleanupExpiredEntries(object? state)
    {
        var expiredKeys = _state
            .Where(kvp => kvp.Value.IsExpired)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in expiredKeys)
        {
            _state.TryRemove(key, out _);
        }

        if (expiredKeys.Count > 0)
        {
            _logger.LogDebug("Expired state entries cleaned up: Count={Count}", expiredKeys.Count);
        }
    }
}

/// <summary>
/// In-memory implementation of user connection state management
/// </summary>
public class InMemoryUserConnectionStateManager : IUserConnectionStateManager
{
    private readonly ConcurrentDictionary<string, HashSet<string>> _userConnections = new();
    private readonly ConcurrentDictionary<string, string> _connectionToUser = new();
    private readonly object _lock = new();
    private readonly ILogger<InMemoryUserConnectionStateManager> _logger;

    public InMemoryUserConnectionStateManager(ILogger<InMemoryUserConnectionStateManager> logger)
    {
        _logger = logger;
    }

    public Task AddConnectionAsync(string userId, string connectionId)
    {
        _connectionToUser.TryAdd(connectionId, userId);

        _userConnections.AddOrUpdate(userId,
            new HashSet<string> { connectionId },
            (_, connections) =>
            {
                lock (_lock)
                {
                    connections.Add(connectionId);
                    return connections;
                }
            });

        _logger.LogDebug("Connection added: UserId={UserId}, ConnectionId={ConnectionId}", userId, connectionId);
        return Task.CompletedTask;
    }

    public Task RemoveConnectionAsync(string connectionId)
    {
        if (_connectionToUser.TryRemove(connectionId, out var userId))
        {
            if (_userConnections.TryGetValue(userId, out var connections))
            {
                lock (_lock)
                {
                    connections.Remove(connectionId);
                    if (connections.Count == 0)
                    {
                        _userConnections.TryRemove(userId, out _);
                    }
                }
            }

            _logger.LogDebug("Connection removed: UserId={UserId}, ConnectionId={ConnectionId}", userId, connectionId);
        }

        return Task.CompletedTask;
    }

    public Task<string?> GetUserIdByConnectionAsync(string connectionId)
    {
        _connectionToUser.TryGetValue(connectionId, out var userId);
        return Task.FromResult(userId);
    }

    public Task<IEnumerable<string>> GetConnectionsByUserAsync(string userId)
    {
        if (_userConnections.TryGetValue(userId, out var connections))
        {
            lock (_lock)
            {
                return Task.FromResult<IEnumerable<string>>(connections.ToList());
            }
        }

        return Task.FromResult<IEnumerable<string>>(Enumerable.Empty<string>());
    }

    public Task<bool> IsUserOnlineAsync(string userId)
    {
        var isOnline = _userConnections.TryGetValue(userId, out var connections) && connections.Count > 0;
        return Task.FromResult(isOnline);
    }

    public Task<int> GetOnlineUserCountAsync()
    {
        return Task.FromResult(_userConnections.Count);
    }
}

/// <summary>
/// In-memory implementation of room state management
/// </summary>
/// <typeparam name="TRoom">The room type</typeparam>
public class InMemoryRoomStateManager<TRoom> : IRoomStateManager<TRoom> where TRoom : class
{
    private readonly ConcurrentDictionary<string, TRoom> _rooms = new();
    private readonly object _lock = new();
    private readonly ILogger<InMemoryRoomStateManager<TRoom>> _logger;

    public InMemoryRoomStateManager(ILogger<InMemoryRoomStateManager<TRoom>> logger)
    {
        _logger = logger;
    }

    public Task<TRoom?> GetRoomAsync(string roomName)
    {
        _rooms.TryGetValue(roomName, out var room);
        return Task.FromResult(room);
    }

    public Task<TRoom> CreateOrGetRoomAsync(string roomName, Func<string, TRoom> roomFactory)
    {
        var room = _rooms.GetOrAdd(roomName, roomFactory);
        _logger.LogDebug("Room retrieved or created: RoomName={RoomName}", roomName);
        return Task.FromResult(room);
    }

    public Task<bool> RemoveRoomAsync(string roomName)
    {
        var removed = _rooms.TryRemove(roomName, out _);
        if (removed)
        {
            _logger.LogDebug("Room removed: RoomName={RoomName}", roomName);
        }
        return Task.FromResult(removed);
    }

    public Task<IEnumerable<TRoom>> GetAllRoomsAsync()
    {
        return Task.FromResult<IEnumerable<TRoom>>(_rooms.Values.ToList());
    }

    public Task<bool> RoomExistsAsync(string roomName)
    {
        return Task.FromResult(_rooms.ContainsKey(roomName));
    }

    public Task UpdateRoomAsync(string roomName, Action<TRoom> updateAction)
    {
        if (_rooms.TryGetValue(roomName, out var room))
        {
            lock (_lock)
            {
                updateAction(room);
            }
            _logger.LogDebug("Room updated: RoomName={RoomName}", roomName);
        }
        return Task.CompletedTask;
    }
}
