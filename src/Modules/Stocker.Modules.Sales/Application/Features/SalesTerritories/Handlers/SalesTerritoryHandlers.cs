using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesTerritories.Commands;
using Stocker.Modules.Sales.Application.Features.SalesTerritories.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesTerritories.Handlers;

#region Query Handlers

public class GetSalesTerritoriesHandler : IRequestHandler<GetSalesTerritoriesQuery, Result<PagedResult<SalesTerritoryListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesTerritoriesHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<SalesTerritoryListDto>>> Handle(GetSalesTerritoriesQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<SalesTerritory>().AsQueryable()
            .Include(t => t.Assignments)
            .Include(t => t.Customers)
            .Where(t => t.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(t =>
                t.TerritoryCode.ToLower().Contains(searchTerm) ||
                t.Name.ToLower().Contains(searchTerm) ||
                (t.Region != null && t.Region.ToLower().Contains(searchTerm)) ||
                (t.City != null && t.City.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(t => t.Status == request.Status.Value);

        if (request.TerritoryType.HasValue)
            query = query.Where(t => t.TerritoryType == request.TerritoryType.Value);

        if (request.ParentTerritoryId.HasValue)
            query = query.Where(t => t.ParentTerritoryId == request.ParentTerritoryId.Value);

        if (!string.IsNullOrWhiteSpace(request.Region))
            query = query.Where(t => t.Region == request.Region);

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(t => t.City == request.City);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "territorycode" => request.SortDescending ? query.OrderByDescending(t => t.TerritoryCode) : query.OrderBy(t => t.TerritoryCode),
            "name" => request.SortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name),
            "region" => request.SortDescending ? query.OrderByDescending(t => t.Region) : query.OrderBy(t => t.Region),
            "city" => request.SortDescending ? query.OrderByDescending(t => t.City) : query.OrderBy(t => t.City),
            "status" => request.SortDescending ? query.OrderByDescending(t => t.Status) : query.OrderBy(t => t.Status),
            _ => request.SortDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name)
        };

        var territories = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = territories.Select(SalesTerritoryListDto.FromEntity).ToList();

        return Result<PagedResult<SalesTerritoryListDto>>.Success(
            new PagedResult<SalesTerritoryListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class GetSalesTerritoryByIdHandler : IRequestHandler<GetSalesTerritoryByIdQuery, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesTerritoryByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(GetSalesTerritoryByIdQuery request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.Id, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class GetSalesTerritoryByCodeHandler : IRequestHandler<GetSalesTerritoryByCodeQuery, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesTerritoryByCodeHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(GetSalesTerritoryByCodeQuery request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetByCodeAsync(request.TerritoryCode, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class GetActiveTerritoriesHandler : IRequestHandler<GetActiveTerritoriesQuery, Result<IReadOnlyList<SalesTerritoryListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetActiveTerritoriesHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<SalesTerritoryListDto>>> Handle(GetActiveTerritoriesQuery request, CancellationToken cancellationToken)
    {
        var territories = await _unitOfWork.SalesTerritories.GetActiveTerritoriesAsync(cancellationToken);
        var items = territories.Select(SalesTerritoryListDto.FromEntity).ToList();

        return Result<IReadOnlyList<SalesTerritoryListDto>>.Success(items);
    }
}

public class GetTerritoriesByTypeHandler : IRequestHandler<GetTerritoriesByTypeQuery, Result<IReadOnlyList<SalesTerritoryListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetTerritoriesByTypeHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<SalesTerritoryListDto>>> Handle(GetTerritoriesByTypeQuery request, CancellationToken cancellationToken)
    {
        var territories = await _unitOfWork.SalesTerritories.GetByTypeAsync(request.TerritoryType, cancellationToken);
        var items = territories.Select(SalesTerritoryListDto.FromEntity).ToList();

        return Result<IReadOnlyList<SalesTerritoryListDto>>.Success(items);
    }
}

public class GetChildTerritoriesHandler : IRequestHandler<GetChildTerritoriesQuery, Result<IReadOnlyList<SalesTerritoryListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetChildTerritoriesHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<SalesTerritoryListDto>>> Handle(GetChildTerritoriesQuery request, CancellationToken cancellationToken)
    {
        var territories = await _unitOfWork.SalesTerritories.GetChildTerritoriesAsync(request.ParentTerritoryId, cancellationToken);
        var items = territories.Select(SalesTerritoryListDto.FromEntity).ToList();

        return Result<IReadOnlyList<SalesTerritoryListDto>>.Success(items);
    }
}

public class GetTerritoriesBySalesRepHandler : IRequestHandler<GetTerritoriesBySalesRepQuery, Result<IReadOnlyList<SalesTerritoryListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetTerritoriesBySalesRepHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<SalesTerritoryListDto>>> Handle(GetTerritoriesBySalesRepQuery request, CancellationToken cancellationToken)
    {
        var territories = await _unitOfWork.SalesTerritories.GetBySalesRepresentativeAsync(request.SalesRepId, cancellationToken);
        var items = territories.Select(SalesTerritoryListDto.FromEntity).ToList();

        return Result<IReadOnlyList<SalesTerritoryListDto>>.Success(items);
    }
}

public class GetTerritoryForCustomerHandler : IRequestHandler<GetTerritoryForCustomerQuery, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetTerritoryForCustomerHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(GetTerritoryForCustomerQuery request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetTerritoryForCustomerAsync(
            request.CustomerId,
            request.PostalCode,
            request.City,
            request.Region,
            cancellationToken);

        if (territory == null)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Müşteri için bölge bulunamadı."));

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class ValidateSalesAccessHandler : IRequestHandler<ValidateSalesAccessQuery, Result<bool>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ValidateSalesAccessHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(ValidateSalesAccessQuery request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<bool>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        var accessResult = territory.ValidateSalesAccess(request.SalesPersonId);

        return Result<bool>.Success(accessResult.IsSuccess);
    }
}

#endregion

#region Command Handlers

public class CreateSalesTerritoryHandler : IRequestHandler<CreateSalesTerritoryCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateSalesTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(CreateSalesTerritoryCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var territoryCode = await _unitOfWork.SalesTerritories.GenerateTerritoryCodeAsync(request.TerritoryType, cancellationToken);

        int hierarchyLevel = 0;
        if (request.ParentTerritoryId.HasValue)
        {
            var parent = await _unitOfWork.SalesTerritories.GetByIdAsync(request.ParentTerritoryId.Value, cancellationToken);
            if (parent != null)
                hierarchyLevel = parent.HierarchyLevel + 1;
        }

        var territoryResult = SalesTerritory.Create(
            tenantId,
            territoryCode,
            request.Name,
            request.TerritoryType,
            request.Description,
            request.ParentTerritoryId,
            hierarchyLevel);

        if (!territoryResult.IsSuccess)
            return Result<SalesTerritoryDto>.Failure(territoryResult.Error);

        var territory = territoryResult.Value!;

        territory.SetGeographicInfo(request.Country, request.Region, request.City, request.District);

        if (request.TerritoryManagerId.HasValue && !string.IsNullOrWhiteSpace(request.TerritoryManagerName))
            territory.AssignManager(request.TerritoryManagerId.Value, request.TerritoryManagerName);

        if (request.DefaultPriceListId.HasValue)
            territory.SetDefaultPriceList(request.DefaultPriceListId.Value);

        await _unitOfWork.Repository<SalesTerritory>().AddAsync(territory, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class UpdateSalesTerritoryHandler : IRequestHandler<UpdateSalesTerritoryCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdateSalesTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(UpdateSalesTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.Id, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        // Note: Name and Description are set at creation; only geographic info and manager can be updated
        territory.SetGeographicInfo(
            request.Country ?? territory.Country,
            request.Region ?? territory.Region,
            request.City ?? territory.City,
            request.District ?? territory.District);

        if (request.TerritoryManagerId.HasValue && !string.IsNullOrWhiteSpace(request.TerritoryManagerName))
            territory.AssignManager(request.TerritoryManagerId.Value, request.TerritoryManagerName);
        else if (!request.TerritoryManagerId.HasValue)
            territory.RemoveManager();

        if (request.DefaultPriceListId.HasValue)
            territory.SetDefaultPriceList(request.DefaultPriceListId.Value);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class ActivateTerritoryHandler : IRequestHandler<ActivateTerritoryCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ActivateTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(ActivateTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.Id, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        territory.Activate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class DeactivateTerritoryHandler : IRequestHandler<DeactivateTerritoryCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeactivateTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(DeactivateTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.Id, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        territory.Deactivate();

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class SuspendTerritoryHandler : IRequestHandler<SuspendTerritoryCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SuspendTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(SuspendTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.Id, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        territory.Suspend(request.Reason);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class AssignSalesRepHandler : IRequestHandler<AssignSalesRepCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AssignSalesRepHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(AssignSalesRepCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        var result = territory.AssignSalesRepresentative(
            request.SalesRepId,
            request.SalesRepName,
            request.Role,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.CommissionRate);

        if (!result.IsSuccess)
            return Result<SalesTerritoryDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class RemoveAssignmentHandler : IRequestHandler<RemoveAssignmentCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RemoveAssignmentHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(RemoveAssignmentCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        var result = territory.RemoveAssignment(request.AssignmentId);
        if (!result.IsSuccess)
            return Result<SalesTerritoryDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class AssignCustomerToTerritoryHandler : IRequestHandler<AssignCustomerToTerritoryCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AssignCustomerToTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(AssignCustomerToTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        var result = territory.AssignCustomer(
            request.CustomerId,
            request.CustomerName,
            request.PrimarySalesRepId,
            request.PrimarySalesRepName);

        if (!result.IsSuccess)
            return Result<SalesTerritoryDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class RemoveCustomerFromTerritoryHandler : IRequestHandler<RemoveCustomerFromTerritoryCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RemoveCustomerFromTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(RemoveCustomerFromTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        var result = territory.RemoveCustomer(request.CustomerId);
        if (!result.IsSuccess)
            return Result<SalesTerritoryDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class AddPostalCodeHandler : IRequestHandler<AddPostalCodeCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AddPostalCodeHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(AddPostalCodeCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        var result = territory.AddPostalCode(request.PostalCode, request.AreaName);
        if (!result.IsSuccess)
            return Result<SalesTerritoryDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class RemovePostalCodeHandler : IRequestHandler<RemovePostalCodeCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RemovePostalCodeHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(RemovePostalCodeCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        var result = territory.RemovePostalCode(request.PostalCode);
        if (!result.IsSuccess)
            return Result<SalesTerritoryDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class RecordPerformanceScoreHandler : IRequestHandler<RecordPerformanceScoreCommand, Result<SalesTerritoryDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RecordPerformanceScoreHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesTerritoryDto>> Handle(RecordPerformanceScoreCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.TerritoryId, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result<SalesTerritoryDto>.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        territory.RecordPerformanceScore(request.Score);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SalesTerritoryDto>.Success(SalesTerritoryDto.FromEntity(territory));
    }
}

public class DeleteSalesTerritoryHandler : IRequestHandler<DeleteSalesTerritoryCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeleteSalesTerritoryHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteSalesTerritoryCommand request, CancellationToken cancellationToken)
    {
        var territory = await _unitOfWork.SalesTerritories.GetWithDetailsAsync(request.Id, cancellationToken);

        if (territory == null || territory.TenantId != _unitOfWork.TenantId)
            return Result.Failure(Error.NotFound("SalesTerritory", "Bölge bulunamadı."));

        if (territory.Status == TerritoryStatus.Active)
            return Result.Failure(Error.Conflict("SalesTerritory", "Aktif bölge silinemez."));

        if (territory.Customers.Any())
            return Result.Failure(Error.Conflict("SalesTerritory", "Müşteri atanmış bölge silinemez."));

        _unitOfWork.Repository<SalesTerritory>().Remove(territory);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

#endregion
