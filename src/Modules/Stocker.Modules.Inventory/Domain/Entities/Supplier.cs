using Stocker.SharedKernel.Common;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Domain.Events;

namespace Stocker.Modules.Inventory.Domain.Entities;

public class Supplier : BaseEntity
{
    /// <summary>
    /// Purchase modülündeki karşılık gelen Supplier'ın ID'si.
    /// Her iki modül aktif olduğunda senkronize edilir.
    /// </summary>
    public Guid? PurchaseSupplierId { get; private set; }

    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? TaxNumber { get; private set; }
    public string? TaxOffice { get; private set; }
    public Email? Email { get; private set; }
    public PhoneNumber? Phone { get; private set; }
    public PhoneNumber? Fax { get; private set; }
    public Address? Address { get; private set; }
    public string? Website { get; private set; }
    public string? ContactPerson { get; private set; }
    public string? ContactPhone { get; private set; }
    public string? ContactEmail { get; private set; }
    public decimal CreditLimit { get; private set; }
    public int PaymentTerm { get; private set; }
    public bool IsActive { get; private set; }

    public virtual ICollection<Product> Products { get; private set; }

    protected Supplier() { }

    public Supplier(string code, string name)
    {
        Code = code;
        Name = name;
        IsActive = true;
        CreditLimit = 0;
        PaymentTerm = 30;
        Products = new List<Product>();
    }

    /// <summary>
    /// Tedarikçi oluşturulduktan sonra domain event fırlatır.
    /// </summary>
    public void RaiseCreatedEvent()
    {
        RaiseDomainEvent(new SupplierCreatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name));
    }

    public void UpdateSupplierInfo(
        string name,
        string? taxNumber,
        string? taxOffice,
        Email? email,
        PhoneNumber? phone,
        Address? address)
    {
        Name = name;
        TaxNumber = taxNumber;
        TaxOffice = taxOffice;
        Email = email;
        Phone = phone;
        Address = address;

        RaiseDomainEvent(new SupplierUpdatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name,
            TaxNumber));
    }

    public void SetContactInfo(
        string? contactPerson,
        string? contactPhone,
        string? contactEmail)
    {
        ContactPerson = contactPerson;
        ContactPhone = contactPhone;
        ContactEmail = contactEmail;
    }

    public void SetCreditInfo(decimal creditLimit, int paymentTerm)
    {
        CreditLimit = creditLimit;
        PaymentTerm = paymentTerm;

        RaiseDomainEvent(new SupplierCreditInfoChangedDomainEvent(
            Id,
            TenantId,
            Code,
            CreditLimit,
            PaymentTerm));
    }

    public void Activate()
    {
        IsActive = true;

        RaiseDomainEvent(new SupplierActivatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name));
    }

    public void Deactivate()
    {
        IsActive = false;

        RaiseDomainEvent(new SupplierDeactivatedDomainEvent(
            Id,
            TenantId,
            Code,
            Name));
    }

    /// <summary>
    /// Inventory Supplier'ı Purchase Supplier ile ilişkilendirir.
    /// Her iki modül aktifken senkronize kalır.
    /// </summary>
    public void LinkToPurchaseSupplier(Guid purchaseSupplierId)
    {
        PurchaseSupplierId = purchaseSupplierId;
    }

    /// <summary>
    /// Purchase Supplier ilişkisini kaldırır.
    /// </summary>
    public void UnlinkFromPurchaseSupplier()
    {
        PurchaseSupplierId = null;
    }
}
