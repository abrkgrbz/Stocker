using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class SubscriptionModule : Entity
{
    public Guid SubscriptionId { get; private set; }
    public string ModuleCode { get; private set; }
    public string ModuleName { get; private set; }
    public int? MaxEntities { get; private set; }
    public DateTime AddedAt { get; private set; }

    private SubscriptionModule() { } // EF Constructor

    public SubscriptionModule(
        Guid subscriptionId,
        string moduleCode,
        string moduleName,
        int? maxEntities = null)
    {
        Id = Guid.NewGuid();
        SubscriptionId = subscriptionId;
        ModuleCode = moduleCode ?? throw new ArgumentNullException(nameof(moduleCode));
        ModuleName = moduleName ?? throw new ArgumentNullException(nameof(moduleName));
        MaxEntities = maxEntities;
        AddedAt = DateTime.UtcNow;
    }
}