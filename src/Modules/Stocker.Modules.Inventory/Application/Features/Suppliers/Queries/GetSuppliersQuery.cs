using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Suppliers.Queries;

/// <summary>
/// Query to get all suppliers
/// </summary>
public class GetSuppliersQuery : IRequest<Result<List<SupplierListDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; }
}

/// <summary>
/// Handler for GetSuppliersQuery
/// </summary>
public class GetSuppliersQueryHandler : IRequestHandler<GetSuppliersQuery, Result<List<SupplierListDto>>>
{
    private readonly ISupplierRepository _supplierRepository;

    public GetSuppliersQueryHandler(ISupplierRepository supplierRepository)
    {
        _supplierRepository = supplierRepository;
    }

    public async Task<Result<List<SupplierListDto>>> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var suppliers = request.IncludeInactive
            ? await _supplierRepository.GetAllAsync(cancellationToken)
            : await _supplierRepository.GetActiveSuppliersAsync(cancellationToken);

        var dtos = suppliers.Select(s => new SupplierListDto
        {
            Id = s.Id,
            Code = s.Code,
            Name = s.Name,
            Phone = s.Phone?.Value,
            City = s.Address?.City,
            IsPreferred = false, // TODO: Add IsPreferred to entity if needed
            IsActive = s.IsActive,
            ProductCount = s.Products?.Count ?? 0
        }).ToList();

        return Result<List<SupplierListDto>>.Success(dtos);
    }
}
