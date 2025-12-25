using Stocker.Modules.Sales.Domain.Entities;

namespace Stocker.Modules.Sales.Application.DTOs;

public record SalesTerritoryDto
{
    public Guid Id { get; init; }
    public string TerritoryCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string TerritoryType { get; init; } = string.Empty;
    public Guid? ParentTerritoryId { get; init; }
    public int HierarchyLevel { get; init; }
    public string? Country { get; init; }
    public string? Region { get; init; }
    public string? City { get; init; }
    public string? District { get; init; }
    public string? GeoBoundary { get; init; }
    public string Status { get; init; } = string.Empty;
    public Guid? TerritoryManagerId { get; init; }
    public string? TerritoryManagerName { get; init; }
    public Guid? DefaultPriceListId { get; init; }
    public decimal? PotentialValue { get; init; }
    public string? PotentialValueCurrency { get; init; }
    public decimal? AnnualTarget { get; init; }
    public string? AnnualTargetCurrency { get; init; }
    public decimal? LastPerformanceScore { get; init; }
    public DateTime? LastPerformanceDate { get; init; }
    public string? Notes { get; init; }
    public string HierarchyPath { get; init; } = string.Empty;
    public int CustomerCount { get; init; }
    public int ActiveAssignmentCount { get; init; }
    public List<TerritoryAssignmentDto> Assignments { get; init; } = new();
    public List<TerritoryCustomerDto> Customers { get; init; } = new();
    public List<TerritoryPostalCodeDto> PostalCodes { get; init; } = new();

    public static SalesTerritoryDto FromEntity(SalesTerritory entity)
    {
        return new SalesTerritoryDto
        {
            Id = entity.Id,
            TerritoryCode = entity.TerritoryCode,
            Name = entity.Name,
            Description = entity.Description,
            TerritoryType = entity.TerritoryType.ToString(),
            ParentTerritoryId = entity.ParentTerritoryId,
            HierarchyLevel = entity.HierarchyLevel,
            Country = entity.Country,
            Region = entity.Region,
            City = entity.City,
            District = entity.District,
            GeoBoundary = entity.GeoBoundary,
            Status = entity.Status.ToString(),
            TerritoryManagerId = entity.TerritoryManagerId,
            TerritoryManagerName = entity.TerritoryManagerName,
            DefaultPriceListId = entity.DefaultPriceListId,
            PotentialValue = entity.PotentialValue?.Amount,
            PotentialValueCurrency = entity.PotentialValue?.Currency,
            AnnualTarget = entity.AnnualTarget?.Amount,
            AnnualTargetCurrency = entity.AnnualTarget?.Currency,
            LastPerformanceScore = entity.LastPerformanceScore,
            LastPerformanceDate = entity.LastPerformanceDate,
            Notes = entity.Notes,
            HierarchyPath = entity.GetHierarchyPath(),
            CustomerCount = entity.GetCustomerCount(),
            ActiveAssignmentCount = entity.GetActiveAssignments().Count(),
            Assignments = entity.Assignments.Select(TerritoryAssignmentDto.FromEntity).ToList(),
            Customers = entity.Customers.Select(TerritoryCustomerDto.FromEntity).ToList(),
            PostalCodes = entity.PostalCodes.Select(TerritoryPostalCodeDto.FromEntity).ToList()
        };
    }
}

public record SalesTerritoryListDto
{
    public Guid Id { get; init; }
    public string TerritoryCode { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string TerritoryType { get; init; } = string.Empty;
    public string? Region { get; init; }
    public string? City { get; init; }
    public string Status { get; init; } = string.Empty;
    public string? TerritoryManagerName { get; init; }
    public int CustomerCount { get; init; }
    public int ActiveAssignmentCount { get; init; }
    public decimal? LastPerformanceScore { get; init; }

    public static SalesTerritoryListDto FromEntity(SalesTerritory entity)
    {
        return new SalesTerritoryListDto
        {
            Id = entity.Id,
            TerritoryCode = entity.TerritoryCode,
            Name = entity.Name,
            TerritoryType = entity.TerritoryType.ToString(),
            Region = entity.Region,
            City = entity.City,
            Status = entity.Status.ToString(),
            TerritoryManagerName = entity.TerritoryManagerName,
            CustomerCount = entity.GetCustomerCount(),
            ActiveAssignmentCount = entity.GetActiveAssignments().Count(),
            LastPerformanceScore = entity.LastPerformanceScore
        };
    }
}

public record TerritoryAssignmentDto
{
    public Guid Id { get; init; }
    public Guid SalesRepresentativeId { get; init; }
    public string SalesRepresentativeName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public decimal? CommissionRate { get; init; }
    public bool IsActive { get; init; }
    public bool IsCurrentlyEffective { get; init; }

    public static TerritoryAssignmentDto FromEntity(TerritoryAssignment entity)
    {
        return new TerritoryAssignmentDto
        {
            Id = entity.Id,
            SalesRepresentativeId = entity.SalesRepresentativeId,
            SalesRepresentativeName = entity.SalesRepresentativeName,
            Role = entity.Role.ToString(),
            EffectiveFrom = entity.EffectiveFrom,
            EffectiveTo = entity.EffectiveTo,
            CommissionRate = entity.CommissionRate,
            IsActive = entity.IsActive,
            IsCurrentlyEffective = entity.IsActive && entity.IsEffectiveAt(DateTime.UtcNow)
        };
    }
}

public record TerritoryCustomerDto
{
    public Guid Id { get; init; }
    public Guid CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public Guid? PrimarySalesRepresentativeId { get; init; }
    public string? PrimarySalesRepresentativeName { get; init; }
    public DateTime AssignedAt { get; init; }
    public bool IsActive { get; init; }

    public static TerritoryCustomerDto FromEntity(TerritoryCustomer entity)
    {
        return new TerritoryCustomerDto
        {
            Id = entity.Id,
            CustomerId = entity.CustomerId,
            CustomerName = entity.CustomerName,
            PrimarySalesRepresentativeId = entity.PrimarySalesRepresentativeId,
            PrimarySalesRepresentativeName = entity.PrimarySalesRepresentativeName,
            AssignedAt = entity.AssignedAt,
            IsActive = entity.IsActive
        };
    }
}

public record TerritoryPostalCodeDto
{
    public Guid Id { get; init; }
    public string PostalCode { get; init; } = string.Empty;
    public string? AreaName { get; init; }

    public static TerritoryPostalCodeDto FromEntity(TerritoryPostalCode entity)
    {
        return new TerritoryPostalCodeDto
        {
            Id = entity.Id,
            PostalCode = entity.PostalCode,
            AreaName = entity.AreaName
        };
    }
}
