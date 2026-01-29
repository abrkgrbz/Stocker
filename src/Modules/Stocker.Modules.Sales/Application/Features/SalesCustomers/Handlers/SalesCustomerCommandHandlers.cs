using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesCustomers.Commands;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Domain.Enums;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesCustomers.Handlers;

public class CreateSalesCustomerCommandHandler : IRequestHandler<CreateSalesCustomerCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ITenantService _tenantService;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<CreateSalesCustomerCommandHandler> _logger;

    public CreateSalesCustomerCommandHandler(
        SalesDbContext context,
        ITenantService tenantService,
        ICurrentUserService currentUserService,
        ILogger<CreateSalesCustomerCommandHandler> logger)
    {
        _context = context;
        _tenantService = tenantService;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(CreateSalesCustomerCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantService.GetCurrentTenantId();
        if (!tenantId.HasValue)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.Validation("Tenant.Required", "Tenant ID is required"));
        }

        var userId = _currentUserService.UserId?.ToString();

        // Generate customer code if not provided
        var customerCode = request.CustomerCode;
        if (string.IsNullOrWhiteSpace(customerCode))
        {
            customerCode = await GenerateCustomerCodeAsync(tenantId.Value, request.CustomerType, cancellationToken);
        }

        // Check for duplicate tax number
        if (!string.IsNullOrWhiteSpace(request.TaxNumber))
        {
            var existingByTax = await _context.SalesCustomers
                .AnyAsync(c => c.TaxNumber == request.TaxNumber, cancellationToken);

            if (existingByTax)
            {
                return Result<SalesCustomerDto>.Failure(
                    Error.Conflict("Customer.DuplicateTaxNumber",
                        $"Bu vergi numarasına sahip bir müşteri zaten mevcut: '{request.TaxNumber}'"));
            }
        }

        // Check for duplicate identity number
        if (!string.IsNullOrWhiteSpace(request.IdentityNumber))
        {
            var existingById = await _context.SalesCustomers
                .AnyAsync(c => c.IdentityNumber == request.IdentityNumber, cancellationToken);

            if (existingById)
            {
                return Result<SalesCustomerDto>.Failure(
                    Error.Conflict("Customer.DuplicateIdentityNumber",
                        $"Bu TC kimlik numarasına sahip bir müşteri zaten mevcut: '{request.IdentityNumber}'"));
            }
        }

        // Create customer based on type
        Result<SalesCustomer> customerResult;

        switch (request.CustomerType)
        {
            case SalesCustomerType.Corporate:
                customerResult = SalesCustomer.CreateCorporate(
                    tenantId.Value,
                    customerCode,
                    request.CompanyName!,
                    request.TaxNumber!,
                    request.TaxOffice!,
                    request.Email,
                    request.Phone,
                    userId);
                break;

            case SalesCustomerType.Individual:
                customerResult = SalesCustomer.CreateIndividual(
                    tenantId.Value,
                    customerCode,
                    request.FirstName!,
                    request.LastName!,
                    request.IdentityNumber,
                    request.Email,
                    request.Phone,
                    userId);
                break;

            case SalesCustomerType.Retail:
                customerResult = SalesCustomer.CreateRetailCustomer(tenantId.Value, userId);
                break;

            case SalesCustomerType.Foreign:
                customerResult = SalesCustomer.CreateForeign(
                    tenantId.Value,
                    customerCode,
                    request.CompanyName ?? $"{request.FirstName} {request.LastName}".Trim(),
                    request.CountryCode,
                    request.Country,
                    request.TaxNumber,
                    request.Email,
                    userId);
                break;

            default:
                return Result<SalesCustomerDto>.Failure(
                    Error.Validation("Customer.InvalidType", $"Geçersiz müşteri tipi: {request.CustomerType}"));
        }

        if (!customerResult.IsSuccess)
        {
            return Result<SalesCustomerDto>.Failure(customerResult.Error!);
        }

        var customer = customerResult.Value!;

        // Update contact info (for MobilePhone if provided)
        if (!string.IsNullOrWhiteSpace(request.MobilePhone))
        {
            customer.UpdateContactInfo(request.Email, request.Phone, request.MobilePhone, userId);
        }

        // Update address
        if (!string.IsNullOrWhiteSpace(request.AddressLine) || !string.IsNullOrWhiteSpace(request.City))
        {
            customer.UpdateAddress(
                request.AddressLine,
                request.District,
                request.City,
                request.PostalCode,
                request.Country,
                request.CountryCode,
                userId);
        }

        // Update shipping address
        if (!request.ShippingSameAsBilling)
        {
            customer.UpdateShippingAddress(
                request.ShippingAddressLine,
                request.ShippingDistrict,
                request.ShippingCity,
                request.ShippingPostalCode,
                request.ShippingCountry,
                request.ShippingSameAsBilling,
                userId);
        }

        // Update e-invoice info
        if (request.IsEInvoiceRegistered)
        {
            customer.UpdateEInvoiceInfo(true, request.EInvoiceAlias, userId);
        }

        // Update financial info
        customer.UpdateFinancialInfo(
            request.CreditLimit,
            request.DefaultPaymentTermDays,
            request.DefaultVatRate,
            request.Currency,
            request.VatExemptionCode,
            request.VatExemptionReason,
            userId);

        _context.SalesCustomers.Add(customer);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Sales customer created: {CustomerId} - {CustomerCode} for tenant {TenantId}",
            customer.Id, customer.CustomerCode, tenantId.Value);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }

    private async Task<string> GenerateCustomerCodeAsync(Guid tenantId, SalesCustomerType customerType, CancellationToken cancellationToken)
    {
        var prefix = customerType switch
        {
            SalesCustomerType.Corporate => "KUR",
            SalesCustomerType.Individual => "BIR",
            SalesCustomerType.Retail => "RETAIL",
            SalesCustomerType.Foreign => "YD",
            _ => "MUS"
        };

        var lastCode = await _context.SalesCustomers
            .Where(c => c.CustomerCode.StartsWith(prefix))
            .OrderByDescending(c => c.CustomerCode)
            .Select(c => c.CustomerCode)
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

public class UpdateSalesCustomerCommandHandler : IRequestHandler<UpdateSalesCustomerCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateSalesCustomerCommandHandler> _logger;

    public UpdateSalesCustomerCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateSalesCustomerCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(UpdateSalesCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();

        // Check for duplicate tax number if changing
        if (!string.IsNullOrWhiteSpace(request.TaxNumber) && request.TaxNumber != customer.TaxNumber)
        {
            var existingByTax = await _context.SalesCustomers
                .AnyAsync(c => c.TaxNumber == request.TaxNumber && c.Id != request.Id, cancellationToken);

            if (existingByTax)
            {
                return Result<SalesCustomerDto>.Failure(
                    Error.Conflict("Customer.DuplicateTaxNumber",
                        $"Bu vergi numarasına sahip bir müşteri zaten mevcut: '{request.TaxNumber}'"));
            }
        }

        // Update basic info
        var basicInfoResult = customer.UpdateBasicInfo(
            request.CompanyName ?? customer.CompanyName,
            request.FirstName ?? customer.FirstName,
            request.LastName ?? customer.LastName,
            userId);

        if (!basicInfoResult.IsSuccess)
        {
            return Result<SalesCustomerDto>.Failure(basicInfoResult.Error!);
        }

        // Update tax info
        var taxInfoResult = customer.UpdateTaxInfo(
            request.TaxNumber ?? customer.TaxNumber,
            request.TaxOffice ?? customer.TaxOffice,
            request.IdentityNumber ?? customer.IdentityNumber,
            userId);

        if (!taxInfoResult.IsSuccess)
        {
            return Result<SalesCustomerDto>.Failure(taxInfoResult.Error!);
        }

        // Update contact info
        customer.UpdateContactInfo(
            request.Email ?? customer.Email,
            request.Phone ?? customer.Phone,
            request.MobilePhone ?? customer.MobilePhone,
            userId);

        // Update address
        customer.UpdateAddress(
            request.AddressLine ?? customer.AddressLine,
            request.District ?? customer.District,
            request.City ?? customer.City,
            request.PostalCode ?? customer.PostalCode,
            request.Country ?? customer.Country,
            request.CountryCode ?? customer.CountryCode,
            userId);

        // Update shipping address if provided
        if (request.ShippingSameAsBilling.HasValue)
        {
            customer.UpdateShippingAddress(
                request.ShippingAddressLine ?? customer.ShippingAddressLine,
                request.ShippingDistrict ?? customer.ShippingDistrict,
                request.ShippingCity ?? customer.ShippingCity,
                request.ShippingPostalCode ?? customer.ShippingPostalCode,
                request.ShippingCountry ?? customer.ShippingCountry,
                request.ShippingSameAsBilling.Value,
                userId);
        }

        // Update e-invoice info
        if (request.IsEInvoiceRegistered.HasValue)
        {
            customer.UpdateEInvoiceInfo(
                request.IsEInvoiceRegistered.Value,
                request.EInvoiceAlias ?? customer.EInvoiceAlias,
                userId);
        }

        // Update financial info
        if (request.CreditLimit.HasValue || request.DefaultPaymentTermDays.HasValue || request.DefaultVatRate.HasValue)
        {
            var financialResult = customer.UpdateFinancialInfo(
                request.CreditLimit ?? customer.CreditLimit,
                request.DefaultPaymentTermDays ?? customer.DefaultPaymentTermDays,
                request.DefaultVatRate ?? customer.DefaultVatRate,
                request.Currency ?? customer.Currency,
                request.VatExemptionCode ?? customer.VatExemptionCode,
                request.VatExemptionReason ?? customer.VatExemptionReason,
                userId);

            if (!financialResult.IsSuccess)
            {
                return Result<SalesCustomerDto>.Failure(financialResult.Error!);
            }
        }

        // Update status
        if (request.IsActive.HasValue)
        {
            if (request.IsActive.Value && !customer.IsActive)
            {
                var activateResult = customer.Activate(userId);
                if (!activateResult.IsSuccess)
                {
                    return Result<SalesCustomerDto>.Failure(activateResult.Error!);
                }
            }
            else if (!request.IsActive.Value && customer.IsActive)
            {
                var deactivateResult = customer.Deactivate(userId);
                if (!deactivateResult.IsSuccess)
                {
                    return Result<SalesCustomerDto>.Failure(deactivateResult.Error!);
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Sales customer updated: {CustomerId} - {CustomerCode}",
            customer.Id, customer.CustomerCode);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class DeleteSalesCustomerCommandHandler : IRequestHandler<DeleteSalesCustomerCommand, Result>
{
    private readonly SalesDbContext _context;
    private readonly ILogger<DeleteSalesCustomerCommandHandler> _logger;

    public DeleteSalesCustomerCommandHandler(
        SalesDbContext context,
        ILogger<DeleteSalesCustomerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result> Handle(DeleteSalesCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        // Soft delete using the inherited method from TenantAggregateRoot
        customer.MarkAsDeleted();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Sales customer deleted: {CustomerId} - {CustomerCode}",
            customer.Id, customer.CustomerCode);

        return Result.Success();
    }
}

public class ActivateSalesCustomerCommandHandler : IRequestHandler<ActivateSalesCustomerCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<ActivateSalesCustomerCommandHandler> _logger;

    public ActivateSalesCustomerCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<ActivateSalesCustomerCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(ActivateSalesCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        var result = customer.Activate(userId);

        if (!result.IsSuccess)
        {
            return Result<SalesCustomerDto>.Failure(result.Error!);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales customer activated: {CustomerId}", customer.Id);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class DeactivateSalesCustomerCommandHandler : IRequestHandler<DeactivateSalesCustomerCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<DeactivateSalesCustomerCommandHandler> _logger;

    public DeactivateSalesCustomerCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<DeactivateSalesCustomerCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(DeactivateSalesCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        var result = customer.Deactivate(userId);

        if (!result.IsSuccess)
        {
            return Result<SalesCustomerDto>.Failure(result.Error!);
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Sales customer deactivated: {CustomerId}", customer.Id);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class UpdateCustomerBalanceCommandHandler : IRequestHandler<UpdateCustomerBalanceCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ILogger<UpdateCustomerBalanceCommandHandler> _logger;

    public UpdateCustomerBalanceCommandHandler(
        SalesDbContext context,
        ILogger<UpdateCustomerBalanceCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(UpdateCustomerBalanceCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        // UpdateBalance: positive adds to balance, negative subtracts
        var amount = request.IsCredit ? -request.Amount : request.Amount;
        customer.UpdateBalance(amount);

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Customer balance updated: {CustomerId}, Amount: {Amount}, IsCredit: {IsCredit}",
            customer.Id, request.Amount, request.IsCredit);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class SetCustomerBalanceCommandHandler : IRequestHandler<SetCustomerBalanceCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ILogger<SetCustomerBalanceCommandHandler> _logger;

    public SetCustomerBalanceCommandHandler(
        SalesDbContext context,
        ILogger<SetCustomerBalanceCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(SetCustomerBalanceCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        customer.SetBalance(request.Balance);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Customer balance set: {CustomerId}, Balance: {Balance}",
            customer.Id, request.Balance);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class UpdateEInvoiceInfoCommandHandler : IRequestHandler<UpdateEInvoiceInfoCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<UpdateEInvoiceInfoCommandHandler> _logger;

    public UpdateEInvoiceInfoCommandHandler(
        SalesDbContext context,
        ICurrentUserService currentUserService,
        ILogger<UpdateEInvoiceInfoCommandHandler> logger)
    {
        _context = context;
        _currentUserService = currentUserService;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(UpdateEInvoiceInfoCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        var userId = _currentUserService.UserId?.ToString();
        customer.UpdateEInvoiceInfo(request.IsRegistered, request.EInvoiceAlias, userId);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Customer e-invoice info updated: {CustomerId}, IsRegistered: {IsRegistered}",
            customer.Id, request.IsRegistered);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class LinkToCrmCustomerCommandHandler : IRequestHandler<LinkToCrmCustomerCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ILogger<LinkToCrmCustomerCommandHandler> _logger;

    public LinkToCrmCustomerCommandHandler(
        SalesDbContext context,
        ILogger<LinkToCrmCustomerCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(LinkToCrmCustomerCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        customer.LinkToCrmCustomer(request.CrmCustomerId);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Customer linked to CRM: {CustomerId} -> {CrmCustomerId}",
            customer.Id, request.CrmCustomerId);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}

public class UnlinkFromCrmCommandHandler : IRequestHandler<UnlinkFromCrmCommand, Result<SalesCustomerDto>>
{
    private readonly SalesDbContext _context;
    private readonly ILogger<UnlinkFromCrmCommandHandler> _logger;

    public UnlinkFromCrmCommandHandler(
        SalesDbContext context,
        ILogger<UnlinkFromCrmCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SalesCustomerDto>> Handle(UnlinkFromCrmCommand request, CancellationToken cancellationToken)
    {
        var customer = await _context.SalesCustomers
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (customer == null)
        {
            return Result<SalesCustomerDto>.Failure(
                Error.NotFound("Customer.NotFound", $"ID '{request.Id}' ile müşteri bulunamadı"));
        }

        customer.UnlinkFromCrm();
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Customer unlinked from CRM: {CustomerId}", customer.Id);

        return Result<SalesCustomerDto>.Success(SalesCustomerDto.FromEntity(customer));
    }
}
