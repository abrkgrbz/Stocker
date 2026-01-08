using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Suppliers.Commands;

#region Add Supplier Product

public class AddSupplierProductCommand : IRequest<Result<SupplierProductDto>>
{
    public Guid TenantId { get; set; }
    public int SupplierId { get; set; }
    public CreateSupplierProductDto ProductData { get; set; } = null!;
}

public class AddSupplierProductCommandValidator : AbstractValidator<AddSupplierProductCommand>
{
    public AddSupplierProductCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SupplierId).GreaterThan(0);
        RuleFor(x => x.ProductData).NotNull();
        RuleFor(x => x.ProductData.ProductId).GreaterThan(0);
        RuleFor(x => x.ProductData.UnitCost).GreaterThanOrEqualTo(0);
    }
}

public class AddSupplierProductCommandHandler : IRequestHandler<AddSupplierProductCommand, Result<SupplierProductDto>>
{
    private readonly InventoryDbContext _dbContext;
    private readonly IInventoryUnitOfWork _unitOfWork;

    public AddSupplierProductCommandHandler(InventoryDbContext dbContext, IInventoryUnitOfWork unitOfWork)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SupplierProductDto>> Handle(AddSupplierProductCommand request, CancellationToken cancellationToken)
    {
        var supplier = await _unitOfWork.Suppliers.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
        {
            return Result<SupplierProductDto>.Failure(
                new Error("Supplier.NotFound", $"Supplier with ID {request.SupplierId} not found", ErrorType.NotFound));
        }

        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductData.ProductId, cancellationToken);
        if (product == null)
        {
            return Result<SupplierProductDto>.Failure(
                new Error("Product.NotFound", $"Product with ID {request.ProductData.ProductId} not found", ErrorType.NotFound));
        }

        // Check if supplier product already exists
        var existingProduct = await _dbContext.Set<SupplierProduct>()
            .FirstOrDefaultAsync(sp => sp.SupplierId == request.SupplierId && sp.ProductId == request.ProductData.ProductId, cancellationToken);

        if (existingProduct != null)
        {
            return Result<SupplierProductDto>.Failure(
                new Error("SupplierProduct.AlreadyExists", "This product is already linked to the supplier", ErrorType.Conflict));
        }

        var data = request.ProductData;
        var unitCost = Money.Create(data.UnitCost, data.Currency);
        var supplierProduct = new SupplierProduct(request.SupplierId, data.ProductId, unitCost);

        supplierProduct.SetSupplierProductInfo(data.SupplierProductCode, null, null);
        supplierProduct.SetOrderConstraints(data.MinimumOrderQuantity, 1, data.LeadTimeDays);

        if (data.IsPreferred)
            supplierProduct.SetAsPreferred();

        await _dbContext.Set<SupplierProduct>().AddAsync(supplierProduct, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var dto = new SupplierProductDto
        {
            Id = supplierProduct.Id,
            SupplierId = supplierProduct.SupplierId,
            ProductId = supplierProduct.ProductId,
            ProductCode = product.Code,
            ProductName = product.Name,
            SupplierProductCode = supplierProduct.SupplierProductCode,
            UnitPrice = supplierProduct.UnitCost.Amount,
            Currency = supplierProduct.Currency,
            MinOrderQuantity = supplierProduct.MinOrderQuantity,
            LeadTimeDays = supplierProduct.LeadTimeDays,
            IsPreferred = supplierProduct.IsPreferred,
            IsActive = supplierProduct.IsActive
        };

        return Result<SupplierProductDto>.Success(dto);
    }
}

#endregion

#region Update Supplier Product

public class UpdateSupplierProductCommand : IRequest<Result<SupplierProductDto>>
{
    public Guid TenantId { get; set; }
    public int SupplierId { get; set; }
    public int SupplierProductId { get; set; }
    public UpdateSupplierProductDto ProductData { get; set; } = null!;
}

public class UpdateSupplierProductDto
{
    public string? SupplierProductCode { get; set; }
    public decimal UnitCost { get; set; }
    public string Currency { get; set; } = "TRY";
    public decimal MinimumOrderQuantity { get; set; } = 1;
    public int LeadTimeDays { get; set; }
    public bool IsPreferred { get; set; }
}

public class UpdateSupplierProductCommandValidator : AbstractValidator<UpdateSupplierProductCommand>
{
    public UpdateSupplierProductCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SupplierId).GreaterThan(0);
        RuleFor(x => x.SupplierProductId).GreaterThan(0);
        RuleFor(x => x.ProductData).NotNull();
        RuleFor(x => x.ProductData.UnitCost).GreaterThanOrEqualTo(0);
    }
}

public class UpdateSupplierProductCommandHandler : IRequestHandler<UpdateSupplierProductCommand, Result<SupplierProductDto>>
{
    private readonly InventoryDbContext _dbContext;
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateSupplierProductCommandHandler(InventoryDbContext dbContext, IInventoryUnitOfWork unitOfWork)
    {
        _dbContext = dbContext;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SupplierProductDto>> Handle(UpdateSupplierProductCommand request, CancellationToken cancellationToken)
    {
        var supplierProduct = await _dbContext.Set<SupplierProduct>()
            .FirstOrDefaultAsync(sp => sp.Id == request.SupplierProductId && sp.SupplierId == request.SupplierId, cancellationToken);

        if (supplierProduct == null)
        {
            return Result<SupplierProductDto>.Failure(
                new Error("SupplierProduct.NotFound", "Supplier product not found", ErrorType.NotFound));
        }

        var product = await _unitOfWork.Products.GetByIdAsync(supplierProduct.ProductId, cancellationToken);

        var data = request.ProductData;
        var unitCost = Money.Create(data.UnitCost, data.Currency);

        supplierProduct.UpdateCost(unitCost);
        supplierProduct.SetSupplierProductInfo(data.SupplierProductCode, null, null);
        supplierProduct.SetOrderConstraints(data.MinimumOrderQuantity, 1, data.LeadTimeDays);

        if (data.IsPreferred)
            supplierProduct.SetAsPreferred();
        else
            supplierProduct.UnsetPreferred();

        await _dbContext.SaveChangesAsync(cancellationToken);

        var dto = new SupplierProductDto
        {
            Id = supplierProduct.Id,
            SupplierId = supplierProduct.SupplierId,
            ProductId = supplierProduct.ProductId,
            ProductCode = product?.Code ?? "",
            ProductName = product?.Name ?? "",
            SupplierProductCode = supplierProduct.SupplierProductCode,
            UnitPrice = supplierProduct.UnitCost.Amount,
            Currency = supplierProduct.Currency,
            MinOrderQuantity = supplierProduct.MinOrderQuantity,
            LeadTimeDays = supplierProduct.LeadTimeDays,
            IsPreferred = supplierProduct.IsPreferred,
            IsActive = supplierProduct.IsActive
        };

        return Result<SupplierProductDto>.Success(dto);
    }
}

#endregion

#region Remove Supplier Product

public class RemoveSupplierProductCommand : IRequest<Result>
{
    public Guid TenantId { get; set; }
    public int SupplierId { get; set; }
    public int SupplierProductId { get; set; }
}

public class RemoveSupplierProductCommandValidator : AbstractValidator<RemoveSupplierProductCommand>
{
    public RemoveSupplierProductCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SupplierId).GreaterThan(0);
        RuleFor(x => x.SupplierProductId).GreaterThan(0);
    }
}

public class RemoveSupplierProductCommandHandler : IRequestHandler<RemoveSupplierProductCommand, Result>
{
    private readonly InventoryDbContext _dbContext;

    public RemoveSupplierProductCommandHandler(InventoryDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result> Handle(RemoveSupplierProductCommand request, CancellationToken cancellationToken)
    {
        var supplierProduct = await _dbContext.Set<SupplierProduct>()
            .FirstOrDefaultAsync(sp => sp.Id == request.SupplierProductId && sp.SupplierId == request.SupplierId, cancellationToken);

        if (supplierProduct == null)
        {
            return Result.Failure(
                new Error("SupplierProduct.NotFound", "Supplier product not found", ErrorType.NotFound));
        }

        _dbContext.Set<SupplierProduct>().Remove(supplierProduct);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

#endregion
