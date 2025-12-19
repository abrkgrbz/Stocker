using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Logging;
using MediatR;
using Stocker.Application.Features.Modules.Queries.CalculateCustomPackagePrice;
using Stocker.SignalR.Constants;
using Stocker.SignalR.Models.Pricing;

namespace Stocker.SignalR.Hubs;

/// <summary>
/// Real-time pricing calculation hub for setup wizard
/// Allows anonymous access since users are not yet authenticated during setup
/// </summary>
[AllowAnonymous]
public class PricingHub : Hub
{
    private readonly ILogger<PricingHub> _logger;
    private readonly IMediator _mediator;

    public PricingHub(ILogger<PricingHub> logger, IMediator mediator)
    {
        _logger = logger;
        _mediator = mediator;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("PricingHub client connected: ConnectionId={ConnectionId}", Context.ConnectionId);

        await Clients.Caller.SendAsync(SignalREvents.Connected, new
        {
            connectionId = Context.ConnectionId,
            message = "Connected to pricing hub"
        });

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("PricingHub client disconnected: ConnectionId={ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// Calculate custom package price in real-time
    /// </summary>
    public async Task CalculatePrice(PriceCalculationRequest request)
    {
        try
        {
            _logger.LogDebug("Calculating price for ModuleCount={ModuleCount}, UserCount={UserCount}",
                request.SelectedModuleCodes?.Count ?? 0, request.UserCount);

            // Validate request
            if (request.SelectedModuleCodes == null || request.SelectedModuleCodes.Count == 0)
            {
                await Clients.Caller.SendAsync(SignalREvents.PriceCalculated, new PriceCalculationResponse
                {
                    Success = false,
                    Error = "En az bir modül seçmelisiniz"
                });
                return;
            }

            var query = new CalculateCustomPackagePriceQuery(
                request.SelectedModuleCodes,
                request.UserCount > 0 ? request.UserCount : 1,
                request.StoragePlanCode,
                request.SelectedAddOnCodes ?? new List<string>());

            var result = await _mediator.Send(query);

            if (result.IsSuccess)
            {
                await Clients.Caller.SendAsync(SignalREvents.PriceCalculated, new PriceCalculationResponse
                {
                    Success = true,
                    Data = result.Value
                });
            }
            else
            {
                await Clients.Caller.SendAsync(SignalREvents.PriceCalculated, new PriceCalculationResponse
                {
                    Success = false,
                    Error = result.Error?.Description ?? "Fiyat hesaplanamadı"
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating price");
            await Clients.Caller.SendAsync(SignalREvents.PriceCalculated, new PriceCalculationResponse
            {
                Success = false,
                Error = "Fiyat hesaplanırken bir hata oluştu"
            });
        }
    }
}
