using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Primitives;

namespace Stocker.Domain.Master.Entities;

public sealed class InvoiceItem : Entity
{
    public Guid InvoiceId { get; private set; }
    public string Description { get; private set; }
    public int Quantity { get; private set; }
    public Money UnitPrice { get; private set; }
    public Money LineTotal { get; private set; }

    private InvoiceItem() { } // EF Constructor

    public InvoiceItem(
        Guid invoiceId,
        string description,
        int quantity,
        Money unitPrice,
        Money lineTotal)
    {
        Id = Guid.NewGuid();
        InvoiceId = invoiceId;
        Description = description ?? throw new ArgumentNullException(nameof(description));
        Quantity = quantity;
        UnitPrice = unitPrice ?? throw new ArgumentNullException(nameof(unitPrice));
        LineTotal = lineTotal ?? throw new ArgumentNullException(nameof(lineTotal));

        if (quantity <= 0)
        {
            throw new ArgumentException("Quantity must be greater than zero.", nameof(quantity));
        }
    }
}