using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Features.Subscriptions.Commands.CreateSubscription;
using Stocker.Application.Features.Subscriptions.Commands.UpdateSubscription;
using Stocker.Application.Features.Subscriptions.Commands.CancelSubscription;
using Stocker.Application.Features.Subscriptions.Commands.RenewSubscription;
using Stocker.Application.Features.Subscriptions.Queries.GetSubscriptions;
using Stocker.Application.Features.Subscriptions.Queries.GetSubscriptionById;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[Authorize]
[Route("api/master/[controller]")]
[SwaggerTag("Subscription Management - Manage tenant subscriptions and billing")]
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
        catch (Exception ex)
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
        catch (Exception ex)
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
        catch (Exception ex)
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
        catch (Exception ex)
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
        catch (Exception ex)
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
        catch (Exception ex)
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
            // TODO: Implement SuspendSubscriptionCommand
            throw new NotImplementedException();
        }
        catch (Exception ex)
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
            // TODO: Implement ReactivateSubscriptionCommand
            throw new NotImplementedException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reactivating subscription {SubscriptionId}", id);
            return StatusCode(500, "An error occurred while reactivating the subscription");
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