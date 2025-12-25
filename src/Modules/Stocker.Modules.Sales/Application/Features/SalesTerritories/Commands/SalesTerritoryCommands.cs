using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesTerritories.Commands;

public record CreateSalesTerritoryCommand : IRequest<Result<SalesTerritoryDto>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public TerritoryType TerritoryType { get; init; }
    public Guid? ParentTerritoryId { get; init; }
    public string? Country { get; init; }
    public string? Region { get; init; }
    public string? City { get; init; }
    public string? District { get; init; }
    public Guid? TerritoryManagerId { get; init; }
    public string? TerritoryManagerName { get; init; }
    public Guid? DefaultPriceListId { get; init; }
}

public record UpdateSalesTerritoryCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? Country { get; init; }
    public string? Region { get; init; }
    public string? City { get; init; }
    public string? District { get; init; }
    public Guid? TerritoryManagerId { get; init; }
    public string? TerritoryManagerName { get; init; }
    public Guid? DefaultPriceListId { get; init; }
    public string? Notes { get; init; }
}

public record ActivateTerritoryCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid Id { get; init; }
}

public record DeactivateTerritoryCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid Id { get; init; }
}

public record SuspendTerritoryCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid Id { get; init; }
    public string Reason { get; init; } = string.Empty;
}

public record AssignSalesRepCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid TerritoryId { get; init; }
    public Guid SalesRepId { get; init; }
    public string SalesRepName { get; init; } = string.Empty;
    public TerritoryRole Role { get; init; }
    public DateTime EffectiveFrom { get; init; }
    public DateTime? EffectiveTo { get; init; }
    public decimal? CommissionRate { get; init; }
}

public record RemoveAssignmentCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid TerritoryId { get; init; }
    public Guid AssignmentId { get; init; }
}

public record AssignCustomerToTerritoryCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid TerritoryId { get; init; }
    public Guid CustomerId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public Guid? PrimarySalesRepId { get; init; }
    public string? PrimarySalesRepName { get; init; }
}

public record RemoveCustomerFromTerritoryCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid TerritoryId { get; init; }
    public Guid CustomerId { get; init; }
}

public record AddPostalCodeCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid TerritoryId { get; init; }
    public string PostalCode { get; init; } = string.Empty;
    public string? AreaName { get; init; }
}

public record RemovePostalCodeCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid TerritoryId { get; init; }
    public string PostalCode { get; init; } = string.Empty;
}

public record RecordPerformanceScoreCommand : IRequest<Result<SalesTerritoryDto>>
{
    public Guid TerritoryId { get; init; }
    public decimal Score { get; init; }
}

public record DeleteSalesTerritoryCommand : IRequest<Result>
{
    public Guid Id { get; init; }
}
