using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class UserLoginHistory : Entity
{
    public Guid UserId { get; private set; }
    public bool IsSuccessful { get; private set; }
    public DateTime LoginAt { get; private set; }
    public string? IpAddress { get; private set; }
    public string? UserAgent { get; private set; }
    public string? FailureReason { get; private set; }

    private UserLoginHistory() { } // EF Constructor

    public UserLoginHistory(
        Guid userId,
        bool isSuccessful,
        string? ipAddress = null,
        string? userAgent = null,
        string? failureReason = null)
    {
        // Id = Guid.NewGuid(); // EF Core will generate this
        UserId = userId;
        IsSuccessful = isSuccessful;
        LoginAt = DateTime.UtcNow;
        IpAddress = ipAddress;
        UserAgent = userAgent;
        FailureReason = failureReason;
    }
}