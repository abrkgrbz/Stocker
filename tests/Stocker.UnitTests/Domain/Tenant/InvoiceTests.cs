using System;
using System.Linq;
using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class InvoiceTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _customerId = Guid.NewGuid();
    private readonly DateTime _invoiceDate = DateTime.UtcNow;
    private readonly DateTime _dueDate = DateTime.UtcNow.AddDays(30);

    [Fact]
    public void Create_WithValidData_ShouldCreateInvoice()
    {
        // Act
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        // Assert
        invoice.Should().NotBeNull();
        invoice.TenantId.Should().Be(_tenantId);
        invoice.InvoiceNumber.Should().Be("INV-2024-001");
        invoice.CustomerId.Should().Be(_customerId);
        invoice.InvoiceDate.Should().BeCloseTo(_invoiceDate, TimeSpan.FromSeconds(1));
        invoice.DueDate.Should().BeCloseTo(_dueDate, TimeSpan.FromSeconds(1));
        invoice.Status.Should().Be(InvoiceStatus.Draft);
        invoice.SubTotal.Amount.Should().Be(0);
        invoice.TaxAmount.Amount.Should().Be(0);
        invoice.DiscountAmount.Amount.Should().Be(0);
        invoice.TotalAmount.Amount.Should().Be(0);
        invoice.Items.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithNullInvoiceNumber_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Invoice.Create(
            _tenantId,
            null!,
            _customerId,
            _invoiceDate,
            _dueDate
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Invoice number cannot be empty*");
    }

    [Fact]
    public void Create_WithEmptyInvoiceNumber_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Invoice.Create(
            _tenantId,
            "",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Invoice number cannot be empty*");
    }

    [Fact]
    public void Create_WithWhitespaceInvoiceNumber_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Invoice.Create(
            _tenantId,
            "   ",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Invoice number cannot be empty*");
    }

    [Fact]
    public void Create_WithDueDateBeforeInvoiceDate_ShouldThrowArgumentException()
    {
        // Act & Assert
        var act = () => Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _invoiceDate.AddDays(-1)
        );

        act.Should().Throw<ArgumentException>()
            .WithMessage("*Due date cannot be before invoice date*");
    }

    [Fact]
    public void AddItem_ToDraftInvoice_ShouldAddItemAndCalculateTotals()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var unitPrice = Money.Create(100, "TRY");
        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            2,
            unitPrice
        );

        // Act
        invoice.AddItem(item);

        // Assert
        invoice.Items.Should().HaveCount(1);
        invoice.Items.Should().Contain(item);
        invoice.SubTotal.Amount.Should().Be(200); // 100 * 2
        invoice.TotalAmount.Amount.Should().Be(200);
    }

    [Fact]
    public void AddItem_ToNonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item1 = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item1);
        invoice.Send(); // Change status from Draft

        var item2 = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 2",
            1,
            Money.Create(50, "TRY")
        );

        // Act & Assert
        var act = () => invoice.AddItem(item2);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot add items to a non-draft invoice*");
    }

    [Fact]
    public void RemoveItem_FromDraftInvoice_ShouldRemoveItemAndRecalculateTotals()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item1 = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        var item2 = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 2",
            1,
            Money.Create(50, "TRY")
        );

        invoice.AddItem(item1);
        invoice.AddItem(item2);

        // Act
        invoice.RemoveItem(item1.Id);

        // Assert
        invoice.Items.Should().HaveCount(1);
        invoice.Items.Should().NotContain(item1);
        invoice.Items.Should().Contain(item2);
        invoice.SubTotal.Amount.Should().Be(50);
        invoice.TotalAmount.Amount.Should().Be(50);
    }

    [Fact]
    public void RemoveItem_FromNonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        // Act & Assert
        var act = () => invoice.RemoveItem(item.Id);

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot remove items from a non-draft invoice*");
    }

    [Fact]
    public void RemoveItem_NonExistingItem_ShouldNotThrow()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        // Act & Assert
        var act = () => invoice.RemoveItem(Guid.NewGuid());

        act.Should().NotThrow();
    }

    [Fact]
    public void SetDiscount_OnDraftInvoice_ShouldUpdateDiscountAndRecalculateTotal()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        var discount = Money.Create(20, "TRY");

        // Act
        invoice.SetDiscount(discount);

        // Assert
        invoice.DiscountAmount.Amount.Should().Be(20);
        invoice.SubTotal.Amount.Should().Be(200);
        invoice.TotalAmount.Amount.Should().Be(180); // 200 - 20
    }

    [Fact]
    public void SetDiscount_OnNonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        // Act & Assert
        var act = () => invoice.SetDiscount(Money.Create(10, "TRY"));

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot modify a non-draft invoice*");
    }

    [Fact]
    public void SetTax_OnDraftInvoice_ShouldUpdateTaxAndRecalculateTotal()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        var tax = Money.Create(36, "TRY"); // 18% tax

        // Act
        invoice.SetTax(tax);

        // Assert
        invoice.TaxAmount.Amount.Should().Be(36);
        invoice.SubTotal.Amount.Should().Be(200);
        invoice.TotalAmount.Amount.Should().Be(236); // 200 + 36
    }

    [Fact]
    public void SetTax_OnNonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        // Act & Assert
        var act = () => invoice.SetTax(Money.Create(18, "TRY"));

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot modify a non-draft invoice*");
    }

    [Fact]
    public void Send_DraftInvoiceWithItems_ShouldChangeStatusToSent()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);

        // Act
        invoice.Send();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Sent);
    }

    [Fact]
    public void Send_NonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        // Act & Assert
        var act = () => invoice.Send();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Only draft invoices can be sent*");
    }

    [Fact]
    public void Send_InvoiceWithNoItems_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        // Act & Assert
        var act = () => invoice.Send();

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot send an invoice with no items*");
    }

    [Fact]
    public void MarkAsPaid_UnpaidInvoice_ShouldChangeStatusToPaid()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        var paidDate = DateTime.UtcNow;
        var paymentMethod = "Credit Card";
        var paymentReference = "PAY-123456";

        // Act
        invoice.MarkAsPaid(paidDate, paymentMethod, paymentReference);

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Paid);
        invoice.PaidDate.Should().BeCloseTo(paidDate, TimeSpan.FromSeconds(1));
        invoice.PaymentMethod.Should().Be(paymentMethod);
        invoice.PaymentReference.Should().Be(paymentReference);
    }

    [Fact]
    public void MarkAsPaid_AlreadyPaidInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();
        invoice.MarkAsPaid(DateTime.UtcNow, "Credit Card");

        // Act & Assert
        var act = () => invoice.MarkAsPaid(DateTime.UtcNow, "Cash");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Invoice is already paid*");
    }

    [Fact]
    public void MarkAsPaid_CancelledInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();
        invoice.Cancel("Customer cancelled");

        // Act & Assert
        var act = () => invoice.MarkAsPaid(DateTime.UtcNow, "Credit Card");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot mark a cancelled invoice as paid*");
    }

    [Fact]
    public void Cancel_UnpaidInvoice_ShouldChangeStatusToCancelled()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        var reason = "Customer cancelled the order";

        // Act
        invoice.Cancel(reason);

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Cancelled);
        invoice.Notes.Should().Contain("[CANCELLED]");
        invoice.Notes.Should().Contain(reason);
    }

    [Fact]
    public void Cancel_PaidInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();
        invoice.MarkAsPaid(DateTime.UtcNow, "Credit Card");

        // Act & Assert
        var act = () => invoice.Cancel("Trying to cancel");

        act.Should().Throw<InvalidOperationException>()
            .WithMessage("*Cannot cancel a paid invoice*");
    }

    [Fact]
    public void MarkAsOverdue_SentInvoiceAfterDueDate_ShouldChangeStatusToOverdue()
    {
        // Arrange
        var pastDueDate = DateTime.UtcNow.AddDays(-5);
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            DateTime.UtcNow.AddDays(-35),
            pastDueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        // Act
        invoice.MarkAsOverdue();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Overdue);
    }

    [Fact]
    public void MarkAsOverdue_SentInvoiceBeforeDueDate_ShouldNotChangeStatus()
    {
        // Arrange
        var futureDueDate = DateTime.UtcNow.AddDays(5);
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            futureDueDate
        );

        var item = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            1,
            Money.Create(100, "TRY")
        );

        invoice.AddItem(item);
        invoice.Send();

        // Act
        invoice.MarkAsOverdue();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Sent);
    }

    [Fact]
    public void SetNotes_ShouldUpdateNotes()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var notes = "Please pay within 30 days";

        // Act
        invoice.SetNotes(notes);

        // Assert
        invoice.Notes.Should().Be(notes);
    }

    [Fact]
    public void SetTerms_ShouldUpdateTerms()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var terms = "Net 30 payment terms";

        // Act
        invoice.SetTerms(terms);

        // Assert
        invoice.Terms.Should().Be(terms);
    }

    [Fact]
    public void ComplexInvoice_WithMultipleItemsDiscountAndTax_ShouldCalculateCorrectTotal()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            "INV-2024-001",
            _customerId,
            _invoiceDate,
            _dueDate
        );

        var item1 = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 1",
            2,
            Money.Create(100, "TRY")
        );

        var item2 = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 2",
            3,
            Money.Create(50, "TRY")
        );

        var item3 = InvoiceItem.Create(
            _tenantId,
            invoice.Id,
            Guid.NewGuid(),
            "Product 3",
            1,
            Money.Create(150, "TRY")
        );

        invoice.AddItem(item1); // 200
        invoice.AddItem(item2); // 150
        invoice.AddItem(item3); // 150
        // SubTotal = 500

        invoice.SetDiscount(Money.Create(50, "TRY"));
        invoice.SetTax(Money.Create(81, "TRY")); // 18% of 450

        // Assert
        invoice.SubTotal.Amount.Should().Be(500);
        invoice.DiscountAmount.Amount.Should().Be(50);
        invoice.TaxAmount.Amount.Should().Be(81);
        invoice.TotalAmount.Amount.Should().Be(531); // 500 + 81 - 50
    }
}