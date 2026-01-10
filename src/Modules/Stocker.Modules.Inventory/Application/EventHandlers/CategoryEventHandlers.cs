using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Application.EventHandlers;

/// <summary>
/// Kategori oluşturulduğunda çalışan event handler.
/// </summary>
public class CategoryCreatedEventHandler : INotificationHandler<CategoryCreatedDomainEvent>
{
    private readonly ILogger<CategoryCreatedEventHandler> _logger;

    public CategoryCreatedEventHandler(ILogger<CategoryCreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CategoryCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Category created: {CategoryCode} ({CategoryName}), Parent: {ParentCategoryId}",
            notification.Code,
            notification.Name,
            notification.ParentCategoryId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kategori güncellendiğinde çalışan event handler.
/// </summary>
public class CategoryUpdatedEventHandler : INotificationHandler<CategoryUpdatedDomainEvent>
{
    private readonly ILogger<CategoryUpdatedEventHandler> _logger;

    public CategoryUpdatedEventHandler(ILogger<CategoryUpdatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CategoryUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Category updated: {CategoryCode} ({CategoryName}), Parent: {ParentCategoryId}",
            notification.Code,
            notification.Name,
            notification.ParentCategoryId);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kategori aktifleştirildiğinde çalışan event handler.
/// </summary>
public class CategoryActivatedEventHandler : INotificationHandler<CategoryActivatedDomainEvent>
{
    private readonly ILogger<CategoryActivatedEventHandler> _logger;

    public CategoryActivatedEventHandler(ILogger<CategoryActivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CategoryActivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Category activated: {CategoryCode} ({CategoryName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Kategori pasifleştirildiğinde çalışan event handler.
/// </summary>
public class CategoryDeactivatedEventHandler : INotificationHandler<CategoryDeactivatedDomainEvent>
{
    private readonly ILogger<CategoryDeactivatedEventHandler> _logger;

    public CategoryDeactivatedEventHandler(ILogger<CategoryDeactivatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(CategoryDeactivatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Category deactivated: {CategoryCode} ({CategoryName})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}
