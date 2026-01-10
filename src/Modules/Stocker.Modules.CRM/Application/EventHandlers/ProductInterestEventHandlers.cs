using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.CRM.Domain.Events;
using Stocker.Modules.CRM.Domain.Services;

namespace Stocker.Modules.CRM.Application.EventHandlers;

#region ProductInterest Event Handlers

/// <summary>
/// Handler for product interest recorded events
/// </summary>
public sealed class ProductInterestRecordedEventHandler : INotificationHandler<ProductInterestRecordedDomainEvent>
{
    private readonly ILogger<ProductInterestRecordedEventHandler> _logger;

    public ProductInterestRecordedEventHandler(ILogger<ProductInterestRecordedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductInterestRecordedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product interest recorded: {ProductName}, Level: {InterestLevel}, Source: {Source}",
            notification.ProductName,
            notification.InterestLevel,
            notification.Source);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for product interest level changed events
/// </summary>
public sealed class ProductInterestLevelChangedEventHandler : INotificationHandler<ProductInterestLevelChangedDomainEvent>
{
    private readonly ILogger<ProductInterestLevelChangedEventHandler> _logger;

    public ProductInterestLevelChangedEventHandler(ILogger<ProductInterestLevelChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductInterestLevelChangedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product interest level changed: {ProductName}, {OldLevel} → {NewLevel}",
            notification.ProductName,
            notification.OldLevel,
            notification.NewLevel);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for product interest converted to opportunity events
/// </summary>
public sealed class ProductInterestConvertedToOpportunityEventHandler : INotificationHandler<ProductInterestConvertedToOpportunityDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ProductInterestConvertedToOpportunityEventHandler> _logger;

    public ProductInterestConvertedToOpportunityEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ProductInterestConvertedToOpportunityEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ProductInterestConvertedToOpportunityDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product interest converted to opportunity: {ProductName} → Opportunity {OpportunityId}, Value: {Value}",
            notification.ProductName,
            notification.OpportunityId,
            notification.EstimatedValue?.ToString("C") ?? "Unknown");

        await _notificationService.SendProductInterestConvertedAsync(
            notification.TenantId,
            notification.ProductInterestId,
            notification.ProductName,
            notification.OpportunityId,
            notification.EstimatedValue,
            notification.ConvertedById,
            cancellationToken);
    }
}

/// <summary>
/// Handler for product interest follow-up scheduled events
/// </summary>
public sealed class ProductInterestFollowUpScheduledEventHandler : INotificationHandler<ProductInterestFollowUpScheduledDomainEvent>
{
    private readonly ICrmNotificationService _notificationService;
    private readonly ILogger<ProductInterestFollowUpScheduledEventHandler> _logger;

    public ProductInterestFollowUpScheduledEventHandler(
        ICrmNotificationService notificationService,
        ILogger<ProductInterestFollowUpScheduledEventHandler> logger)
    {
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task Handle(ProductInterestFollowUpScheduledDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product interest follow-up scheduled: {ProductName}, Date: {FollowUpDate}",
            notification.ProductName,
            notification.FollowUpDate);

        await _notificationService.SendProductInterestFollowUpAsync(
            notification.TenantId,
            notification.ProductInterestId,
            notification.ProductName,
            notification.FollowUpDate,
            notification.AssignedToUserId,
            cancellationToken);
    }
}

/// <summary>
/// Handler for product interest linked to quote events
/// </summary>
public sealed class ProductInterestLinkedToQuoteEventHandler : INotificationHandler<ProductInterestLinkedToQuoteDomainEvent>
{
    private readonly ILogger<ProductInterestLinkedToQuoteEventHandler> _logger;

    public ProductInterestLinkedToQuoteEventHandler(ILogger<ProductInterestLinkedToQuoteEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductInterestLinkedToQuoteDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Product interest linked to quote: {ProductName} → {QuoteNumber}",
            notification.ProductName,
            notification.QuoteNumber);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for product interest expired events
/// </summary>
public sealed class ProductInterestExpiredEventHandler : INotificationHandler<ProductInterestExpiredDomainEvent>
{
    private readonly ILogger<ProductInterestExpiredEventHandler> _logger;

    public ProductInterestExpiredEventHandler(ILogger<ProductInterestExpiredEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductInterestExpiredDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogWarning(
            "Product interest expired: {ProductName}, Customer: {CustomerName}, Days since activity: {DaysSinceActivity}",
            notification.ProductName,
            notification.CustomerName ?? "Unknown",
            notification.DaysSinceLastActivity);

        return Task.CompletedTask;
    }
}

/// <summary>
/// Handler for product interest competitor comparison added events
/// </summary>
public sealed class ProductInterestCompetitorComparisonAddedEventHandler : INotificationHandler<ProductInterestCompetitorComparisonAddedDomainEvent>
{
    private readonly ILogger<ProductInterestCompetitorComparisonAddedEventHandler> _logger;

    public ProductInterestCompetitorComparisonAddedEventHandler(ILogger<ProductInterestCompetitorComparisonAddedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(ProductInterestCompetitorComparisonAddedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Competitor comparison added: {ProductName} vs {CompetitorName} - {CompetitorProduct}",
            notification.ProductName,
            notification.CompetitorName,
            notification.CompetitorProductName ?? "Unknown product");

        return Task.CompletedTask;
    }
}

#endregion
