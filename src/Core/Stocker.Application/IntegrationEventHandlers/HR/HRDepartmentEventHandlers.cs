using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Interfaces.Repositories;
using Stocker.Domain.Tenant.Entities;
using Stocker.Shared.Events.HR;

namespace Stocker.Application.IntegrationEventHandlers.HR;

/// <summary>
/// Handles HR Department created event by syncing to Tenant.Department
/// </summary>
public class HRDepartmentCreatedEventHandler : INotificationHandler<HRDepartmentCreatedEvent>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly ILogger<HRDepartmentCreatedEventHandler> _logger;

    public HRDepartmentCreatedEventHandler(
        IDepartmentRepository departmentRepository,
        ILogger<HRDepartmentCreatedEventHandler> logger)
    {
        _departmentRepository = departmentRepository;
        _logger = logger;
    }

    public async Task Handle(HRDepartmentCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Syncing HR Department to Tenant.Department: {Code} - {Name} for Tenant: {TenantId}",
            notification.Code,
            notification.Name,
            notification.TenantId);

        // Check if department with same name already exists in Tenant
        var existingDepartment = await _departmentRepository.GetByNameAsync(
            notification.Name, notification.TenantId, cancellationToken);

        if (existingDepartment != null)
        {
            _logger.LogWarning(
                "Tenant.Department with name '{Name}' already exists for Tenant {TenantId}. Skipping sync.",
                notification.Name,
                notification.TenantId);
            return;
        }

        // Create new Tenant.Department
        var department = new Department(
            tenantId: notification.TenantId,
            companyId: null,
            name: notification.Name,
            code: notification.Code,
            description: notification.Description,
            parentDepartmentId: null);

        await _departmentRepository.AddAsync(department, cancellationToken);

        _logger.LogInformation(
            "Successfully synced HR Department {HRDepartmentId} to Tenant.Department {TenantDepartmentId}",
            notification.HRDepartmentId,
            department.Id);
    }
}

/// <summary>
/// Handles HR Department updated event by syncing to Tenant.Department
/// </summary>
public class HRDepartmentUpdatedEventHandler : INotificationHandler<HRDepartmentUpdatedEvent>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly ILogger<HRDepartmentUpdatedEventHandler> _logger;

    public HRDepartmentUpdatedEventHandler(
        IDepartmentRepository departmentRepository,
        ILogger<HRDepartmentUpdatedEventHandler> logger)
    {
        _departmentRepository = departmentRepository;
        _logger = logger;
    }

    public async Task Handle(HRDepartmentUpdatedEvent notification, CancellationToken cancellationToken)
    {
        if (!notification.TenantDepartmentId.HasValue)
        {
            _logger.LogWarning(
                "HR Department {HRDepartmentId} has no linked Tenant.Department. Cannot sync update.",
                notification.HRDepartmentId);
            return;
        }

        var department = await _departmentRepository.GetByIdAsync(
            notification.TenantDepartmentId.Value, notification.TenantId, cancellationToken);

        if (department == null)
        {
            _logger.LogWarning(
                "Tenant.Department {TenantDepartmentId} not found for Tenant {TenantId}. Cannot sync update.",
                notification.TenantDepartmentId,
                notification.TenantId);
            return;
        }

        department.Update(notification.Name, notification.Code, notification.Description);
        await _departmentRepository.UpdateAsync(department, cancellationToken);

        _logger.LogInformation(
            "Successfully synced HR Department update {HRDepartmentId} to Tenant.Department {TenantDepartmentId}",
            notification.HRDepartmentId,
            notification.TenantDepartmentId);
    }
}

/// <summary>
/// Handles HR Department deleted event by deactivating Tenant.Department
/// </summary>
public class HRDepartmentDeletedEventHandler : INotificationHandler<HRDepartmentDeletedEvent>
{
    private readonly IDepartmentRepository _departmentRepository;
    private readonly ILogger<HRDepartmentDeletedEventHandler> _logger;

    public HRDepartmentDeletedEventHandler(
        IDepartmentRepository departmentRepository,
        ILogger<HRDepartmentDeletedEventHandler> logger)
    {
        _departmentRepository = departmentRepository;
        _logger = logger;
    }

    public async Task Handle(HRDepartmentDeletedEvent notification, CancellationToken cancellationToken)
    {
        if (!notification.TenantDepartmentId.HasValue)
        {
            _logger.LogWarning(
                "HR Department {HRDepartmentId} has no linked Tenant.Department. Nothing to delete.",
                notification.HRDepartmentId);
            return;
        }

        var department = await _departmentRepository.GetByIdAsync(
            notification.TenantDepartmentId.Value, notification.TenantId, cancellationToken);

        if (department == null)
        {
            _logger.LogWarning(
                "Tenant.Department {TenantDepartmentId} not found for Tenant {TenantId}. Cannot sync delete.",
                notification.TenantDepartmentId,
                notification.TenantId);
            return;
        }

        await _departmentRepository.DeleteAsync(department, cancellationToken);

        _logger.LogInformation(
            "Successfully deactivated Tenant.Department {TenantDepartmentId} after HR Department {HRDepartmentId} deletion",
            notification.TenantDepartmentId,
            notification.HRDepartmentId);
    }
}
