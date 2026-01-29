using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesProducts.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesProducts.Handlers;

public class CreateSalesProductCommandHandler : IRequestHandler<CreateSalesProductCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateSalesProductCommandHandler> _logger;

    public CreateSalesProductCommandHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<CreateSalesProductCommandHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(CreateSalesProductCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            return Result<SalesProductDto>.Failure(
                Error.Validation("Tenant.Required", "Tenant ID is required"));
        }

        var userId = _currentUserService.UserId?.ToString();

        // Generate product code
        var productCode = await GenerateProductCodeAsync(request.ProductType, cancellationToken);

        // Check for duplicate barcode
        if (!string.IsNullOrWhiteSpace(request.Barcode))
        {
            var existingByBarcode = await _context.SalesProducts
                .AnyAsync(p => p.Barcode == request.Barcode, cancellationToken);

            if (existingByBarcode)
            {
                return Result<SalesProductDto>.Failure(
                    Error.Conflict("Product.DuplicateBarcode",
                        $"Bu barkoda sahip bir ürün zaten mevcut: '{request.Barcode}'"));
            }
        }

        // Check for duplicate SKU
        if (!string.IsNullOrWhiteSpace(request.SKU))
        {
            var existingBySku = await _context.SalesProducts
                .AnyAsync(p => p.SKU == request.SKU, cancellationToken);

            if (existingBySku)
            {
                return Result<SalesProductDto>.Failure(
                    Error.Conflict("Product.DuplicateSKU",
                        $"Bu SKU'ya sahip bir ürün zaten mevcut: '{request.SKU}'"));
            }
        }

        // Create product based on type
        Result<SalesProduct> productResult;

        if (request.ProductType == SalesProductType.Service)
        {
            productResult = SalesProduct.CreateService(
                tenantId.Value,
                productCode,
                request.Name,
                request.UnitPrice,
                request.Unit,
                request.UnitDescription,
                request.VatRate,
                userId);
        }
        else
        {
            productResult = SalesProduct.CreateProduct(
                tenantId.Value,
                productCode,
                request.Name,
                request.UnitPrice,
                request.Unit,
                request.UnitDescription,
                request.VatRate,
                userId);
        }

        if (!productResult.IsSuccess)
        {
            return Result<SalesProductDto>.Failure(productResult.Error!);
        }

        var product = productResult.Value!;

        // Update basic info with description if provided
        if (!string.IsNullOrWhiteSpace(request.Description))
        {
            product.UpdateBasicInfo(request.Name, request.Description, request.ProductType, userId);
        }

        // Update codes
        if (!string.IsNullOrWhiteSpace(request.Barcode) || !string.IsNullOrWhiteSpace(request.SKU) || !string.IsNullOrWhiteSpace(request.GtipCode))
        {
            product.UpdateCodes(request.Barcode, request.SKU, request.GtipCode, userId);
        }

        // Update pricing
        if (request.CostPrice.HasValue || request.MinimumSalePrice.HasValue || request.ListPrice.HasValue || request.IsPriceIncludingVat)
        {
            var pricingResult = product.UpdatePricing(
                request.UnitPrice,
                request.CostPrice,
                request.MinimumSalePrice,
                request.ListPrice,
                request.Currency,
                request.IsPriceIncludingVat,
                userId);

            if (!pricingResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(pricingResult.Error!);
            }
        }

        // Update VAT info if there's exemption
        if (!string.IsNullOrWhiteSpace(request.VatExemptionCode))
        {
            var vatResult = product.UpdateVatInfo(
                request.VatRate,
                request.VatExemptionCode,
                request.VatExemptionReason,
                userId);

            if (!vatResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(vatResult.Error!);
            }
        }

        // Update special consumption tax if provided
        if (request.SpecialConsumptionTaxRate.HasValue || request.SpecialConsumptionTaxAmount.HasValue)
        {
            var sctResult = product.UpdateSpecialConsumptionTax(
                request.SpecialConsumptionTaxRate,
                request.SpecialConsumptionTaxAmount,
                userId);

            if (!sctResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(sctResult.Error!);
            }
        }

        // Update stock info
        if (request.ProductType != SalesProductType.Service)
        {
            var stockResult = product.UpdateStockInfo(
                request.TrackStock,
                request.MinimumStock,
                request.Weight,
                userId);

            if (!stockResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(stockResult.Error!);
            }

            // Set initial stock
            if (request.InitialStock > 0)
            {
                var updateStockResult = product.UpdateStock(request.InitialStock, userId);
                if (!updateStockResult.IsSuccess)
                {
                    return Result<SalesProductDto>.Failure(updateStockResult.Error!);
                }
            }
        }

        // Update category
        product.UpdateCategory(request.Category, request.SubCategory, request.Brand, request.Tags, userId);

        // Update images
        if (!string.IsNullOrWhiteSpace(request.ImageUrl) || !string.IsNullOrWhiteSpace(request.ThumbnailUrl))
        {
            product.UpdateImages(request.ImageUrl, request.ThumbnailUrl, userId);
        }

        // Update availability
        product.UpdateAvailability(request.IsAvailableForSale, request.ShowOnWeb, userId);

        // Set notes
        if (!string.IsNullOrWhiteSpace(request.Notes))
        {
            product.SetNotes(request.Notes);
        }

        _context.SalesProducts.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Sales product created: {ProductId} - {ProductCode} for tenant {TenantId}",
            product.Id, product.ProductCode, tenantId.Value);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }

    private async Task<string> GenerateProductCodeAsync(SalesProductType productType, CancellationToken cancellationToken)
    {
        var prefix = productType switch
        {
            SalesProductType.Product => "URN",
            SalesProductType.Service => "HZM",
            SalesProductType.Mixed => "KRM",
            _ => "URN"
        };

        var lastCode = await _context.SalesProducts
            .Where(p => p.ProductCode.StartsWith(prefix))
            .OrderByDescending(p => p.ProductCode)
            .Select(p => p.ProductCode)
            .FirstOrDefaultAsync(cancellationToken);

        int nextNumber = 1;
        if (!string.IsNullOrEmpty(lastCode))
        {
            var numericPart = lastCode.Substring(prefix.Length);
            if (int.TryParse(numericPart, out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }
        }

        return $"{prefix}{nextNumber:D6}";
    }
}

public class UpdateSalesProductCommandHandler : IRequestHandler<UpdateSalesProductCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateSalesProductCommandHandler> _logger;

    public UpdateSalesProductCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateSalesProductCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(UpdateSalesProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();

        // Check for duplicate barcode if changing
        if (!string.IsNullOrWhiteSpace(request.Barcode) && request.Barcode != product.Barcode)
        {
            var existingByBarcode = await _context.SalesProducts
                .AnyAsync(p => p.Barcode == request.Barcode && p.Id != request.Id, cancellationToken);

            if (existingByBarcode)
            {
                return Result<SalesProductDto>.Failure(
                    Error.Conflict("Product.DuplicateBarcode",
                        $"Bu barkoda sahip bir ürün zaten mevcut: '{request.Barcode}'"));
            }
        }

        // Check for duplicate SKU if changing
        if (!string.IsNullOrWhiteSpace(request.SKU) && request.SKU != product.SKU)
        {
            var existingBySku = await _context.SalesProducts
                .AnyAsync(p => p.SKU == request.SKU && p.Id != request.Id, cancellationToken);

            if (existingBySku)
            {
                return Result<SalesProductDto>.Failure(
                    Error.Conflict("Product.DuplicateSKU",
                        $"Bu SKU'ya sahip bir ürün zaten mevcut: '{request.SKU}'"));
            }
        }

        // Update basic info
        if (!string.IsNullOrWhiteSpace(request.Name) || request.Description != null)
        {
            var basicResult = product.UpdateBasicInfo(
                request.Name ?? product.Name,
                request.Description ?? product.Description,
                product.ProductType,
                userId);

            if (!basicResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(basicResult.Error!);
            }
        }

        // Update codes
        product.UpdateCodes(
            request.Barcode ?? product.Barcode,
            request.SKU ?? product.SKU,
            request.GtipCode ?? product.GtipCode,
            userId);

        // Update unit
        if (!string.IsNullOrWhiteSpace(request.Unit) || !string.IsNullOrWhiteSpace(request.UnitDescription))
        {
            var unitResult = product.UpdateUnit(
                request.Unit ?? product.Unit,
                request.UnitDescription ?? product.UnitDescription,
                userId);

            if (!unitResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(unitResult.Error!);
            }
        }

        // Update pricing
        if (request.UnitPrice.HasValue || request.CostPrice.HasValue || request.MinimumSalePrice.HasValue ||
            request.ListPrice.HasValue || request.IsPriceIncludingVat.HasValue)
        {
            var pricingResult = product.UpdatePricing(
                request.UnitPrice ?? product.UnitPrice,
                request.CostPrice ?? product.CostPrice,
                request.MinimumSalePrice ?? product.MinimumSalePrice,
                request.ListPrice ?? product.ListPrice,
                request.Currency ?? product.Currency,
                request.IsPriceIncludingVat ?? product.IsPriceIncludingVat,
                userId);

            if (!pricingResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(pricingResult.Error!);
            }
        }

        // Update VAT info
        if (request.VatRate.HasValue || request.VatExemptionCode != null)
        {
            var vatResult = product.UpdateVatInfo(
                request.VatRate ?? product.VatRate,
                request.VatExemptionCode ?? product.VatExemptionCode,
                request.VatExemptionReason ?? product.VatExemptionReason,
                userId);

            if (!vatResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(vatResult.Error!);
            }
        }

        // Update special consumption tax
        if (request.SpecialConsumptionTaxRate.HasValue || request.SpecialConsumptionTaxAmount.HasValue)
        {
            var sctResult = product.UpdateSpecialConsumptionTax(
                request.SpecialConsumptionTaxRate ?? product.SpecialConsumptionTaxRate,
                request.SpecialConsumptionTaxAmount ?? product.SpecialConsumptionTaxAmount,
                userId);

            if (!sctResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(sctResult.Error!);
            }
        }

        // Update stock settings
        if (request.TrackStock.HasValue || request.MinimumStock.HasValue || request.Weight.HasValue)
        {
            var stockResult = product.UpdateStockInfo(
                request.TrackStock ?? product.TrackStock,
                request.MinimumStock ?? product.MinimumStock,
                request.Weight ?? product.Weight,
                userId);

            if (!stockResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(stockResult.Error!);
            }
        }

        // Update category
        product.UpdateCategory(
            request.Category ?? product.Category,
            request.SubCategory ?? product.SubCategory,
            request.Brand ?? product.Brand,
            request.Tags ?? product.Tags,
            userId);

        // Update images
        if (request.ImageUrl != null || request.ThumbnailUrl != null)
        {
            product.UpdateImages(
                request.ImageUrl ?? product.ImageUrl,
                request.ThumbnailUrl ?? product.ThumbnailUrl,
                userId);
        }

        // Update status
        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value && !product.IsActive)
            {
                var activateResult = product.Activate(userId);
                if (!activateResult.IsSuccess)
                {
                    return Result<SalesProductDto>.Failure(activateResult.Error!);
                }
            }
            else if (!request.IsActive.Value && product.IsActive)
            {
                var deactivateResult = product.Deactivate(userId);
                if (!deactivateResult.IsSuccess)
                {
                    return Result<SalesProductDto>.Failure(deactivateResult.Error!);
                }
            }
        }

        // Update availability
        if (request.IsAvailableForSale.HasValue || request.ShowOnWeb.HasValue)
        {
            product.UpdateAvailability(
                request.IsAvailableForSale ?? product.IsAvailableForSale,
                request.ShowOnWeb ?? product.ShowOnWeb,
                userId);
        }

        // Update notes
        if (request.Notes != null)
        {
            product.SetNotes(request.Notes);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Sales product updated: {ProductId} - {ProductCode}",
            product.Id, product.ProductCode);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class DeleteSalesProductCommandHandler : IRequestHandler<DeleteSalesProductCommand, Result>
{
    private readonly SalesDbContext _context;
    private readonly ILogger<DeleteSalesProductCommandHandler> _logger;

    public DeleteSalesProductCommandHandler(
        SalesDbContext context,
        ILogger<DeleteSalesProductCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSalesProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        // Soft delete using the inherited method
        product.MarkAsDeleted();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Sales product deleted: {ProductId} - {ProductCode}",
            product.Id, product.ProductCode);

        return Result.Success();
    }
}

public class ActivateSalesProductCommandHandler : IRequestHandler<ActivateSalesProductCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ActivateSalesProductCommandHandler> _logger;

    public ActivateSalesProductCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ActivateSalesProductCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(ActivateSalesProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        var result = product.Activate(userId);

        if (!result.IsSuccess)
        {
            return Result<SalesProductDto>.Failure(result.Error!);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales product activated: {ProductId}", product.Id);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class DeactivateSalesProductCommandHandler : IRequestHandler<DeactivateSalesProductCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeactivateSalesProductCommandHandler> _logger;

    public DeactivateSalesProductCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeactivateSalesProductCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(DeactivateSalesProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        var result = product.Deactivate(userId);

        if (!result.IsSuccess)
        {
            return Result<SalesProductDto>.Failure(result.Error!);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales product deactivated: {ProductId}", product.Id);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class AdjustProductStockCommandHandler : IRequestHandler<AdjustProductStockCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<AdjustProductStockCommandHandler> _logger;

    public AdjustProductStockCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<AdjustProductStockCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(AdjustProductStockCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        Result result;

        if (request.Quantity >= 0)
        {
            result = product.IncreaseStock(request.Quantity, userId);
        }
        else
        {
            result = product.DecreaseStock(Math.Abs(request.Quantity), userId);
        }

        if (!result.IsSuccess)
        {
            return Result<SalesProductDto>.Failure(result.Error!);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Product stock adjusted: {ProductId}, Quantity: {Quantity}, Reason: {Reason}",
            product.Id, request.Quantity, request.Reason);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class UpdateProductPricingCommandHandler : IRequestHandler<UpdateProductPricingCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateProductPricingCommandHandler> _logger;

    public UpdateProductPricingCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateProductPricingCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(UpdateProductPricingCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        var result = product.UpdatePricing(
            request.UnitPrice,
            request.CostPrice,
            request.MinimumSalePrice,
            request.ListPrice,
            request.Currency ?? product.Currency,
            request.IsPriceIncludingVat ?? product.IsPriceIncludingVat,
            userId);

        if (!result.IsSuccess)
        {
            return Result<SalesProductDto>.Failure(result.Error!);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Product pricing updated: {ProductId}, NewPrice: {Price}",
            product.Id, request.UnitPrice);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class UpdateProductTaxInfoCommandHandler : IRequestHandler<UpdateProductTaxInfoCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateProductTaxInfoCommandHandler> _logger;

    public UpdateProductTaxInfoCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateProductTaxInfoCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(UpdateProductTaxInfoCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        var result = product.UpdateVatInfo(
            request.VatRate,
            request.VatExemptionCode,
            request.VatExemptionReason,
            userId);

        if (!result.IsSuccess)
        {
            return Result<SalesProductDto>.Failure(result.Error!);
        }

        // Update special consumption tax if provided
        if (request.SpecialConsumptionTaxRate.HasValue || request.SpecialConsumptionTaxAmount.HasValue)
        {
            var sctResult = product.UpdateSpecialConsumptionTax(
                request.SpecialConsumptionTaxRate,
                request.SpecialConsumptionTaxAmount,
                userId);

            if (!sctResult.IsSuccess)
            {
                return Result<SalesProductDto>.Failure(sctResult.Error!);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Product tax info updated: {ProductId}, VatRate: {VatRate}",
            product.Id, request.VatRate);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class SetProductWebVisibilityCommandHandler : IRequestHandler<SetProductWebVisibilityCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<SetProductWebVisibilityCommandHandler> _logger;

    public SetProductWebVisibilityCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<SetProductWebVisibilityCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(SetProductWebVisibilityCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        product.UpdateAvailability(product.IsAvailableForSale, request.ShowOnWeb, userId);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Product web visibility updated: {ProductId}, ShowOnWeb: {ShowOnWeb}",
            product.Id, request.ShowOnWeb);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}

public class SetProductSaleAvailabilityCommandHandler : IRequestHandler<SetProductSaleAvailabilityCommand, Result<SalesProductDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<SetProductSaleAvailabilityCommandHandler> _logger;

    public SetProductSaleAvailabilityCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<SetProductSaleAvailabilityCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesProductDto>> Handle(SetProductSaleAvailabilityCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.SalesProducts
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product == null)
        {
            return Result<SalesProductDto>.Failure(
                Error.NotFound("Product.NotFound", $"ID '{request.Id}' ile ürün bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        product.UpdateAvailability(request.IsAvailableForSale, product.ShowOnWeb, userId);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Product sale availability updated: {ProductId}, IsAvailableForSale: {IsAvailable}",
            product.Id, request.IsAvailableForSale);

        return Result<SalesProductDto>.Success(SalesProductDto.FromEntity(product));
    }
}
