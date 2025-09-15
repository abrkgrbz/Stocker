using System;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Primitives;
using Stocker.SharedKernel.MultiTenancy;

namespace Stocker.Domain.Tenant.Entities;

public class Customer : Entity, ITenantEntity
{
    public Guid TenantId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public Email Email { get; private set; } = null!;
    public PhoneNumber Phone { get; private set; } = null!;
    public Address Address { get; private set; } = null!;
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }
    public decimal CreditLimit { get; private set; }
    public decimal CurrentBalance { get; private set; }
    public bool IsActive { get; private set; } = true;

    protected Customer() { }

    private Customer(
        Guid tenantId,
        string name,
        Email email,
        PhoneNumber phone,
        Address address) : base(Guid.NewGuid())
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Customer name cannot be empty", nameof(name));

        TenantId = tenantId;
        Name = name;
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
        Address = address ?? throw new ArgumentNullException(nameof(address));
        IsActive = true;
        CurrentBalance = 0;
        CreditLimit = 0;
    }

    public static Customer Create(
        Guid tenantId,
        string name,
        Email email,
        PhoneNumber phone,
        Address address)
    {
        return new Customer(tenantId, name, email, phone, address);
    }

    public void UpdateContactInfo(Email email, PhoneNumber phone)
    {
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
    }

    public void UpdateAddress(Address address)
    {
        Address = address ?? throw new ArgumentNullException(nameof(address));
    }

    public void SetTaxInfo(string taxNumber, string taxOffice)
    {
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
    }

    public void SetCreditLimit(decimal creditLimit)
    {
        if (creditLimit < 0)
            throw new ArgumentException("Credit limit cannot be negative", nameof(creditLimit));

        CreditLimit = creditLimit;
    }

    public void UpdateBalance(decimal amount)
    {
        CurrentBalance += amount;
    }

    public void Activate()
    {
        IsActive = true;
    }

    public void Deactivate()
    {
        IsActive = false;
    }

    public bool CanMakePurchase(decimal amount)
    {
        if (!IsActive)
            return false;

        return CurrentBalance + amount <= CreditLimit;
    }
    
    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Customer name cannot be empty", nameof(name));
        Name = name;
    }
    
    public void UpdateEmail(Email email)
    {
        Email = email ?? throw new ArgumentNullException(nameof(email));
    }
    
    public void UpdatePhone(PhoneNumber phone)
    {
        Phone = phone ?? throw new ArgumentNullException(nameof(phone));
    }
    
    public void SetTenantId(Guid tenantId)
    {
        TenantId = tenantId;
    }
}