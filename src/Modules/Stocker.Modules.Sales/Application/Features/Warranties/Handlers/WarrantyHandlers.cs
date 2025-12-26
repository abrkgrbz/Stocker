using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Warranties.Commands;
using Stocker.Modules.Sales.Application.Features.Warranties.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;
using Stocker.SharedKernel.Interfaces;

namespace Stocker.Modules.Sales.Application.Features.Warranties.Handlers;

public class GetWarrantiesHandler : IRequestHandler<GetWarrantiesQuery, Result<PagedResult<WarrantyListDto>>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetWarrantiesHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<PagedResult<WarrantyListDto>>> Handle(GetWarrantiesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.Warranties
            .Include(w => w.Claims)
            .Where(w => w.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(w =>
                w.WarrantyNumber.ToLower().Contains(searchTerm) ||
                w.CustomerName.ToLower().Contains(searchTerm) ||
                w.ProductCode.ToLower().Contains(searchTerm) ||
                w.ProductName.ToLower().Contains(searchTerm) ||
                (w.SerialNumber != null && w.SerialNumber.ToLower().Contains(searchTerm)));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            if (Enum.TryParse<WarrantyStatus>(request.Status, true, out var status))
                query = query.Where(w => w.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(request.Type))
        {
            if (Enum.TryParse<WarrantyType>(request.Type, true, out var type))
                query = query.Where(w => w.Type == type);
        }

        if (!string.IsNullOrWhiteSpace(request.CoverageType))
        {
            if (Enum.TryParse<WarrantyCoverageType>(request.CoverageType, true, out var coverageType))
                query = query.Where(w => w.CoverageType == coverageType);
        }

        if (request.CustomerId.HasValue)
            query = query.Where(w => w.CustomerId == request.CustomerId.Value);

        if (request.ProductId.HasValue)
            query = query.Where(w => w.ProductId == request.ProductId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(w => w.StartDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(w => w.EndDate <= request.ToDate.Value);

        if (request.IsActive.HasValue)
            query = query.Where(w => w.IsActive == request.IsActive.Value);

        if (request.IsExpired.HasValue)
            query = query.Where(w => w.IsExpired == request.IsExpired.Value);

        query = request.SortBy?.ToLower() switch
        {
            "warrantynumber" => request.SortDescending
                ? query.OrderByDescending(w => w.WarrantyNumber)
                : query.OrderBy(w => w.WarrantyNumber),
            "customername" => request.SortDescending
                ? query.OrderByDescending(w => w.CustomerName)
                : query.OrderBy(w => w.CustomerName),
            "productname" => request.SortDescending
                ? query.OrderByDescending(w => w.ProductName)
                : query.OrderBy(w => w.ProductName),
            "enddate" => request.SortDescending
                ? query.OrderByDescending(w => w.EndDate)
                : query.OrderBy(w => w.EndDate),
            "status" => request.SortDescending
                ? query.OrderByDescending(w => w.Status)
                : query.OrderBy(w => w.Status),
            _ => request.SortDescending
                ? query.OrderByDescending(w => w.StartDate)
                : query.OrderBy(w => w.StartDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var result = new PagedResult<WarrantyListDto>(
            items.Select(WarrantyListDto.FromEntity),
            request.Page,
            request.PageSize,
            totalCount);

        return Result<PagedResult<WarrantyListDto>>.Success(result);
    }
}

public class GetWarrantyByIdHandler : IRequestHandler<GetWarrantyByIdQuery, Result<WarrantyDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetWarrantyByIdHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<WarrantyDto>> Handle(GetWarrantyByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var warranty = await _dbContext.Warranties
            .Include(w => w.Claims)
            .FirstOrDefaultAsync(w => w.Id == request.Id && w.TenantId == tenantId, cancellationToken);

        if (warranty == null)
            return Result<WarrantyDto>.Failure(Error.NotFound("Warranty", "Warranty not found"));

        return Result<WarrantyDto>.Success(WarrantyDto.FromEntity(warranty));
    }
}

public class LookupWarrantyHandler : IRequestHandler<LookupWarrantyQuery, Result<WarrantyDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public LookupWarrantyHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<WarrantyDto>> Handle(LookupWarrantyQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var query = _dbContext.Warranties
            .Include(w => w.Claims)
            .Where(w => w.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.SerialNumber))
            query = query.Where(w => w.SerialNumber != null && w.SerialNumber.ToLower() == request.SerialNumber.ToLower());
        else if (!string.IsNullOrWhiteSpace(request.WarrantyNumber))
            query = query.Where(w => w.WarrantyNumber.ToLower() == request.WarrantyNumber.ToLower());
        else if (!string.IsNullOrWhiteSpace(request.ProductCode) && !string.IsNullOrWhiteSpace(request.CustomerName))
            query = query.Where(w =>
                w.ProductCode.ToLower() == request.ProductCode.ToLower() &&
                w.CustomerName.ToLower().Contains(request.CustomerName.ToLower()));
        else
            return Result<WarrantyDto>.Failure(Error.Validation("Warranty.LookupRequired", "Please provide serial number, warranty number, or product code with customer name"));

        var warranty = await query.FirstOrDefaultAsync(cancellationToken);

        if (warranty == null)
            return Result<WarrantyDto>.Failure(Error.NotFound("Warranty", "Warranty not found"));

        return Result<WarrantyDto>.Success(WarrantyDto.FromEntity(warranty));
    }
}

public class GetWarrantyStatisticsHandler : IRequestHandler<GetWarrantyStatisticsQuery, Result<WarrantyStatisticsDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public GetWarrantyStatisticsHandler(SalesDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<Result<WarrantyStatisticsDto>> Handle(GetWarrantyStatisticsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");
        var now = DateTime.UtcNow;

        var query = _dbContext.Warranties
            .Include(w => w.Claims)
            .Where(w => w.TenantId == tenantId);

        if (request.FromDate.HasValue)
            query = query.Where(w => w.StartDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(w => w.EndDate <= request.ToDate.Value);

        var warranties = await query.ToListAsync(cancellationToken);
        var allClaims = warranties.SelectMany(w => w.Claims).ToList();

        var stats = new WarrantyStatisticsDto
        {
            TotalWarranties = warranties.Count,
            ActiveWarranties = warranties.Count(w => w.IsActive),
            ExpiredWarranties = warranties.Count(w => w.IsExpired),
            ExpiringWithin30Days = warranties.Count(w => w.IsActive && w.EndDate <= now.AddDays(30) && w.EndDate > now),
            ExpiringWithin90Days = warranties.Count(w => w.IsActive && w.EndDate <= now.AddDays(90) && w.EndDate > now),
            ExtendedWarranties = warranties.Count(w => w.IsExtended),
            TotalClaims = allClaims.Count,
            ApprovedClaims = allClaims.Count(c => c.Status == WarrantyClaimStatus.Approved || c.Status == WarrantyClaimStatus.Completed),
            PendingClaims = allClaims.Count(c => c.Status == WarrantyClaimStatus.Submitted || c.Status == WarrantyClaimStatus.UnderReview),
            TotalClaimedAmount = allClaims.Where(c => c.Status == WarrantyClaimStatus.Approved || c.Status == WarrantyClaimStatus.Completed).Sum(c => c.ApprovedAmount),
            AverageClaimAmount = allClaims.Count > 0 ? allClaims.Where(c => c.Status == WarrantyClaimStatus.Approved || c.Status == WarrantyClaimStatus.Completed).Average(c => c.ApprovedAmount) : 0,
            Currency = "TRY"
        };

        return Result<WarrantyStatisticsDto>.Success(stats);
    }
}

public class CreateWarrantyHandler : IRequestHandler<CreateWarrantyCommand, Result<WarrantyDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CreateWarrantyHandler> _logger;

    public CreateWarrantyHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<CreateWarrantyHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<WarrantyDto>> Handle(CreateWarrantyCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var warrantyNumber = await GenerateWarrantyNumberAsync(tenantId, cancellationToken);

        var warrantyResult = Warranty.Create(
            tenantId,
            warrantyNumber,
            request.ProductCode,
            request.ProductName,
            request.StartDate,
            request.EndDate,
            request.Type);

        if (!warrantyResult.IsSuccess)
            return Result<WarrantyDto>.Failure(warrantyResult.Error);

        var warranty = warrantyResult.Value;

        warranty.SetProduct(request.ProductId, request.SerialNumber, request.LotNumber);
        warranty.SetCustomer(request.CustomerId, request.CustomerName, request.CustomerEmail, request.CustomerPhone, request.CustomerAddress);
        warranty.SetCoverage(request.CoverageType, request.CoverageDescription, request.MaxClaimAmount, request.MaxClaimCount);

        if (!string.IsNullOrEmpty(request.Notes))
            warranty.SetNotes(request.Notes);

        await _dbContext.Warranties.AddAsync(warranty, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Warranty {WarrantyNumber} created for tenant {TenantId}", warrantyNumber, tenantId);

        var savedWarranty = await _dbContext.Warranties
            .Include(w => w.Claims)
            .FirstAsync(w => w.Id == warranty.Id, cancellationToken);

        return Result<WarrantyDto>.Success(WarrantyDto.FromEntity(savedWarranty));
    }

    private async Task<string> GenerateWarrantyNumberAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var prefix = $"WR{today:yyyyMMdd}";

        var lastWarranty = await _dbContext.Warranties
            .Where(w => w.TenantId == tenantId && w.WarrantyNumber.StartsWith(prefix))
            .OrderByDescending(w => w.WarrantyNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastWarranty != null)
        {
            var lastSequence = lastWarranty.WarrantyNumber.Substring(prefix.Length);
            if (int.TryParse(lastSequence, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}{sequence:D4}";
    }
}

public class RegisterWarrantyHandler : IRequestHandler<RegisterWarrantyCommand, Result<WarrantyDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<RegisterWarrantyHandler> _logger;

    public RegisterWarrantyHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<RegisterWarrantyHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<WarrantyDto>> Handle(RegisterWarrantyCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var warranty = await _dbContext.Warranties
            .Include(w => w.Claims)
            .FirstOrDefaultAsync(w => w.Id == request.Id && w.TenantId == tenantId, cancellationToken);

        if (warranty == null)
            return Result<WarrantyDto>.Failure(Error.NotFound("Warranty", "Warranty not found"));

        var result = warranty.Register(request.RegisteredBy);

        if (!result.IsSuccess)
            return Result<WarrantyDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Warranty {WarrantyId} registered", warranty.Id);

        return Result<WarrantyDto>.Success(WarrantyDto.FromEntity(warranty));
    }
}

public class ExtendWarrantyHandler : IRequestHandler<ExtendWarrantyCommand, Result<WarrantyDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<ExtendWarrantyHandler> _logger;

    public ExtendWarrantyHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<ExtendWarrantyHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<WarrantyDto>> Handle(ExtendWarrantyCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var warranty = await _dbContext.Warranties
            .Include(w => w.Claims)
            .FirstOrDefaultAsync(w => w.Id == request.Id && w.TenantId == tenantId, cancellationToken);

        if (warranty == null)
            return Result<WarrantyDto>.Failure(Error.NotFound("Warranty", "Warranty not found"));

        var result = warranty.Extend(request.AdditionalMonths, request.Price);

        if (!result.IsSuccess)
            return Result<WarrantyDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Warranty {WarrantyId} extended by {Months} months", warranty.Id, request.AdditionalMonths);

        return Result<WarrantyDto>.Success(WarrantyDto.FromEntity(warranty));
    }
}

public class CreateWarrantyClaimHandler : IRequestHandler<CreateWarrantyClaimCommand, Result<WarrantyClaimDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<CreateWarrantyClaimHandler> _logger;

    public CreateWarrantyClaimHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<CreateWarrantyClaimHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result<WarrantyClaimDto>> Handle(CreateWarrantyClaimCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var warranty = await _dbContext.Warranties
            .Include(w => w.Claims)
            .FirstOrDefaultAsync(w => w.Id == request.WarrantyId && w.TenantId == tenantId, cancellationToken);

        if (warranty == null)
            return Result<WarrantyClaimDto>.Failure(Error.NotFound("Warranty", "Warranty not found"));

        var claimNumber = await GenerateClaimNumberAsync(tenantId, cancellationToken);

        var claimResult = warranty.CreateClaim(
            tenantId,
            claimNumber,
            request.IssueDescription,
            request.ClaimType,
            request.EstimatedAmount);

        if (!claimResult.IsSuccess)
            return Result<WarrantyClaimDto>.Failure(claimResult.Error);

        var claim = claimResult.Value;

        if (!string.IsNullOrEmpty(request.FailureCode) || !string.IsNullOrEmpty(request.DiagnosticNotes))
            claim.SetDiagnostics(request.FailureCode, request.DiagnosticNotes);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Warranty claim {ClaimNumber} created for warranty {WarrantyId}", claimNumber, warranty.Id);

        return Result<WarrantyClaimDto>.Success(WarrantyClaimDto.FromEntity(claim));
    }

    private async Task<string> GenerateClaimNumberAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var today = DateTime.UtcNow;
        var prefix = $"WC{today:yyyyMMdd}";

        var lastClaim = await _dbContext.WarrantyClaims
            .Where(c => c.TenantId == tenantId && c.ClaimNumber.StartsWith(prefix))
            .OrderByDescending(c => c.ClaimNumber)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastClaim != null)
        {
            var lastSequence = lastClaim.ClaimNumber.Substring(prefix.Length);
            if (int.TryParse(lastSequence, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}{sequence:D4}";
    }
}

public class ApproveClaimHandler : IRequestHandler<ApproveClaimCommand, Result<WarrantyClaimDto>>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ApproveClaimHandler> _logger;

    public ApproveClaimHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<ApproveClaimHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<WarrantyClaimDto>> Handle(ApproveClaimCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var warranty = await _dbContext.Warranties
            .Include(w => w.Claims)
            .FirstOrDefaultAsync(w => w.Id == request.WarrantyId && w.TenantId == tenantId, cancellationToken);

        if (warranty == null)
            return Result<WarrantyClaimDto>.Failure(Error.NotFound("Warranty", "Warranty not found"));

        var claim = warranty.Claims.FirstOrDefault(c => c.Id == request.ClaimId);
        if (claim == null)
            return Result<WarrantyClaimDto>.Failure(Error.NotFound("WarrantyClaim", "Claim not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var result = claim.Approve(request.ApprovedAmount, request.ResolutionType, request.Resolution, userId);

        if (!result.IsSuccess)
            return Result<WarrantyClaimDto>.Failure(result.Error);

        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Warranty claim {ClaimId} approved with amount {Amount}", claim.Id, request.ApprovedAmount);

        return Result<WarrantyClaimDto>.Success(WarrantyClaimDto.FromEntity(claim));
    }
}

public class DeleteWarrantyHandler : IRequestHandler<DeleteWarrantyCommand, Result>
{
    private readonly SalesDbContext _dbContext;
    private readonly ITenantService _tenantService;
    private readonly ILogger<DeleteWarrantyHandler> _logger;

    public DeleteWarrantyHandler(
        SalesDbContext dbContext,
        ITenantService tenantService,
        ILogger<DeleteWarrantyHandler> logger)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteWarrantyCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId() ?? throw new InvalidOperationException("Tenant ID is required");

        var warranty = await _dbContext.Warranties
            .Include(w => w.Claims)
            .FirstOrDefaultAsync(w => w.Id == request.Id && w.TenantId == tenantId, cancellationToken);

        if (warranty == null)
            return Result.Failure(Error.NotFound("Warranty", "Warranty not found"));

        if (warranty.Claims.Any())
            return Result.Failure(Error.Conflict("Warranty", "Cannot delete warranty with claims"));

        if (warranty.Status != WarrantyStatus.Pending && warranty.Status != WarrantyStatus.Void)
            return Result.Failure(Error.Conflict("Warranty", "Only pending or void warranties can be deleted"));

        _dbContext.Warranties.Remove(warranty);
        await _dbContext.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Warranty {WarrantyId} deleted", warranty.Id);

        return Result.Success();
    }
}
