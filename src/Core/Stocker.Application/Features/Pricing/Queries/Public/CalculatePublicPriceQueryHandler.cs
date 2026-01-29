using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Pricing.Queries.Public;

/// <summary>
/// Handler for CalculatePublicPriceQuery
/// </summary>
public class CalculatePublicPriceQueryHandler : IRequestHandler<CalculatePublicPriceQuery, Result<CalculatePublicPriceResponse>>
{
    private readonly IPricingService _pricingService;
    private readonly ILogger<CalculatePublicPriceQueryHandler> _logger;

    private const decimal TAX_RATE = 0.20m; // 20% KDV
    private const decimal YEARLY_DISCOUNT = 0.20m; // 20% yearly discount
    private const decimal DEFAULT_PRICE_PER_USER = 29m;
    private const int BUNDLE_INCLUDED_USERS = 5;
    private const int DEFAULT_INCLUDED_USERS = 1;

    public CalculatePublicPriceQueryHandler(
        IPricingService pricingService,
        ILogger<CalculatePublicPriceQueryHandler> logger)
    {
        _pricingService = pricingService;
        _logger = logger;
    }

    public async Task<Result<CalculatePublicPriceResponse>> Handle(
        CalculatePublicPriceQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var isYearly = request.BillingCycle?.ToLower() == "yearly";
            var billingCycle = isYearly ? BillingCycle.Yillik : BillingCycle.Aylik;

            decimal subtotal = 0;
            decimal bundlePrice = 0;
            decimal modulesPrice = 0;
            decimal addOnsPrice = 0;
            decimal userPrice = 0;
            int includedUsers = DEFAULT_INCLUDED_USERS;
            decimal pricePerAdditionalUser = DEFAULT_PRICE_PER_USER;
            var lineItems = new List<PriceLineItemDto>();

            // Calculate bundle price if selected
            if (!string.IsNullOrEmpty(request.BundleCode))
            {
                var bundleResult = await _pricingService.CalculateBundlePriceAsync(
                    request.BundleCode, billingCycle, cancellationToken);

                bundlePrice = bundleResult.Total;
                subtotal += bundlePrice;
                includedUsers = BUNDLE_INCLUDED_USERS;

                lineItems.Add(new PriceLineItemDto
                {
                    Code = bundleResult.BundleCode,
                    Name = bundleResult.BundleName,
                    Type = "Bundle",
                    UnitPrice = bundlePrice,
                    Quantity = 1,
                    TotalPrice = bundlePrice
                });
            }

            // Calculate individual module prices if no bundle
            if (request.ModuleCodes?.Any() == true && string.IsNullOrEmpty(request.BundleCode))
            {
                var modulesResult = await _pricingService.CalculateModulesPriceAsync(
                    request.ModuleCodes, billingCycle, cancellationToken);

                modulesPrice = modulesResult.Total;
                subtotal += modulesPrice;

                foreach (var item in modulesResult.LineItems)
                {
                    lineItems.Add(new PriceLineItemDto
                    {
                        Code = item.Code,
                        Name = item.Name,
                        Type = "Module",
                        UnitPrice = item.UnitPrice,
                        Quantity = item.Quantity,
                        TotalPrice = item.TotalPrice
                    });
                }
            }

            // Calculate add-on prices
            if (request.AddOnCodes?.Any() == true)
            {
                var addOnsResult = await _pricingService.CalculateAddOnsPriceAsync(
                    request.AddOnCodes, billingCycle, cancellationToken);

                addOnsPrice = addOnsResult.Total;
                subtotal += addOnsPrice;

                foreach (var item in addOnsResult.LineItems)
                {
                    lineItems.Add(new PriceLineItemDto
                    {
                        Code = item.Code,
                        Name = item.Name,
                        Type = "AddOn",
                        UnitPrice = item.UnitPrice,
                        Quantity = item.Quantity,
                        TotalPrice = item.TotalPrice
                    });
                }
            }

            // Calculate additional user cost
            var additionalUsers = Math.Max(0, request.UserCount - includedUsers);
            if (additionalUsers > 0)
            {
                userPrice = additionalUsers * pricePerAdditionalUser;
                subtotal += userPrice;

                lineItems.Add(new PriceLineItemDto
                {
                    Code = "ADDITIONAL_USERS",
                    Name = $"Ek Kullanıcı ({additionalUsers} kişi)",
                    Type = "Users",
                    UnitPrice = pricePerAdditionalUser,
                    Quantity = additionalUsers,
                    TotalPrice = userPrice
                });
            }

            // Calculate discount (already applied in yearly prices, but show it)
            decimal discount = 0;
            if (isYearly)
            {
                var monthlyEquivalent = subtotal / (1 - YEARLY_DISCOUNT);
                discount = monthlyEquivalent - subtotal;
            }

            // Calculate tax
            var tax = subtotal * TAX_RATE;
            var total = subtotal + tax;

            return Result<CalculatePublicPriceResponse>.Success(new CalculatePublicPriceResponse
            {
                Success = true,
                Subtotal = subtotal,
                Discount = discount,
                Tax = tax,
                Total = total,
                Currency = "TRY",
                BillingCycle = isYearly ? "Yıllık" : "Aylık",
                BasePackagePrice = 0,
                ModulesPrice = modulesPrice,
                BundlePrice = bundlePrice,
                AddOnsPrice = addOnsPrice,
                UserPrice = userPrice,
                IncludedUsers = includedUsers,
                AdditionalUsers = additionalUsers,
                PricePerAdditionalUser = pricePerAdditionalUser,
                LineItems = lineItems
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating public price");
            return Result<CalculatePublicPriceResponse>.Failure(Error.Failure("Pricing.CalculationFailed", "Fiyat hesaplanamadı."));
        }
    }
}
