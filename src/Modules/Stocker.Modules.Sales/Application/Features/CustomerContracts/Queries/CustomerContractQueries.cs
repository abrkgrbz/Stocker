using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CustomerContracts.Queries;

public record GetCustomerContractsQuery : IRequest<Result<PagedResult<CustomerContractListDto>>>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string? SearchTerm { get; init; }
    public ContractStatus? Status { get; init; }
    public Guid? CustomerId { get; init; }
    public ContractType? ContractType { get; init; }
    public DateTime? FromDate { get; init; }
    public DateTime? ToDate { get; init; }
    public bool? ExpiringOnly { get; init; }
    public int? ExpiringWithinDays { get; init; }
    public string? SortBy { get; init; } = "EndDate";
    public bool SortDescending { get; init; }
}

public record GetCustomerContractByIdQuery : IRequest<Result<CustomerContractDto>>
{
    public Guid Id { get; init; }
}

public record GetCustomerContractByNumberQuery : IRequest<Result<CustomerContractDto>>
{
    public string ContractNumber { get; init; } = string.Empty;
}

public record GetActiveContractByCustomerQuery : IRequest<Result<CustomerContractDto>>
{
    public Guid CustomerId { get; init; }
}

public record GetExpiringContractsQuery : IRequest<Result<IReadOnlyList<CustomerContractListDto>>>
{
    public int DaysUntilExpiration { get; init; } = 30;
}

public record GetContractsRequiringRenewalQuery : IRequest<Result<IReadOnlyList<CustomerContractListDto>>>
{
}

public record ValidateContractForOrderQuery : IRequest<Result<ContractValidationResult>>
{
    public Guid ContractId { get; init; }
    public decimal OrderAmount { get; init; }
    public decimal CurrentOutstandingBalance { get; init; }
    public bool AllowGracePeriod { get; init; }
}

public record ContractValidationResult
{
    public bool IsValid { get; init; }
    public string? ErrorMessage { get; init; }
    public decimal? AvailableCredit { get; init; }
    public decimal? CreditLimit { get; init; }
    public int? DaysUntilExpiration { get; init; }
    public bool IsInGracePeriod { get; init; }
}
