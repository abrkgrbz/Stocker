using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Subscriptions.Commands.CreateSubscription;
using Stocker.Application.Features.Subscriptions.Commands.UpdateSubscription;
using Stocker.Application.Features.Subscriptions.Commands.CancelSubscription;
using Stocker.Application.Features.Subscriptions.Commands.RenewSubscription;
using Stocker.Application.Features.Subscriptions.Commands.SuspendSubscription;
using Stocker.Application.Features.Subscriptions.Commands.ReactivateSubscription;
using Stocker.Application.Features.Subscriptions.Commands.ChangePackage;
using Stocker.Application.Features.Subscriptions.Commands.UpgradeSubscription;
using Stocker.Application.Features.Subscriptions.Commands.DowngradeSubscription;
using Stocker.Application.Features.Subscriptions.Queries.GetSubscriptions;
using Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionById;
using Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionHistory;
using Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionUsage;
using Swashbuckle.AspNetCore.Annotations;
using Stocker.Application.Common.Exceptions;
using Stocker.SharedKernel.Exceptions;

namespace Stocker.API.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[SwaggerTag("Master Admin Panel - Subscription Management")]
public class SubscriptionsController : MasterControllerBase
{
    public SubscriptionsController(IMediator mediator, ILogger<SubscriptionsController> logger) : base(mediator, logger)
    {
    }

    [HttpGet]
    public async Task<IActionResult> GetSubscriptions([FromQuery] Guid? tenantId, [FromQuery] string? status, [FromQuery] bool? autoRenew)
    {
        try
        {
            Domain.Master.Enums.SubscriptionStatus? subscriptionStatus = null;
            if (!string.IsNullOrEmpty(status) && Enum.TryParse<Domain.Master.Enums.SubscriptionStatus>(status, true, out var parsedStatus))
            {
                subscriptionStatus = parsedStatus;
            }

            var query = new GetSubscriptionsQuery
            {
                TenantId = tenantId,
                Status = subscriptionStatus,
                AutoRenew = autoRenew
            };

            var result = await _mediator.Send(query);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error getting subscriptions");
            return StatusCode(500, "An error occurred while getting subscriptions");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSubscriptionById(Guid id)
    {
        try
        {
            var query = new GetSubscriptionByIdQuery { Id = id };
            var result = await _mediator.Send(query);

            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error getting subscription {SubscriptionId}", id);
            return StatusCode(500,  "An error occurred while getting the subscription" );
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateSubscription([FromBody] CreateSubscriptionCommand command)
    {
        try
        {
            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error creating subscription");
            return StatusCode(500, "An error occurred while creating the subscription");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateSubscription(Guid id, [FromBody] UpdateSubscriptionCommand command)
    {
        try
        {
            var commandWithId = command with { Id = id };
            var result = await _mediator.Send(commandWithId);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error updating subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while updating the subscription");
        }
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelSubscription(Guid id, [FromBody] CancelSubscriptionRequest request)
    {
        try
        {
            var command = new CancelSubscriptionCommand
            {
                Id = id,
                Reason = request.Reason ?? "User requested cancellation"
            };

            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error cancelling subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while cancelling the subscription");
        }
    }

    [HttpPost("{id}/renew")]
    public async Task<IActionResult> RenewSubscription(Guid id, [FromBody] RenewSubscriptionRequest? request = null)
    { 
        try
        {
            var command = new RenewSubscriptionCommand
            {
                SubscriptionId = id,
                AdditionalMonths = request?.AdditionalMonths ?? 1
            };
            
            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error renewing subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while renewing the subscription");
        }
    }

    [HttpPost("{id}/suspend")]
    public async Task<IActionResult> SuspendSubscription(Guid id, [FromBody] SuspendSubscriptionRequest request)
    {
        try
        {
            var command = new SuspendSubscriptionCommand
            {
                Id = id,
                Reason = request.Reason ?? "Admin suspended subscription"
            };

            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error suspending subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while suspending the subscription");
        }
    }

    [HttpPost("{id}/reactivate")]
    public async Task<IActionResult> ReactivateSubscription(Guid id)
    {
        try
        {
            var command = new ReactivateSubscriptionCommand
            {
                Id = id
            };

            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error reactivating subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while reactivating the subscription");
        }
    }

    /// <summary>
    /// Change subscription package for a tenant
    /// </summary>
    [HttpPost("tenant/{tenantId}/change-package")]
    public async Task<IActionResult> ChangePackage(Guid tenantId, [FromBody] ChangePackageRequest request)
    {
        try
        {
            var command = new ChangePackageCommand
            {
                TenantId = tenantId,
                NewPackageId = request.NewPackageId
            };

            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error changing package for tenant {TenantId}", tenantId);
            return StatusCode(500, "An error occurred while changing the package");
        }
    }

    /// <summary>
    /// Get subscription change history
    /// </summary>
    [HttpGet("{id}/history")]
    [SwaggerOperation(Summary = "Get subscription history", Description = "Returns the history of changes for a subscription")]
    public async Task<IActionResult> GetSubscriptionHistory(Guid id, [FromQuery] int? limit = 50)
    {
        try
        {
            var query = new GetSubscriptionHistoryQuery
            {
                SubscriptionId = id,
                Limit = limit
            };

            var result = await _mediator.Send(query);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error getting subscription history for {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while getting subscription history");
        }
    }

    /// <summary>
    /// Get subscription usage metrics
    /// </summary>
    [HttpGet("{id}/usage")]
    [SwaggerOperation(Summary = "Get subscription usage", Description = "Returns usage metrics and trends for a subscription")]
    public async Task<IActionResult> GetSubscriptionUsage(Guid id, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        try
        {
            var query = new GetSubscriptionUsageQuery
            {
                SubscriptionId = id,
                StartDate = startDate,
                EndDate = endDate
            };

            var result = await _mediator.Send(query);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error getting subscription usage for {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while getting subscription usage");
        }
    }

    /// <summary>
    /// Upgrade subscription to a higher tier package
    /// </summary>
    [HttpPost("{id}/upgrade")]
    [SwaggerOperation(Summary = "Upgrade subscription", Description = "Upgrades the subscription to a higher tier package with optional prorated billing")]
    public async Task<IActionResult> UpgradeSubscription(Guid id, [FromBody] UpgradeSubscriptionRequest request)
    {
        try
        {
            var command = new UpgradeSubscriptionCommand
            {
                SubscriptionId = id,
                NewPackageId = request.NewPackageId,
                ProrateBilling = request.ProrateBilling
            };

            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error upgrading subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while upgrading the subscription");
        }
    }

    /// <summary>
    /// Downgrade subscription to a lower tier package
    /// </summary>
    [HttpPost("{id}/downgrade")]
    [SwaggerOperation(Summary = "Downgrade subscription", Description = "Downgrades the subscription to a lower tier package, optionally at period end")]
    public async Task<IActionResult> DowngradeSubscription(Guid id, [FromBody] DowngradeSubscriptionRequest request)
    {
        try
        {
            var command = new DowngradeSubscriptionCommand
            {
                SubscriptionId = id,
                NewPackageId = request.NewPackageId,
                ApplyAtPeriodEnd = request.ApplyAtPeriodEnd
            };

            var result = await _mediator.Send(command);
            return HandleResult(result);
        }
        catch (BusinessException ex)
        {
            _logger.LogError(ex, "Error downgrading subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while downgrading the subscription");
        }
    }
}

public class CancelSubscriptionRequest
{
    public string? Reason { get; set; }
}

public class RenewSubscriptionRequest
{
    public int? AdditionalMonths { get; set; }
}

public class SuspendSubscriptionRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class ChangePackageRequest
{
    public Guid NewPackageId { get; set; }
}

public class UpgradeSubscriptionRequest
{
    public Guid NewPackageId { get; set; }
    public bool ProrateBilling { get; set; } = true;
}

public class DowngradeSubscriptionRequest
{
    public Guid NewPackageId { get; set; }
    public bool ApplyAtPeriodEnd { get; set; } = true;
}