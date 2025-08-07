using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class PackageModule : Entity
{
    public Guid PackageId { get; private set; }
    public string ModuleCode { get; private set; }
    public string ModuleName { get; private set; }
    public bool IsIncluded { get; private set; }
    public int? MaxEntities { get; private set; } // null means unlimited

    private PackageModule() { } // EF Constructor

    public PackageModule(
        Guid packageId,
        string moduleCode,
        string moduleName,
        bool isIncluded = true,
        int? maxEntities = null)
    {
        Id = Guid.NewGuid();
        PackageId = packageId;
        ModuleCode = moduleCode ?? throw new ArgumentNullException(nameof(moduleCode));
        ModuleName = moduleName ?? throw new ArgumentNullException(nameof(moduleName));
        IsIncluded = isIncluded;
        MaxEntities = maxEntities;
    }
}