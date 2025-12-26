using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.ServiceOrders.Commands;
using Stocker.Modules.Sales.Application.Features.ServiceOrders.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Application.Features.ServiceOrders.Handlers;

public class GetServiceOrdersHandler : IRequestHandler<GetServiceOrdersQuery, Result<PagedResult<ServiceOrderListDto>>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetServiceOrdersHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<PagedResult<ServiceOrderListDto>>> Handle(GetServiceOrdersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.ServiceOrders
            .Where(so => so.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(so =>
                so.ServiceOrderNumber.ToLower().Contains(searchTerm) ||
                so.CustomerName.ToLower().Contains(searchTerm) ||
                (so.ProductName != null && so.ProductName.ToLower().Contains(searchTerm)) ||
                (so.SerialNumber != null && so.SerialNumber.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<ServiceOrderStatus>(request.Status, true, out var status))
                query = query.Where(so => so.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.Type))
        {
            if (Enum.TryParse<ServiceOrderType>(request.Type, true, out var type))
                query = query.Where(so => so.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(request.Priority))
        {
            if (Enum.TryParse<ServiceOrderPriority>(request.Priority, true, out var priority))
                query = query.Where(so => so.Priority == priority);
        }

        if (request.CustomerId.HasValue)
            query = query.Where(so => so.CustomerId == request.CustomerId.Value);

        if (request.TechnicianId.HasValue)
            query = query.Where(so => so.TechnicianId == request.TechnicianId.Value);

        if (request.WarrantyId.HasValue)
            query = query.Where(so => so.WarrantyId == request.WarrantyId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(so => so.OrderDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(so => so.OrderDate <= request.ToDate.Value);

        if (request.IsCoveredByWarranty.HasValue)
            query = query.Where(so => so.IsCoveredByWarranty == request.IsCoveredByWarranty.Value);

        if (request.IsBillable.HasValue)
            query = query.Where(so => so.IsBillable == request.IsBillable.Value);

        query = request.SortBy?.ToLower() switch
        {
            "serviceordernumber" => request.SortDescending
                ? query.OrderByDescending(so => so.ServiceOrderNumber)
                : query.OrderBy(so => so.ServiceOrderNumber),
            "customername" => request.SortDescending
                ? query.OrderByDescending(so => so.CustomerName)
                : query.OrderBy(so => so.CustomerName),
            "priority" => request.SortDescending
                ? query.OrderByDescending(so => so.Priority)
                : query.OrderBy(so => so.Priority),
            "status" => request.SortDescending
                ? query.OrderByDescending(so => so.Status)
                : query.OrderBy(so => so.Status),
            "scheduleddate" => request.SortDescending
                ? query.OrderByDescending(so => so.ScheduledDate)
                : query.OrderBy(so => so.ScheduledDate),
            _ => request.SortDescending
                ? query.OrderByDescending(so => so.OrderDate)
                : query.OrderBy(so => so.OrderDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PagedResult<ServiceOrderListDto>(
            items.Select(ServiceOrderListDto.FromEntity),
            request.Page,
            request.PageSize,
            totalCount);

        return Result<PagedResult<ServiceOrderListDto>>.Success(result);
    }
}

public class GetServiceOrderByIdHandler : IRequestHandler<GetServiceOrderByIdQuery, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetServiceOrderByIdHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<ServiceOrderDto>> Handle(GetServiceOrderByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var serviceOrder = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (serviceOrder == null)
            return Result<ServiceOrderDto>.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(serviceOrder));
    }
}

public class GetServiceOrderStatisticsHandler : IRequestHandler<GetServiceOrderStatisticsQuery, Result<ServiceOrderStatisticsDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetServiceOrderStatisticsHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<ServiceOrderStatisticsDto>> Handle(GetServiceOrderStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.ServiceOrders
            .Where(so => so.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(so => so.OrderDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(so => so.OrderDate <= request.ToDate.Value);

        var orders = await query.ToListAsync(cancellationToken);

        var completedWithRating = orders.Where(o => o.CustomerRating.HasValue).ToList();

        var stats = new ServiceOrderStatisticsDto
        {
            TotalOrders = orders.Count,
            OpenOrders = orders.Count(o => o.Status == ServiceOrderStatus.Open),
            AssignedOrders = orders.Count(o => o.Status == ServiceOrderStatus.Assigned),
            ScheduledOrders = orders.Count(o => o.Status == ServiceOrderStatus.Scheduled),
            InProgressOrders = orders.Count(o => o.Status == ServiceOrderStatus.InProgress),
            CompletedOrders = orders.Count(o => o.Status == ServiceOrderStatus.Completed),
            CancelledOrders = orders.Count(o => o.Status == ServiceOrderStatus.Cancelled),
            WarrantyCoveredOrders = orders.Count(o => o.IsCoveredByWarranty),
            TotalRevenue = orders.Where(o => o.Status == ServiceOrderStatus.Completed && o.IsBillable).Sum(o => o.TotalAmount),
            AverageRating = completedWithRating.Count > 0 ? (decimal)completedWithRating.Average(o => o.CustomerRating!.Value) : 0,
            Currency = "TRY"
        };

        return Result<ServiceOrderStatisticsDto>.Success(stats);
    }
}

public class CreateServiceOrderHandler : IRequestHandler<CreateServiceOrderCommand, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateServiceOrderHandler> _logger;

    public CreateServiceOrderHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<CreateServiceOrderHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<ServiceOrderDto>> Handle(CreateServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var serviceOrderNumber = await GenerateServiceOrderNumberAsync(tenantId, cancellationToken);

        var orderResult = ServiceOrder.Create(
            tenantId,
            serviceOrderNumber,
            request.CustomerId,
            request.CustomerName,
            request.Type);

        if (!orderResult.IsSuccess)
            return Result<ServiceOrderDto>.Failure(orderResult.Error);

        var order = orderResult.Value;

        order.SetPriority(request.Priority);
        order.SetCustomerContact(request.CustomerEmail, request.CustomerPhone, request.CustomerAddress);
        order.SetProduct(request.ProductId, request.ProductCode, request.ProductName, request.SerialNumber, request.AssetTag);
        order.SetLocation(request.Location, request.ServiceAddress);

        if (!string.IsNullOrEmpty(request.ReportedIssue))
            order.SetIssue(request.ReportedIssue, request.IssueCategory);

        var userId = _currentUserService.UserId;
        if (userId.HasValue)
            order.SetCreator(userId.Value, _currentUserService.UserName);

        await _dbContext.ServiceOrders.AddAsync(order, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service order {ServiceOrderNumber} created for tenant {TenantId}", serviceOrderNumber, tenantId);

        var savedOrder = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstAsync(so => so.Id == order.Id, cancellationToken);

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(savedOrder));
    }

    private async Task<string> GenerateServiceOrderNumberAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var prefix = $"SO{today:yyyyMMdd}";

        var lastOrder = await _dbContext.ServiceOrders
            .Where(so => so.TenantId == tenantId && so.ServiceOrderNumber.StartsWith(prefix))
            .OrderByDescending(so => so.ServiceOrderNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastOrder != null)
        {
            var lastSequence = lastOrder.ServiceOrderNumber.Substring(prefix.Length);
            if (int.TryParse(lastSequence, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}{sequence:D4}";
    }
}

public class ScheduleServiceOrderHandler : IRequestHandler<ScheduleServiceOrderCommand, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ScheduleServiceOrderHandler> _logger;

    public ScheduleServiceOrderHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<ScheduleServiceOrderHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<ServiceOrderDto>> Handle(ScheduleServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var order = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<ServiceOrderDto>.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        var result = order.Schedule(request.ScheduledDate, request.EstimatedDuration, request.EndDate);

        if (!result.IsSuccess)
            return Result<ServiceOrderDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service order {ServiceOrderId} scheduled for {ScheduledDate}", order.Id, request.ScheduledDate);

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(order));
    }
}

public class AssignTechnicianHandler : IRequestHandler<AssignTechnicianCommand, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<AssignTechnicianHandler> _logger;

    public AssignTechnicianHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<AssignTechnicianHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<ServiceOrderDto>> Handle(AssignTechnicianCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var order = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<ServiceOrderDto>.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        var result = order.AssignTechnician(request.TechnicianId, request.TechnicianName);

        if (!result.IsSuccess)
            return Result<ServiceOrderDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Technician {TechnicianId} assigned to service order {ServiceOrderId}", request.TechnicianId, order.Id);

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(order));
    }
}

public class StartServiceOrderHandler : IRequestHandler<StartServiceOrderCommand, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<StartServiceOrderHandler> _logger;

    public StartServiceOrderHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<StartServiceOrderHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<ServiceOrderDto>> Handle(StartServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var order = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<ServiceOrderDto>.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        var result = order.StartService();

        if (!result.IsSuccess)
            return Result<ServiceOrderDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service order {ServiceOrderId} started", order.Id);

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(order));
    }
}

public class CompleteServiceOrderHandler : IRequestHandler<CompleteServiceOrderCommand, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CompleteServiceOrderHandler> _logger;

    public CompleteServiceOrderHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<CompleteServiceOrderHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<ServiceOrderDto>> Handle(CompleteServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var order = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<ServiceOrderDto>.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        var result = order.CompleteService(request.CompletionNotes);

        if (!result.IsSuccess)
            return Result<ServiceOrderDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service order {ServiceOrderId} completed", order.Id);

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(order));
    }
}

public class CancelServiceOrderHandler : IRequestHandler<CancelServiceOrderCommand, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CancelServiceOrderHandler> _logger;

    public CancelServiceOrderHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<CancelServiceOrderHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<ServiceOrderDto>> Handle(CancelServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var order = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<ServiceOrderDto>.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        var result = order.Cancel(request.Reason);

        if (!result.IsSuccess)
            return Result<ServiceOrderDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service order {ServiceOrderId} cancelled", order.Id);

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(order));
    }
}

public class RecordFeedbackHandler : IRequestHandler<RecordFeedbackCommand, Result<ServiceOrderDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<RecordFeedbackHandler> _logger;

    public RecordFeedbackHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<RecordFeedbackHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<ServiceOrderDto>> Handle(RecordFeedbackCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var order = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result<ServiceOrderDto>.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        var result = order.RecordFeedback(request.Rating, request.Feedback);

        if (!result.IsSuccess)
            return Result<ServiceOrderDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Feedback recorded for service order {ServiceOrderId}: {Rating} stars", order.Id, request.Rating);

        return Result<ServiceOrderDto>.Success(ServiceOrderDto.FromEntity(order));
    }
}

public class DeleteServiceOrderHandler : IRequestHandler<DeleteServiceOrderCommand, Result>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<DeleteServiceOrderHandler> _logger;

    public DeleteServiceOrderHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<DeleteServiceOrderHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteServiceOrderCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var order = await _dbContext.ServiceOrders
            .Include(so => so.Items)
            .Include(so => so.Notes)
            .FirstOrDefaultAsync(so => so.Id == request.Id && so.TenantId == tenantId, cancellationToken);

        if (order == null)
            return Result.Failure(Error.NotFound("ServiceOrder", "Service order not found"));

        if (order.Status != ServiceOrderStatus.Open && order.Status != ServiceOrderStatus.Cancelled)
            return Result.Failure(Error.Conflict("ServiceOrder", "Only open or cancelled service orders can be deleted"));

        _dbContext.ServiceOrders.Remove(order);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Service order {ServiceOrderId} deleted", order.Id);

        return Result.Success();
    }
}
