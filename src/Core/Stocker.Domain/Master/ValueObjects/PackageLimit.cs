using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.ValueObjects;

public sealed class PackageLimit : ValueObject
{
    public int MaxUsers { get; }
    public int MaxStorage { get; } // in GB
    public int MaxProjects { get; }
    public int MaxApiCalls { get; } // per month
    public Dictionary<string, int> ModuleLimits { get; }

    private PackageLimit(
        int maxUsers,
        int maxStorage,
        int maxProjects,
        int maxApiCalls,
        Dictionary<string, int> moduleLimits)
    {
        MaxUsers = maxUsers;
        MaxStorage = maxStorage;
        MaxProjects = maxProjects;
        MaxApiCalls = maxApiCalls;
        ModuleLimits = moduleLimits;
    }

    public static PackageLimit Create(
        int maxUsers,
        int maxStorage,
        int maxProjects,
        int maxApiCalls,
        Dictionary<string, int>? moduleLimits = null)
    {
        if (maxUsers <= 0)
        {
            throw new ArgumentException("Max users must be greater than zero.", nameof(maxUsers));
        }

        if (maxStorage <= 0)
        {
            throw new ArgumentException("Max storage must be greater than zero.", nameof(maxStorage));
        }

        if (maxProjects < 0)
        {
            throw new ArgumentException("Max projects cannot be negative.", nameof(maxProjects));
        }

        if (maxApiCalls < 0)
        {
            throw new ArgumentException("Max API calls cannot be negative.", nameof(maxApiCalls));
        }

        return new PackageLimit(
            maxUsers,
            maxStorage,
            maxProjects,
            maxApiCalls,
            moduleLimits ?? new Dictionary<string, int>());
    }

    public static PackageLimit Unlimited()
    {
        return new PackageLimit(
            int.MaxValue,
            int.MaxValue,
            int.MaxValue,
            int.MaxValue,
            new Dictionary<string, int>());
    }

    public override IEnumerable<object> GetEqualityComponents()
    {
        yield return MaxUsers;
        yield return MaxStorage;
        yield return MaxProjects;
        yield return MaxApiCalls;
        foreach (var limit in ModuleLimits.OrderBy(x => x.Key))
        {
            yield return limit.Key;
            yield return limit.Value;
        }
    }
}