using System.Collections.Concurrent;

namespace Stocker.SignalR.Services;

/// <summary>
/// Generic interface for managing hub state with thread-safe operations
/// Abstracts state storage to allow for different implementations (in-memory, Redis, etc.)
/// </summary>
/// <typeparam name="TKey">The type of the key used to identify state entries</typeparam>
/// <typeparam name="TValue">The type of the value stored in state</typeparam>
public interface IHubStateManager<TKey, TValue> where TKey : notnull
{
    /// <summary>
    /// Gets a value from state by key
    /// </summary>
    Task<TValue?> GetAsync(TKey key);

    /// <summary>
    /// Sets a value in state with optional expiry
    /// </summary>
    Task SetAsync(TKey key, TValue value, TimeSpan? expiry = null);

    /// <summary>
    /// Removes a value from state
    /// </summary>
    Task<bool> RemoveAsync(TKey key);

    /// <summary>
    /// Gets all values in state
    /// </summary>
    Task<IEnumerable<TValue>> GetAllAsync();

    /// <summary>
    /// Gets all keys in state
    /// </summary>
    Task<IEnumerable<TKey>> GetAllKeysAsync();

    /// <summary>
    /// Checks if a key exists in state
    /// </summary>
    Task<bool> ExistsAsync(TKey key);

    /// <summary>
    /// Gets or adds a value atomically
    /// </summary>
    Task<TValue> GetOrAddAsync(TKey key, Func<TKey, TValue> valueFactory);

    /// <summary>
    /// Updates a value atomically if it exists
    /// </summary>
    Task<bool> UpdateAsync(TKey key, Func<TValue, TValue> updateFactory);

    /// <summary>
    /// Gets the count of items in state
    /// </summary>
    Task<int> GetCountAsync();

    /// <summary>
    /// Clears all state entries
    /// </summary>
    Task ClearAsync();
}

/// <summary>
/// Specialized interface for managing user connections
/// </summary>
public interface IUserConnectionStateManager
{
    Task AddConnectionAsync(string userId, string connectionId);
    Task RemoveConnectionAsync(string connectionId);
    Task<string?> GetUserIdByConnectionAsync(string connectionId);
    Task<IEnumerable<string>> GetConnectionsByUserAsync(string userId);
    Task<bool> IsUserOnlineAsync(string userId);
    Task<int> GetOnlineUserCountAsync();
}

/// <summary>
/// Specialized interface for managing room/group state
/// </summary>
/// <typeparam name="TRoom">The room type containing room metadata</typeparam>
public interface IRoomStateManager<TRoom> where TRoom : class
{
    Task<TRoom?> GetRoomAsync(string roomName);
    Task<TRoom> CreateOrGetRoomAsync(string roomName, Func<string, TRoom> roomFactory);
    Task<bool> RemoveRoomAsync(string roomName);
    Task<IEnumerable<TRoom>> GetAllRoomsAsync();
    Task<bool> RoomExistsAsync(string roomName);
    Task UpdateRoomAsync(string roomName, Action<TRoom> updateAction);
}
