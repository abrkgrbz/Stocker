using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Suppliers.Queries;

/// <summary>
/// Query to get a supplier by ID
/// </summary>
public class GetSupplierByIdQuery : IRequest<Result<SupplierDto>>
{
    public Guid TenantId { get; set; }
    public int SupplierId { get; set; }
}

/// <summary>
/// Handler for GetSupplierByIdQuery
/// </summary>
public class GetSupplierByIdQueryHandler : IRequestHandler<GetSupplierByIdQuery, Result<SupplierDto>>
{
    private readonly ISupplierRepository _supplierRepository;
    private readonly InventoryDbContext _dbContext;

    public GetSupplierByIdQueryHandler(ISupplierRepository supplierRepository, InventoryDbContext dbContext)
    {
        _supplierRepository = supplierRepository;
        _dbContext = dbContext;
    }

    public async Task<Result<SupplierDto>> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var supplier = await _supplierRepository.GetWithProductsAsync(request.SupplierId, cancellationToken);

        if (supplier == null)
        {
            return Result<SupplierDto>.Failure(new Error("Supplier.NotFound", $"Supplier with ID {request.SupplierId} not found", ErrorType.NotFound));
        }

        // Get supplier products with product details
        var supplierProducts = await _dbContext.Set<SupplierProduct>()
            .Include(sp => sp.Product)
            .Where(sp => sp.SupplierId == request.SupplierId && !sp.IsDeleted)
            .ToListAsync(cancellationToken);

        var dto = new SupplierDto
        {
            Id = supplier.Id,
            Code = supplier.Code,
            Name = supplier.Name,
            TaxNumber = supplier.TaxNumber,
            TaxOffice = supplier.TaxOffice,
            Email = supplier.Email?.Value,
            Phone = supplier.Phone?.Value,
            Fax = supplier.Fax?.Value,
            Street = supplier.Address?.Street,
            City = supplier.Address?.City,
            State = supplier.Address?.State,
            Country = supplier.Address?.Country,
            PostalCode = supplier.Address?.PostalCode,
            Website = supplier.Website,
            ContactPerson = supplier.ContactPerson,
            ContactPhone = supplier.ContactPhone,
            ContactEmail = supplier.ContactEmail,
            PaymentTermDays = supplier.PaymentTerm,
            CreditLimit = supplier.CreditLimit,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedDate,
            UpdatedAt = supplier.UpdatedDate,
            ProductCount = supplierProducts.Count,
            Products = supplierProducts.Select(sp => new SupplierProductDto
            {
                Id = sp.Id,
                SupplierId = sp.SupplierId,
                ProductId = sp.ProductId,
                ProductCode = sp.Product?.Code ?? "",
                ProductName = sp.Product?.Name ?? "",
                SupplierProductCode = sp.SupplierProductCode,
                UnitCost = sp.UnitCost.Amount,
                Currency = sp.Currency,
                MinimumOrderQuantity = sp.MinOrderQuantity,
                LeadTimeDays = sp.LeadTimeDays,
                IsPreferred = sp.IsPreferred,
                IsActive = sp.IsActive
            }).ToList()
        };

        return Result<SupplierDto>.Success(dto);
    }
}
