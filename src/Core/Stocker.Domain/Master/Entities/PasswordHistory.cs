using Stocker.Domain.Master.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public class PasswordHistory : Entity
{
    public Guid UserId { get; private set; }
    public HashedPassword Password { get; private set; }
    public DateTime UsedAt { get; private set; }
    public DateTime? ExpiredAt { get; private set; }

    // Navigation
    public virtual MasterUser User { get; private set; } = null!;

    private PasswordHistory() { } // EF Core

    public static PasswordHistory Create(Guid userId, HashedPassword password)
    {
        return new PasswordHistory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Password = password,
            UsedAt = DateTime.UtcNow
        };
    }

    public void MarkAsExpired()
    {
        ExpiredAt = DateTime.UtcNow;
    }
}