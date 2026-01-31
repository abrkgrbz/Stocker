using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Stocker.API.Controllers.Base;
// using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Tenant.Dashboard;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.Application.Features.Tenant.Dashboard.Queries;
using Stocker.Application.Features.TenantRegistration.Queries.GetSetupWizard;

namespace Stocker.API.Controllers.Tenant;

[Route("api/tenant/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ApiController
{
    private readonly IMediator _mediator;
    // private readonly ICurrentUserService _currentUserService;
    // private readonly ICurrentTenantService _currentTenantService;

    public DashboardController(
        IMediator mediator)
    {
        _mediator = mediator;
        // _currentUserService = currentUserService;
        // _currentTenantService = currentTenantService;
    }

    [HttpGet("stats")]
    [ProducesResponseType(typeof(ApiResponse<DashboardStatsDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetDashboardStats()
    {
        var query = new GetDashboardStatsQuery
        {
            TenantId = Guid.NewGuid() // _currentTenantService.TenantId
        };
        
        var result = await _mediator.Send(query);
        
        return Ok(new ApiResponse<DashboardStatsDto>
        {
            Success = true,
            Data = result,
            Message = "Dashboard istatistikleri başarıyla yüklendi"
        });
    }

    [HttpGet("activities")]
    [ProducesResponseType(typeof(ApiResponse<List<ActivityDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetRecentActivities()
    {
        var query = new GetRecentActivitiesQuery
        {
            TenantId = Guid.NewGuid() // _currentTenantService.TenantId
        };
        
        var result = await _mediator.Send(query);
        
        return Ok(new ApiResponse<List<ActivityDto>>
        {
            Success = true,
            Data = result,
            Message = "Son aktiviteler başarıyla yüklendi"
        });
    }

    [HttpGet("notifications")]
    [ProducesResponseType(typeof(ApiResponse<List<NotificationDto>>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetNotifications()
    {
        var query = new GetNotificationsQuery
        {
            TenantId = Guid.NewGuid(), // _currentTenantService.TenantId
            UserId = Guid.NewGuid().ToString() // _currentUserService.UserId
        };
        
        var result = await _mediator.Send(query);
        
        return Ok(new ApiResponse<List<NotificationDto>>
        {
            Success = true,
            Data = result,
            Message = "Bildirimler başarıyla yüklendi"
        });
    }

    [HttpGet("charts/revenue")]
    [ProducesResponseType(typeof(ApiResponse<RevenueChartDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetRevenueChart([FromQuery] string period = "monthly")
    {
        var query = new GetRevenueChartQuery
        {
            TenantId = Guid.NewGuid(), // _currentTenantService.TenantId
            Period = period
        };
        
        var result = await _mediator.Send(query);
        
        return Ok(new ApiResponse<RevenueChartDto>
        {
            Success = true,
            Data = result,
            Message = "Grafik verisi başarıyla yüklendi"
        });
    }

    [HttpGet("summary")]
    [ProducesResponseType(typeof(ApiResponse<DashboardSummaryDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetDashboardSummary()
    {
        var query = new GetDashboardSummaryQuery
        {
            TenantId = Guid.NewGuid(), // _currentTenantService.TenantId
            UserId = Guid.NewGuid().ToString() // _currentUserService.UserId
        };
        
        var result = await _mediator.Send(query);
        
        return Ok(new ApiResponse<DashboardSummaryDto>
        {
            Success = true,
            Data = result,
            Message = "Dashboard özeti başarıyla yüklendi"
        });
    }

    [HttpGet("setup-wizard")]
    [ProducesResponseType(typeof(ApiResponse<TenantSetupWizardDto>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>), 500)]
    public async Task<IActionResult> GetSetupWizardStatus()
    {
        // TODO: Get TenantId from current tenant service
        var tenantId = Guid.NewGuid(); // _currentTenantService.TenantId
        
        var query = new GetSetupWizardQuery
        {
            // TenantId removed - each tenant has its own database
        };
        
        var result = await _mediator.Send(query);
        
        if (result.IsSuccess)
        {
            return Ok(new ApiResponse<TenantSetupWizardDto>
            {
                Success = true,
                Data = result.Value,
                Message = "Kurulum sihirbazı durumu başarıyla yüklendi"
            });
        }
        
        // If no wizard exists, it will be created automatically by GetSetupWizardQueryHandler
        return Ok(new ApiResponse<TenantSetupWizardDto>
        {
            Success = true,
            Data = result.Value,
            Message = "Kurulum sihirbazı oluşturuldu"
        });
    }
}