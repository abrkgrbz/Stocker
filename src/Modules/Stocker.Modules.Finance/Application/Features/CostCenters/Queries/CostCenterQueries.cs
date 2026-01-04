using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Finance.Application.DTOs;
using Stocker.Modules.Finance.Application.Features.CostCenters.Commands;
using Stocker.Modules.Finance.Domain.Entities;
using Stocker.Modules.Finance.Interfaces;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.CostCenters.Queries;

#region Get Cost Centers Query (Paginated)

/// <summary>
/// Query to get paginated cost centers
/// </summary>
public class GetCostCentersQuery : IRequest<Result<PagedResult<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CostCenterFilterDto? Filter { get; set; }
}

/// <summary>
/// Handler for GetCostCentersQuery
/// </summary>
public class GetCostCentersQueryHandler : IRequestHandler<GetCostCentersQuery, Result<PagedResult<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCostCentersQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CostCenterSummaryDto>>> Handle(GetCostCentersQuery request, CancellationToken cancellationToken)
    {
        var query = _unitOfWork.CostCenters.AsQueryable();

        // Apply filters
        if (request.Filter != null)
        {
            if (!string.IsNullOrEmpty(request.Filter.SearchTerm))
            {
                var searchTerm = request.Filter.SearchTerm.ToLower();
                query = query.Where(c =>
                    c.Code.ToLower().Contains(searchTerm) ||
                    c.Name.ToLower().Contains(searchTerm) ||
                    (c.Description != null && c.Description.ToLower().Contains(searchTerm)));
            }

            if (request.Filter.Type.HasValue)
            {
                query = query.Where(c => c.Type == request.Filter.Type.Value);
            }

            if (request.Filter.Category.HasValue)
            {
                query = query.Where(c => c.Category == request.Filter.Category.Value);
            }

            if (request.Filter.ParentId.HasValue)
            {
                query = query.Where(c => c.ParentId == request.Filter.ParentId.Value);
            }

            if (request.Filter.DepartmentId.HasValue)
            {
                query = query.Where(c => c.DepartmentId == request.Filter.DepartmentId.Value);
            }

            if (request.Filter.BranchId.HasValue)
            {
                query = query.Where(c => c.BranchId == request.Filter.BranchId.Value);
            }

            if (request.Filter.IsActive.HasValue)
            {
                query = query.Where(c => c.IsActive == request.Filter.IsActive.Value);
            }

            if (request.Filter.IsFrozen.HasValue)
            {
                query = query.Where(c => c.IsFrozen == request.Filter.IsFrozen.Value);
            }
        }

        // Get total count
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply sorting
        var sortBy = request.Filter?.SortBy ?? "Code";
        var sortDesc = request.Filter?.SortDescending ?? false;

        query = sortBy.ToLower() switch
        {
            "name" => sortDesc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "type" => sortDesc ? query.OrderByDescending(c => c.Type) : query.OrderBy(c => c.Type),
            "category" => sortDesc ? query.OrderByDescending(c => c.Category) : query.OrderBy(c => c.Category),
            "level" => sortDesc ? query.OrderByDescending(c => c.Level) : query.OrderBy(c => c.Level),
            "sortorder" => sortDesc ? query.OrderByDescending(c => c.SortOrder) : query.OrderBy(c => c.SortOrder),
            _ => sortDesc ? query.OrderByDescending(c => c.Code) : query.OrderBy(c => c.Code)
        };

        // Apply pagination
        var pageNumber = request.Filter?.PageNumber ?? 1;
        var pageSize = request.Filter?.PageSize ?? 20;
        var costCenters = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        // Filter for over budget if specified
        var dtos = costCenters.Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c)).ToList();

        if (request.Filter?.IsOverBudget == true)
        {
            dtos = dtos.Where(d => d.IsOverBudget).ToList();
        }
        else if (request.Filter?.IsOverBudget == false)
        {
            dtos = dtos.Where(d => !d.IsOverBudget).ToList();
        }

        return Result<PagedResult<CostCenterSummaryDto>>.Success(
            new PagedResult<CostCenterSummaryDto>(dtos, pageNumber, pageSize, totalCount));
    }
}

#endregion

#region Get Cost Center By Id Query

/// <summary>
/// Query to get a cost center by ID
/// </summary>
public class GetCostCenterByIdQuery : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetCostCenterByIdQuery
/// </summary>
public class GetCostCenterByIdQueryHandler : IRequestHandler<GetCostCenterByIdQuery, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCostCenterByIdQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(GetCostCenterByIdQuery request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByIdAsync(request.Id, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"ID {request.Id} ile masraf merkezi bulunamadı"));
        }

        // Get parent for name mapping
        CostCenter? parent = null;
        if (costCenter.ParentId.HasValue)
        {
            parent = await _unitOfWork.CostCenters.GetByIdAsync(costCenter.ParentId.Value, cancellationToken);
        }

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter, parent);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Get Active Cost Centers Query

/// <summary>
/// Query to get all active cost centers
/// </summary>
public class GetActiveCostCentersQuery : IRequest<Result<List<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CostCenterType? Type { get; set; }
    public CostCenterCategory? Category { get; set; }
}

/// <summary>
/// Handler for GetActiveCostCentersQuery
/// </summary>
public class GetActiveCostCentersQueryHandler : IRequestHandler<GetActiveCostCentersQuery, Result<List<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetActiveCostCentersQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterSummaryDto>>> Handle(GetActiveCostCentersQuery request, CancellationToken cancellationToken)
    {
        var costCenters = await _unitOfWork.CostCenters.GetActiveAsync(cancellationToken);

        var dtos = costCenters
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c))
            .ToList();

        return Result<List<CostCenterSummaryDto>>.Success(dtos);
    }
}

#endregion

#region Get Cost Centers By Type Query

/// <summary>
/// Query to get cost centers by type
/// </summary>
public class GetCostCentersByTypeQuery : IRequest<Result<List<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CostCenterType Type { get; set; }
}

/// <summary>
/// Handler for GetCostCentersByTypeQuery
/// </summary>
public class GetCostCentersByTypeQueryHandler : IRequestHandler<GetCostCentersByTypeQuery, Result<List<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCostCentersByTypeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterSummaryDto>>> Handle(GetCostCentersByTypeQuery request, CancellationToken cancellationToken)
    {
        var costCenters = await _unitOfWork.CostCenters.GetByTypeAsync(request.Type, cancellationToken);

        var dtos = costCenters
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c))
            .ToList();

        return Result<List<CostCenterSummaryDto>>.Success(dtos);
    }
}

#endregion

#region Get Cost Centers By Category Query

/// <summary>
/// Query to get cost centers by category
/// </summary>
public class GetCostCentersByCategoryQuery : IRequest<Result<List<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public CostCenterCategory Category { get; set; }
}

/// <summary>
/// Handler for GetCostCentersByCategoryQuery
/// </summary>
public class GetCostCentersByCategoryQueryHandler : IRequestHandler<GetCostCentersByCategoryQuery, Result<List<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCostCentersByCategoryQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterSummaryDto>>> Handle(GetCostCentersByCategoryQuery request, CancellationToken cancellationToken)
    {
        var costCenters = await _unitOfWork.CostCenters.GetByCategoryAsync(request.Category, cancellationToken);

        var dtos = costCenters
            .OrderBy(c => c.Level)
            .ThenBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c))
            .ToList();

        return Result<List<CostCenterSummaryDto>>.Success(dtos);
    }
}

#endregion

#region Get Child Cost Centers Query

/// <summary>
/// Query to get child cost centers of a parent
/// </summary>
public class GetChildCostCentersQuery : IRequest<Result<List<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int ParentId { get; set; }
    public bool ActiveOnly { get; set; }
    public bool Recursive { get; set; }
}

/// <summary>
/// Handler for GetChildCostCentersQuery
/// </summary>
public class GetChildCostCentersQueryHandler : IRequestHandler<GetChildCostCentersQuery, Result<List<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetChildCostCentersQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterSummaryDto>>> Handle(GetChildCostCentersQuery request, CancellationToken cancellationToken)
    {
        // Verify parent exists
        var parent = await _unitOfWork.CostCenters.GetByIdAsync(request.ParentId, cancellationToken);
        if (parent == null)
        {
            return Result<List<CostCenterSummaryDto>>.Failure(
                Error.NotFound("CostCenter", $"ID {request.ParentId} ile üst masraf merkezi bulunamadı"));
        }

        var costCenters = await _unitOfWork.CostCenters.GetChildrenAsync(request.ParentId, cancellationToken);

        var dtos = costCenters
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c, parent))
            .ToList();

        return Result<List<CostCenterSummaryDto>>.Success(dtos);
    }
}

#endregion

#region Get Root Cost Centers Query

/// <summary>
/// Query to get root (top-level) cost centers
/// </summary>
public class GetRootCostCentersQuery : IRequest<Result<List<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetRootCostCentersQuery
/// </summary>
public class GetRootCostCentersQueryHandler : IRequestHandler<GetRootCostCentersQuery, Result<List<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetRootCostCentersQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterSummaryDto>>> Handle(GetRootCostCentersQuery request, CancellationToken cancellationToken)
    {
        var costCenters = await _unitOfWork.CostCenters.GetRootCostCentersAsync(cancellationToken);

        var dtos = costCenters
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c))
            .ToList();

        return Result<List<CostCenterSummaryDto>>.Success(dtos);
    }
}

#endregion

#region Get Cost Center Hierarchy Query

/// <summary>
/// Query to get cost center hierarchy (tree structure)
/// </summary>
public class GetCostCenterHierarchyQuery : IRequest<Result<List<CostCenterHierarchyDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int? RootId { get; set; }
}

/// <summary>
/// DTO for cost center hierarchy
/// </summary>
public class CostCenterHierarchyDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public CostCenterType Type { get; set; }
    public string TypeName { get; set; } = string.Empty;
    public int Level { get; set; }
    public bool IsActive { get; set; }
    public bool IsFrozen { get; set; }
    public decimal? AnnualBudgetAmount { get; set; }
    public decimal SpentAmount { get; set; }
    public List<CostCenterHierarchyDto> Children { get; set; } = new();
}

/// <summary>
/// Handler for GetCostCenterHierarchyQuery
/// </summary>
public class GetCostCenterHierarchyQueryHandler : IRequestHandler<GetCostCenterHierarchyQuery, Result<List<CostCenterHierarchyDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCostCenterHierarchyQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterHierarchyDto>>> Handle(GetCostCenterHierarchyQuery request, CancellationToken cancellationToken)
    {
        var allCostCenters = await _unitOfWork.CostCenters.GetAllAsync(cancellationToken);
        var lookup = allCostCenters.ToDictionary(c => c.Id);

        List<CostCenter> rootCenters;
        if (request.RootId.HasValue)
        {
            if (!lookup.TryGetValue(request.RootId.Value, out var root))
            {
                return Result<List<CostCenterHierarchyDto>>.Failure(
                    Error.NotFound("CostCenter", $"ID {request.RootId} ile masraf merkezi bulunamadı"));
            }
            rootCenters = new List<CostCenter> { root };
        }
        else
        {
            rootCenters = allCostCenters.Where(c => !c.ParentId.HasValue).ToList();
        }

        var hierarchy = rootCenters
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => BuildHierarchy(c, allCostCenters))
            .ToList();

        return Result<List<CostCenterHierarchyDto>>.Success(hierarchy);
    }

    private static CostCenterHierarchyDto BuildHierarchy(CostCenter costCenter, IEnumerable<CostCenter> allCostCenters)
    {
        var children = allCostCenters
            .Where(c => c.ParentId == costCenter.Id)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => BuildHierarchy(c, allCostCenters))
            .ToList();

        return new CostCenterHierarchyDto
        {
            Id = costCenter.Id,
            Code = costCenter.Code,
            Name = costCenter.Name,
            Type = costCenter.Type,
            TypeName = GetTypeName(costCenter.Type),
            Level = costCenter.Level,
            IsActive = costCenter.IsActive,
            IsFrozen = costCenter.IsFrozen,
            AnnualBudgetAmount = costCenter.AnnualBudget?.Amount,
            SpentAmount = costCenter.SpentAmount.Amount,
            Children = children
        };
    }

    private static string GetTypeName(CostCenterType type)
    {
        return type switch
        {
            CostCenterType.Main => "Ana Merkez",
            CostCenterType.Department => "Departman",
            CostCenterType.Branch => "Şube",
            CostCenterType.Project => "Proje",
            CostCenterType.Production => "Üretim",
            CostCenterType.Service => "Hizmet",
            CostCenterType.Auxiliary => "Yardımcı",
            CostCenterType.Temporary => "Geçici",
            _ => type.ToString()
        };
    }
}

#endregion

#region Get Over Budget Cost Centers Query

/// <summary>
/// Query to get cost centers that are over budget
/// </summary>
public class GetOverBudgetCostCentersQuery : IRequest<Result<List<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetOverBudgetCostCentersQuery
/// </summary>
public class GetOverBudgetCostCentersQueryHandler : IRequestHandler<GetOverBudgetCostCentersQuery, Result<List<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetOverBudgetCostCentersQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterSummaryDto>>> Handle(GetOverBudgetCostCentersQuery request, CancellationToken cancellationToken)
    {
        var costCenters = await _unitOfWork.CostCenters.GetActiveAsync(cancellationToken);

        var overBudgetDtos = costCenters
            .Where(c => c.IsOverBudget())
            .OrderByDescending(c => c.GetBudgetUsagePercentage())
            .Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c))
            .ToList();

        return Result<List<CostCenterSummaryDto>>.Success(overBudgetDtos);
    }
}

#endregion

#region Get Budget Warning Cost Centers Query

/// <summary>
/// Query to get cost centers with budget warnings
/// </summary>
public class GetBudgetWarningCostCentersQuery : IRequest<Result<List<CostCenterSummaryDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
}

/// <summary>
/// Handler for GetBudgetWarningCostCentersQuery
/// </summary>
public class GetBudgetWarningCostCentersQueryHandler : IRequestHandler<GetBudgetWarningCostCentersQuery, Result<List<CostCenterSummaryDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetBudgetWarningCostCentersQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterSummaryDto>>> Handle(GetBudgetWarningCostCentersQuery request, CancellationToken cancellationToken)
    {
        var costCenters = await _unitOfWork.CostCenters.GetActiveAsync(cancellationToken);

        var warningDtos = costCenters
            .Where(c => c.IsBudgetWarning())
            .OrderByDescending(c => c.GetBudgetUsagePercentage())
            .Select(c => CreateCostCenterCommandHandler.MapToSummaryDto(c))
            .ToList();

        return Result<List<CostCenterSummaryDto>>.Success(warningDtos);
    }
}

#endregion

#region Get Cost Center By Code Query

/// <summary>
/// Query to get a cost center by code
/// </summary>
public class GetCostCenterByCodeQuery : IRequest<Result<CostCenterDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public string Code { get; set; } = string.Empty;
}

/// <summary>
/// Handler for GetCostCenterByCodeQuery
/// </summary>
public class GetCostCenterByCodeQueryHandler : IRequestHandler<GetCostCenterByCodeQuery, Result<CostCenterDto>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCostCenterByCodeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CostCenterDto>> Handle(GetCostCenterByCodeQuery request, CancellationToken cancellationToken)
    {
        var costCenter = await _unitOfWork.CostCenters.GetByCodeAsync(request.Code, cancellationToken);
        if (costCenter == null)
        {
            return Result<CostCenterDto>.Failure(
                Error.NotFound("CostCenter", $"'{request.Code}' kodlu masraf merkezi bulunamadı"));
        }

        // Get parent for name mapping
        CostCenter? parent = null;
        if (costCenter.ParentId.HasValue)
        {
            parent = await _unitOfWork.CostCenters.GetByIdAsync(costCenter.ParentId.Value, cancellationToken);
        }

        var dto = CreateCostCenterCommandHandler.MapToDto(costCenter, parent);
        return Result<CostCenterDto>.Success(dto);
    }
}

#endregion

#region Get Cost Center Tree Query

/// <summary>
/// Query to get cost center tree structure
/// </summary>
public class GetCostCenterTreeQuery : IRequest<Result<List<CostCenterTreeNodeDto>>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public int? RootId { get; set; }
    public bool ActiveOnly { get; set; }
    public int? MaxDepth { get; set; }
}

/// <summary>
/// Handler for GetCostCenterTreeQuery
/// </summary>
public class GetCostCenterTreeQueryHandler : IRequestHandler<GetCostCenterTreeQuery, Result<List<CostCenterTreeNodeDto>>>
{
    private readonly IFinanceUnitOfWork _unitOfWork;

    public GetCostCenterTreeQueryHandler(IFinanceUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CostCenterTreeNodeDto>>> Handle(GetCostCenterTreeQuery request, CancellationToken cancellationToken)
    {
        var allCostCenters = await _unitOfWork.CostCenters.GetAllAsync(cancellationToken);

        if (request.ActiveOnly)
        {
            allCostCenters = allCostCenters.Where(c => c.IsActive).ToList();
        }

        List<CostCenter> rootCenters;
        if (request.RootId.HasValue)
        {
            var root = allCostCenters.FirstOrDefault(c => c.Id == request.RootId.Value);
            if (root == null)
            {
                return Result<List<CostCenterTreeNodeDto>>.Failure(
                    Error.NotFound("CostCenter", $"ID {request.RootId} ile masraf merkezi bulunamadı"));
            }
            rootCenters = new List<CostCenter> { root };
        }
        else
        {
            rootCenters = allCostCenters.Where(c => !c.ParentId.HasValue).ToList();
        }

        var tree = rootCenters
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => BuildTreeNode(c, allCostCenters))
            .ToList();

        return Result<List<CostCenterTreeNodeDto>>.Success(tree);
    }

    private static CostCenterTreeNodeDto BuildTreeNode(CostCenter costCenter, IEnumerable<CostCenter> allCostCenters)
    {
        var children = allCostCenters
            .Where(c => c.ParentId == costCenter.Id)
            .OrderBy(c => c.SortOrder)
            .ThenBy(c => c.Code)
            .Select(c => BuildTreeNode(c, allCostCenters))
            .ToList();

        return new CostCenterTreeNodeDto
        {
            Id = costCenter.Id,
            Code = costCenter.Code,
            Name = costCenter.Name,
            Type = costCenter.Type,
            TypeName = GetTypeName(costCenter.Type),
            Category = costCenter.Category,
            CategoryName = GetCategoryName(costCenter.Category),
            ParentId = costCenter.ParentId,
            Level = costCenter.Level,
            SortOrder = costCenter.SortOrder,
            IsActive = costCenter.IsActive,
            IsFrozen = costCenter.IsFrozen,
            AnnualBudgetAmount = costCenter.AnnualBudget?.Amount,
            SpentAmount = costCenter.SpentAmount.Amount,
            BudgetUsagePercentage = costCenter.GetBudgetUsagePercentage(),
            IsBudgetWarning = costCenter.IsBudgetWarning(),
            IsOverBudget = costCenter.IsOverBudget(),
            Children = children,
            ChildCount = children.Count
        };
    }

    private static string GetTypeName(CostCenterType type)
    {
        return type switch
        {
            CostCenterType.Main => "Ana Merkez",
            CostCenterType.Department => "Departman",
            CostCenterType.Branch => "Şube",
            CostCenterType.Project => "Proje",
            CostCenterType.Production => "Üretim",
            CostCenterType.Service => "Hizmet",
            CostCenterType.Auxiliary => "Yardımcı",
            CostCenterType.Temporary => "Geçici",
            _ => type.ToString()
        };
    }

    private static string GetCategoryName(CostCenterCategory category)
    {
        return category switch
        {
            CostCenterCategory.Production => "Üretim",
            CostCenterCategory.Administrative => "Yönetim",
            CostCenterCategory.Sales => "Satış",
            CostCenterCategory.Marketing => "Pazarlama",
            CostCenterCategory.Distribution => "Dağıtım",
            CostCenterCategory.RnD => "Ar-Ge",
            CostCenterCategory.Support => "Destek",
            CostCenterCategory.Other => "Diğer",
            _ => category.ToString()
        };
    }
}

#endregion
