using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.Suppliers.Commands;
using Stocker.Modules.Purchase.Application.Features.Suppliers.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.Suppliers.Handlers;

/// <summary>
/// Handler for CreateSupplierCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class CreateSupplierHandler : IRequestHandler<CreateSupplierCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateSupplierHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var existingSupplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .FirstOrDefaultAsync(s => s.Code == request.Dto.Code && s.TenantId == tenantId, cancellationToken);

        if (existingSupplier != null)
            return Result<SupplierDto>.Failure(Error.Conflict("Supplier.Code", "Supplier code already exists"));

        var supplier = Supplier.Create(
            request.Dto.Code,
            request.Dto.Name,
            request.Dto.Type,
            tenantId,
            request.Dto.TaxNumber,
            request.Dto.Email,
            request.Dto.Phone
        );

        // Use Update method for additional properties
        supplier.Update(
            request.Dto.Name,
            request.Dto.TaxNumber,
            request.Dto.TaxOffice,
            request.Dto.Email,
            request.Dto.Phone,
            request.Dto.Address,
            request.Dto.City,
            request.Dto.District,
            request.Dto.PaymentTermDays,
            request.Dto.Currency ?? "TRY"
        );

        if (request.Dto.CreditLimit > 0)
            supplier.SetCreditLimit(request.Dto.CreditLimit);

        if (request.Dto.BankName != null || request.Dto.IBAN != null || request.Dto.SwiftCode != null)
            supplier.SetBankInfo(
                request.Dto.BankName,
                request.Dto.IBAN,
                request.Dto.SwiftCode
            );

        if (request.Dto.DiscountRate > 0)
            supplier.SetDiscountRate(request.Dto.DiscountRate);

        await _unitOfWork.Repository<Supplier>().AddAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for GetSupplierByIdQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetSupplierByIdHandler : IRequestHandler<GetSupplierByIdQuery, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetSupplierByIdHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Include(s => s.Contacts)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == tenantId, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for GetSuppliersQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetSuppliersHandler : IRequestHandler<GetSuppliersQuery, Result<PagedResult<SupplierListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetSuppliersHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<SupplierListDto>>> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Where(s => s.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(s =>
                s.Code.ToLower().Contains(searchTerm) ||
                s.Name.ToLower().Contains(searchTerm) ||
                (s.TaxNumber != null && s.TaxNumber.ToLower().Contains(searchTerm)));
        }

        if (request.Type.HasValue)
            query = query.Where(s => s.Type == request.Type.Value);

        if (request.Status.HasValue)
            query = query.Where(s => s.Status == request.Status.Value);

        if (request.IsActive.HasValue)
            query = query.Where(s => s.IsActive == request.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(request.City))
            query = query.Where(s => s.City != null && s.City.ToLower().Contains(request.City.ToLower()));

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "code" => request.SortDescending ? query.OrderByDescending(s => s.Code) : query.OrderBy(s => s.Code),
            "name" => request.SortDescending ? query.OrderByDescending(s => s.Name) : query.OrderBy(s => s.Name),
            "city" => request.SortDescending ? query.OrderByDescending(s => s.City) : query.OrderBy(s => s.City),
            "balance" => request.SortDescending ? query.OrderByDescending(s => s.CurrentBalance) : query.OrderBy(s => s.CurrentBalance),
            "rating" => request.SortDescending ? query.OrderByDescending(s => s.Rating) : query.OrderBy(s => s.Rating),
            _ => request.SortDescending ? query.OrderByDescending(s => s.CreatedAt) : query.OrderBy(s => s.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new SupplierListDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                TaxNumber = s.TaxNumber,
                Type = s.Type.ToString(),
                Status = s.Status.ToString(),
                City = s.City,
                Phone = s.Phone,
                Email = s.Email,
                CurrentBalance = s.CurrentBalance,
                Currency = s.Currency,
                Rating = (int)(s.Rating ?? 0),
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<SupplierListDto>>.Success(
            new PagedResult<SupplierListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

/// <summary>
/// Handler for UpdateSupplierCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class UpdateSupplierHandler : IRequestHandler<UpdateSupplierCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateSupplierHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Include(s => s.Contacts)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == tenantId, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        // Use Update method for main properties
        supplier.Update(
            request.Dto.Name ?? supplier.Name,
            request.Dto.TaxNumber ?? supplier.TaxNumber,
            request.Dto.TaxOffice ?? supplier.TaxOffice,
            request.Dto.Email ?? supplier.Email,
            request.Dto.Phone ?? supplier.Phone,
            request.Dto.Address ?? supplier.Address,
            request.Dto.City ?? supplier.City,
            request.Dto.District ?? supplier.District,
            request.Dto.PaymentTermDays ?? supplier.PaymentTermDays,
            request.Dto.Currency ?? supplier.Currency
        );

        if (request.Dto.CreditLimit.HasValue)
            supplier.SetCreditLimit(request.Dto.CreditLimit.Value);

        if (request.Dto.BankName != null || request.Dto.IBAN != null || request.Dto.SwiftCode != null)
        {
            supplier.SetBankInfo(
                request.Dto.BankName ?? supplier.BankName,
                request.Dto.IBAN ?? supplier.IBAN,
                request.Dto.SwiftCode ?? supplier.SwiftCode
            );
        }

        if (request.Dto.DiscountRate.HasValue)
            supplier.SetDiscountRate(request.Dto.DiscountRate.Value);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for ActivateSupplierCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class ActivateSupplierHandler : IRequestHandler<ActivateSupplierCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ActivateSupplierHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(ActivateSupplierCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(request.Id, cancellationToken);

        if (supplier == null || supplier.TenantId != tenantId)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for DeactivateSupplierCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class DeactivateSupplierHandler : IRequestHandler<DeactivateSupplierCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DeactivateSupplierHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(DeactivateSupplierCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(request.Id, cancellationToken);

        if (supplier == null || supplier.TenantId != tenantId)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.Deactivate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for DeleteSupplierCommand
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class DeleteSupplierHandler : IRequestHandler<DeleteSupplierCommand, Result>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public DeleteSupplierHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteSupplierCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(request.Id, cancellationToken);

        if (supplier == null || supplier.TenantId != tenantId)
            return Result.Failure(Error.NotFound("Supplier", "Supplier not found"));

        var hasOrders = await _unitOfWork.ReadRepository<PurchaseOrder>().AsQueryable()
            .AnyAsync(po => po.SupplierId == request.Id && po.TenantId == tenantId, cancellationToken);

        if (hasOrders)
            return Result.Failure(Error.Conflict("Supplier", "Cannot delete supplier with existing orders"));

        _unitOfWork.Repository<Supplier>().Remove(supplier);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

/// <summary>
/// Handler for GetActiveSuppliersQuery
/// Uses IPurchaseUnitOfWork for consistent data access
/// </summary>
public class GetActiveSuppliersHandler : IRequestHandler<GetActiveSuppliersQuery, Result<List<SupplierListDto>>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;

    public GetActiveSuppliersHandler(IPurchaseUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<SupplierListDto>>> Handle(GetActiveSuppliersQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var suppliers = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Where(s => s.TenantId == tenantId && s.IsActive && s.Status == SupplierStatus.Active)
            .OrderBy(s => s.Name)
            .Select(s => new SupplierListDto
            {
                Id = s.Id,
                Code = s.Code,
                Name = s.Name,
                TaxNumber = s.TaxNumber,
                Type = s.Type.ToString(),
                Status = s.Status.ToString(),
                City = s.City,
                Phone = s.Phone,
                Email = s.Email,
                CurrentBalance = s.CurrentBalance,
                Currency = s.Currency,
                Rating = (int)(s.Rating ?? 0),
                IsActive = s.IsActive,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<List<SupplierListDto>>.Success(suppliers);
    }
}

/// <summary>
/// Handler for AddSupplierProductCommand
/// </summary>
public class AddSupplierProductHandler : IRequestHandler<AddSupplierProductCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddSupplierProductHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(AddSupplierProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Include(s => s.Products)
            .Include(s => s.Contacts)
            .FirstOrDefaultAsync(s => s.Id == request.SupplierId && s.TenantId == tenantId, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        var existingProduct = supplier.Products.FirstOrDefault(p => p.ProductId == request.Product.ProductId);
        if (existingProduct != null)
            return Result<SupplierDto>.Failure(Error.Conflict("SupplierProduct", "Product already exists for this supplier"));

        var supplierProduct = SupplierProduct.Create(
            request.SupplierId,
            request.Product.ProductId,
            request.Product.UnitPrice,
            request.Product.Currency,
            request.Product.IsPreferred,
            tenantId);

        supplierProduct.Update(
            request.Product.SupplierProductCode,
            request.Product.SupplierProductName,
            request.Product.UnitPrice,
            request.Product.Currency,
            request.Product.LeadTimeDays,
            request.Product.MinOrderQuantity,
            request.Product.IsPreferred,
            null);

        supplier.AddProduct(supplierProduct);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for UpdateSupplierProductCommand
/// </summary>
public class UpdateSupplierProductHandler : IRequestHandler<UpdateSupplierProductCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateSupplierProductHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(UpdateSupplierProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Include(s => s.Products)
            .Include(s => s.Contacts)
            .FirstOrDefaultAsync(s => s.Id == request.SupplierId && s.TenantId == tenantId, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        var supplierProduct = supplier.Products.FirstOrDefault(p => p.Id == request.ProductId);
        if (supplierProduct == null)
            return Result<SupplierDto>.Failure(Error.NotFound("SupplierProduct", "Supplier product not found"));

        supplierProduct.Update(
            request.Dto.SupplierProductCode ?? supplierProduct.SupplierProductCode,
            request.Dto.SupplierProductName ?? supplierProduct.SupplierProductName,
            request.Dto.UnitPrice ?? supplierProduct.UnitPrice,
            request.Dto.Currency ?? supplierProduct.Currency,
            request.Dto.LeadTimeDays ?? supplierProduct.LeadTimeDays,
            request.Dto.MinOrderQuantity ?? supplierProduct.MinimumOrderQuantity,
            request.Dto.IsPreferred ?? supplierProduct.IsPreferred,
            request.Dto.Notes ?? supplierProduct.Notes);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for RemoveSupplierProductCommand
/// </summary>
public class RemoveSupplierProductHandler : IRequestHandler<RemoveSupplierProductCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RemoveSupplierProductHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(RemoveSupplierProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Include(s => s.Products)
            .Include(s => s.Contacts)
            .FirstOrDefaultAsync(s => s.Id == request.SupplierId && s.TenantId == tenantId, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        var supplierProduct = supplier.Products.FirstOrDefault(p => p.Id == request.ProductId);
        if (supplierProduct == null)
            return Result<SupplierDto>.Failure(Error.NotFound("SupplierProduct", "Supplier product not found"));

        supplier.RemoveProduct(request.ProductId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for AddSupplierContactCommand
/// </summary>
public class AddSupplierContactHandler : IRequestHandler<AddSupplierContactCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AddSupplierContactHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(AddSupplierContactCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Include(s => s.Contacts)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == request.SupplierId && s.TenantId == tenantId, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        var contact = SupplierContact.Create(
            request.SupplierId,
            request.Contact.Name,
            request.Contact.Email,
            request.Contact.Phone,
            request.Contact.IsPrimary,
            tenantId);

        supplier.AddContact(contact);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for RemoveSupplierContactCommand
/// </summary>
public class RemoveSupplierContactHandler : IRequestHandler<RemoveSupplierContactCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RemoveSupplierContactHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(RemoveSupplierContactCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.ReadRepository<Supplier>().AsQueryable()
            .Include(s => s.Contacts)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == request.SupplierId && s.TenantId == tenantId, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.RemoveContact(request.ContactId);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for BlacklistSupplierCommand
/// </summary>
public class BlacklistSupplierHandler : IRequestHandler<BlacklistSupplierCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public BlacklistSupplierHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(BlacklistSupplierCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(request.Id, cancellationToken);

        if (supplier == null || supplier.TenantId != tenantId)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.Blacklist(request.Reason);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for SetSupplierRatingCommand
/// </summary>
public class SetSupplierRatingHandler : IRequestHandler<SetSupplierRatingCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SetSupplierRatingHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(SetSupplierRatingCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(request.Id, cancellationToken);

        if (supplier == null || supplier.TenantId != tenantId)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.SetRating(request.Rating);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

/// <summary>
/// Handler for UpdateSupplierBalanceCommand
/// </summary>
public class UpdateSupplierBalanceHandler : IRequestHandler<UpdateSupplierBalanceCommand, Result<SupplierDto>>
{
    private readonly IPurchaseUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateSupplierBalanceHandler(IPurchaseUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(UpdateSupplierBalanceCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var supplier = await _unitOfWork.Repository<Supplier>().GetByIdAsync(request.Id, cancellationToken);

        if (supplier == null || supplier.TenantId != tenantId)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.UpdateBalance(request.Amount);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}
