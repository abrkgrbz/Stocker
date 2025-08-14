using Microsoft.AspNetCore.SignalR;

namespace Stocker.SignalR.Services;

public class CustomUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection)
    {
        // Try to get user ID from different claim types
        var userId = connection.User?.FindFirst("UserId")?.Value
                  ?? connection.User?.FindFirst("sub")?.Value
                  ?? connection.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        return userId;
    }
}