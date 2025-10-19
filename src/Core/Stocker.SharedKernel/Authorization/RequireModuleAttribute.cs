using System;

namespace Stocker.SharedKernel.Authorization;

/// <summary>
/// Attribute to specify that an endpoint requires a specific module subscription.
/// Used by ModuleAuthorizationMiddleware to enforce tenant-level module access control.
/// </summary>
/// <example>
/// [RequireModule("CRM")]
/// public class CustomersController : ControllerBase { }
/// </example>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false)]
public class RequireModuleAttribute : Attribute
{
    /// <summary>
    /// Gets the name of the required module (e.g., "CRM", "Sales", "Finance")
    /// </summary>
    public string ModuleName { get; }

    /// <summary>
    /// Creates a new RequireModuleAttribute with the specified module name
    /// </summary>
    /// <param name="moduleName">Name of the module (e.g., "CRM", "Sales", "Finance")</param>
    /// <exception cref="ArgumentException">Thrown when module name is null or whitespace</exception>
    public RequireModuleAttribute(string moduleName)
    {
        if (string.IsNullOrWhiteSpace(moduleName))
            throw new ArgumentException("Module name cannot be empty", nameof(moduleName));

        ModuleName = moduleName;
    }
}
