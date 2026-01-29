using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Cart;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Cart.Commands.AddItemToCart;

public class AddModuleToCartCommandHandler : IRequestHandler<AddModuleToCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public AddModuleToCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(AddModuleToCartCommand request, CancellationToken cancellationToken)
    {
        // Get or create active cart
        var cart = await GetOrCreateCartAsync(request.TenantId, cancellationToken);
        if (cart == null)
        {
            return Result<CartDto>.Failure(Error.Failure("Cart.OlusturulamadiBulunamadi", "Sepet oluşturulamadı veya bulunamadı."));
        }

        // Get module pricing
        var modulePricing = await _context.ModulePricing
            .FirstOrDefaultAsync(m => m.ModuleCode == request.ModuleCode && m.IsActive, cancellationToken);

        if (modulePricing == null)
        {
            return Result<CartDto>.Failure(Error.NotFound("Modul.Bulunamadi", $"'{request.ModuleCode}' modülü bulunamadı veya aktif değil."));
        }

        // Get price based on billing cycle
        var price = modulePricing.GetPriceForCycle(cart.BillingCycle);

        try
        {
            // Check if module already in cart
            if (cart.Items.Any(i => i.ItemType == CartItemType.Module && i.ItemCode == modulePricing.ModuleCode))
            {
                return Result<CartDto>.Failure(Error.Failure("Sepet.ModulZatenVar", $"'{modulePricing.ModuleCode}' modülü zaten sepette."));
            }

            // Create cart item and add to DbSet directly for proper EF tracking
            var cartItem = SubscriptionCartItem.CreateModule(
                cart.Id,
                modulePricing.Id,
                modulePricing.ModuleCode,
                modulePricing.ModuleName,
                price,
                modulePricing.TrialDays);

            _context.SubscriptionCartItems.Add(cartItem);
            await _context.SaveChangesAsync(cancellationToken);

            // Reload cart with items for response
            var updatedCart = await _context.SubscriptionCarts
                .Include(c => c.Items)
                .FirstAsync(c => c.Id == cart.Id, cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(updatedCart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.ModulEklenemedi", ex.Message));
        }
    }

    private async Task<SubscriptionCart?> GetOrCreateCartAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == tenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            cart = SubscriptionCart.Create(tenantId, null, BillingCycle.Aylik);
            _context.SubscriptionCarts.Add(cart);
            // Save cart first before adding items to avoid concurrency issues
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }
}

public class AddBundleToCartCommandHandler : IRequestHandler<AddBundleToCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public AddBundleToCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(AddBundleToCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(request.TenantId, cancellationToken);
        if (cart == null)
        {
            return Result<CartDto>.Failure(Error.Failure("Cart.OlusturulamadiBulunamadi", "Sepet oluşturulamadı veya bulunamadı."));
        }

        var bundle = await _context.ModuleBundles
            .Include(b => b.Modules)
            .FirstOrDefaultAsync(b => b.BundleCode == request.BundleCode && b.IsActive, cancellationToken);

        if (bundle == null)
        {
            return Result<CartDto>.Failure(Error.NotFound("Paket.Bulunamadi", $"'{request.BundleCode}' paketi bulunamadı veya aktif değil."));
        }

        var price = bundle.GetPriceForCycle(cart.BillingCycle);
        var includedModuleCodes = bundle.Modules.Select(m => m.ModuleCode).ToList();

        try
        {
            // Check if bundle already in cart
            if (cart.Items.Any(i => i.ItemType == CartItemType.Bundle && i.ItemCode == bundle.BundleCode))
            {
                return Result<CartDto>.Failure(Error.Failure("Sepet.PaketZatenVar", $"'{bundle.BundleCode}' paketi zaten sepette."));
            }

            // Remove individual modules that are part of this bundle
            var modulesToRemove = cart.Items
                .Where(i => i.ItemType == CartItemType.Module && includedModuleCodes.Contains(i.ItemCode))
                .ToList();

            foreach (var module in modulesToRemove)
            {
                _context.SubscriptionCartItems.Remove(module);
            }

            // Create cart item and add to DbSet directly for proper EF tracking
            var cartItem = SubscriptionCartItem.CreateBundle(
                cart.Id,
                bundle.Id,
                bundle.BundleCode,
                bundle.BundleName,
                price,
                bundle.DiscountPercent,
                includedModuleCodes);

            _context.SubscriptionCartItems.Add(cartItem);
            await _context.SaveChangesAsync(cancellationToken);

            // Reload cart with items for response
            var updatedCart = await _context.SubscriptionCarts
                .Include(c => c.Items)
                .FirstAsync(c => c.Id == cart.Id, cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(updatedCart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.PaketEklenemedi", ex.Message));
        }
    }

    private async Task<SubscriptionCart?> GetOrCreateCartAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == tenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            cart = SubscriptionCart.Create(tenantId, null, BillingCycle.Aylik);
            _context.SubscriptionCarts.Add(cart);
            // Save cart first before adding items to avoid concurrency issues
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }
}

public class AddAddOnToCartCommandHandler : IRequestHandler<AddAddOnToCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public AddAddOnToCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(AddAddOnToCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(request.TenantId, cancellationToken);
        if (cart == null)
        {
            return Result<CartDto>.Failure(Error.Failure("Cart.OlusturulamadiBulunamadi", "Sepet oluşturulamadı veya bulunamadı."));
        }

        var addOn = await _context.AddOns
            .FirstOrDefaultAsync(a => a.Code == request.AddOnCode && a.IsActive, cancellationToken);

        if (addOn == null)
        {
            return Result<CartDto>.Failure(Error.NotFound("EkOzellik.Bulunamadi", $"'{request.AddOnCode}' ek özelliği bulunamadı veya aktif değil."));
        }

        var price = addOn.GetPriceForCycle(cart.BillingCycle);

        try
        {
            // Check if add-on already exists - update quantity if so
            var existingAddOn = cart.Items.FirstOrDefault(i => i.ItemType == CartItemType.AddOn && i.ItemCode == addOn.Code);
            if (existingAddOn != null)
            {
                existingAddOn.UpdateQuantity(existingAddOn.Quantity + request.Quantity);
                await _context.SaveChangesAsync(cancellationToken);
            }
            else
            {
                // Create cart item and add to DbSet directly for proper EF tracking
                var cartItem = SubscriptionCartItem.CreateAddOn(
                    cart.Id,
                    addOn.Id,
                    addOn.Code,
                    addOn.Name,
                    price,
                    request.Quantity,
                    addOn.RequiredModuleCode);

                _context.SubscriptionCartItems.Add(cartItem);
                await _context.SaveChangesAsync(cancellationToken);
            }

            // Reload cart with items for response
            var updatedCart = await _context.SubscriptionCarts
                .Include(c => c.Items)
                .FirstAsync(c => c.Id == cart.Id, cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(updatedCart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.EkOzellikEklenemedi", ex.Message));
        }
    }

    private async Task<SubscriptionCart?> GetOrCreateCartAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == tenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            cart = SubscriptionCart.Create(tenantId, null, BillingCycle.Aylik);
            _context.SubscriptionCarts.Add(cart);
            // Save cart first before adding items to avoid concurrency issues
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }
}

public class AddStoragePlanToCartCommandHandler : IRequestHandler<AddStoragePlanToCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public AddStoragePlanToCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(AddStoragePlanToCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(request.TenantId, cancellationToken);
        if (cart == null)
        {
            return Result<CartDto>.Failure(Error.Failure("Cart.OlusturulamadiBulunamadi", "Sepet oluşturulamadı veya bulunamadı."));
        }

        var storagePlan = await _context.StoragePlans
            .FirstOrDefaultAsync(s => s.Code == request.PlanCode && s.IsActive, cancellationToken);

        if (storagePlan == null)
        {
            return Result<CartDto>.Failure(Error.NotFound("DepolamaPaketi.Bulunamadi", $"'{request.PlanCode}' depolama paketi bulunamadı veya aktif değil."));
        }

        try
        {
            // Remove any existing storage plan (only one can be active)
            var existingPlan = cart.Items.FirstOrDefault(i => i.ItemType == CartItemType.StoragePlan);
            if (existingPlan != null)
            {
                _context.SubscriptionCartItems.Remove(existingPlan);
            }

            // Create cart item and add to DbSet directly for proper EF tracking
            var cartItem = SubscriptionCartItem.CreateStoragePlan(
                cart.Id,
                storagePlan.Id,
                storagePlan.Code,
                storagePlan.Name,
                storagePlan.MonthlyPrice,
                storagePlan.StorageGB);

            _context.SubscriptionCartItems.Add(cartItem);
            await _context.SaveChangesAsync(cancellationToken);

            // Reload cart with items for response
            var updatedCart = await _context.SubscriptionCarts
                .Include(c => c.Items)
                .FirstAsync(c => c.Id == cart.Id, cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(updatedCart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.DepolamaPaketiEklenemedi", ex.Message));
        }
    }

    private async Task<SubscriptionCart?> GetOrCreateCartAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == tenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            cart = SubscriptionCart.Create(tenantId, null, BillingCycle.Aylik);
            _context.SubscriptionCarts.Add(cart);
            // Save cart first before adding items to avoid concurrency issues
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }
}

public class AddUsersToCartCommandHandler : IRequestHandler<AddUsersToCartCommand, Result<CartDto>>
{
    private readonly IMasterDbContext _context;

    public AddUsersToCartCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CartDto>> Handle(AddUsersToCartCommand request, CancellationToken cancellationToken)
    {
        var cart = await GetOrCreateCartAsync(request.TenantId, cancellationToken);
        if (cart == null)
        {
            return Result<CartDto>.Failure(Error.Failure("Cart.OlusturulamadiBulunamadi", "Sepet oluşturulamadı veya bulunamadı."));
        }

        var userTier = await _context.UserTiers
            .FirstOrDefaultAsync(u => u.Code == request.TierCode && u.IsActive, cancellationToken);

        if (userTier == null)
        {
            return Result<CartDto>.Failure(Error.NotFound("KullaniciPaketi.Bulunamadi", $"'{request.TierCode}' kullanıcı paketi bulunamadı veya aktif değil."));
        }

        if (request.UserCount < userTier.MinUsers || request.UserCount > userTier.MaxUsers)
        {
            return Result<CartDto>.Failure(Error.Validation("KullaniciSayisi.GecersizAralik",
                $"Kullanıcı sayısı '{userTier.Name}' paketi için {userTier.MinUsers} ile {userTier.MaxUsers} arasında olmalıdır."));
        }

        try
        {
            // Remove any existing user tier (replace with new selection)
            var existingUsers = cart.Items.FirstOrDefault(i => i.ItemType == CartItemType.Users);
            if (existingUsers != null)
            {
                _context.SubscriptionCartItems.Remove(existingUsers);
            }

            // Create cart item and add to DbSet directly for proper EF tracking
            var cartItem = SubscriptionCartItem.CreateUsers(
                cart.Id,
                userTier.Id,
                userTier.Code,
                userTier.Name,
                userTier.PricePerUser,
                request.UserCount);

            _context.SubscriptionCartItems.Add(cartItem);
            await _context.SaveChangesAsync(cancellationToken);

            // Reload cart with items for response
            var updatedCart = await _context.SubscriptionCarts
                .Include(c => c.Items)
                .FirstAsync(c => c.Id == cart.Id, cancellationToken);

            return Result<CartDto>.Success(CartMapper.MapToDto(updatedCart));
        }
        catch (InvalidOperationException ex)
        {
            return Result<CartDto>.Failure(Error.Failure("Sepet.KullaniciEklenemedi", ex.Message));
        }
    }

    private async Task<SubscriptionCart?> GetOrCreateCartAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        var cart = await _context.SubscriptionCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.TenantId == tenantId &&
                c.Status == CartStatus.Active,
                cancellationToken);

        if (cart == null)
        {
            cart = SubscriptionCart.Create(tenantId, null, BillingCycle.Aylik);
            _context.SubscriptionCarts.Add(cart);
            // Save cart first before adding items to avoid concurrency issues
            await _context.SaveChangesAsync(cancellationToken);
        }

        return cart;
    }
}
