using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
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

    public GetSupplierByIdQueryHandler(ISupplierRepository supplierRepository)
    {
        _supplierRepository = supplierRepository;
    }

    public async Task<Result<SupplierDto>> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var supplier = await _supplierRepository.GetWithProductsAsync(request.SupplierId, cancellationToken);

        if (supplier == null)
        {
            return Result<SupplierDto>.Failure(new Error("Supplier.NotFound", $"Supplier with ID {request.SupplierId} not found", ErrorType.NotFound));
        }

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
            ProductCount = supplier.Products?.Count ?? 0
        };

        return Result<SupplierDto>.Success(dto);
    }
}
