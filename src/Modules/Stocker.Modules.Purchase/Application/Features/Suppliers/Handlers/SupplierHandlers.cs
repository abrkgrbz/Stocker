using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Purchase.Application.DTOs;
using Stocker.Modules.Purchase.Application.Features.Suppliers.Commands;
using Stocker.Modules.Purchase.Application.Features.Suppliers.Queries;
using Stocker.Modules.Purchase.Domain.Entities;
using Stocker.Modules.Purchase.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Purchase.Application.Features.Suppliers.Handlers;

public class CreateSupplierHandler : IRequestHandler<CreateSupplierCommand, Result<SupplierDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;
    private readonly ITenantService _tenantService;

    public CreateSupplierHandler(PurchaseDbContext context, IMapper mapper, ITenantService tenantService)
    {
        _context = context;
        _mapper = mapper;
        _tenantService = tenantService;
    }

    public async Task<Result<SupplierDto>> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
            return Result<SupplierDto>.Failure(Error.Unauthorized("Tenant", "Tenant is required"));

        var existingSupplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Code == request.Dto.Code, cancellationToken);

        if (existingSupplier != null)
            return Result<SupplierDto>.Failure(Error.Conflict("Supplier.Code", "Supplier code already exists"));

        var supplier = Supplier.Create(
            request.Dto.Code,
            request.Dto.Name,
            request.Dto.Type,
            tenantId.Value,
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

        _context.Suppliers.Add(supplier);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

public class GetSupplierByIdHandler : IRequestHandler<GetSupplierByIdQuery, Result<SupplierDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public GetSupplierByIdHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Contacts)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

public class GetSuppliersHandler : IRequestHandler<GetSuppliersQuery, Result<PagedResult<SupplierListDto>>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public GetSuppliersHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PagedResult<SupplierListDto>>> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Suppliers.AsQueryable();

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

public class UpdateSupplierHandler : IRequestHandler<UpdateSupplierCommand, Result<SupplierDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public UpdateSupplierHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers
            .Include(s => s.Contacts)
            .Include(s => s.Products)
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

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

        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

public class ActivateSupplierHandler : IRequestHandler<ActivateSupplierCommand, Result<SupplierDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public ActivateSupplierHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(ActivateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.Activate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

public class DeactivateSupplierHandler : IRequestHandler<DeactivateSupplierCommand, Result<SupplierDto>>
{
    private readonly PurchaseDbContext _context;
    private readonly IMapper _mapper;

    public DeactivateSupplierHandler(PurchaseDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<SupplierDto>> Handle(DeactivateSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (supplier == null)
            return Result<SupplierDto>.Failure(Error.NotFound("Supplier", "Supplier not found"));

        supplier.Deactivate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SupplierDto>.Success(_mapper.Map<SupplierDto>(supplier));
    }
}

public class DeleteSupplierHandler : IRequestHandler<DeleteSupplierCommand, Result>
{
    private readonly PurchaseDbContext _context;

    public DeleteSupplierHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteSupplierCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _context.Suppliers
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (supplier == null)
            return Result.Failure(Error.NotFound("Supplier", "Supplier not found"));

        var hasOrders = await _context.PurchaseOrders
            .AnyAsync(po => po.SupplierId == request.Id, cancellationToken);

        if (hasOrders)
            return Result.Failure(Error.Conflict("Supplier", "Cannot delete supplier with existing orders"));

        _context.Suppliers.Remove(supplier);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

public class GetActiveSuppliersHandler : IRequestHandler<GetActiveSuppliersQuery, Result<List<SupplierListDto>>>
{
    private readonly PurchaseDbContext _context;

    public GetActiveSuppliersHandler(PurchaseDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<SupplierListDto>>> Handle(GetActiveSuppliersQuery request, CancellationToken cancellationToken)
    {
        var suppliers = await _context.Suppliers
            .Where(s => s.IsActive && s.Status == SupplierStatus.Active)
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
