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
    private readonly string _invoiceNumber = "INV-2024-001";
    private readonly DateTime _invoiceDate = DateTime.UtcNow;
    private readonly DateTime _dueDate = DateTime.UtcNow.AddDays(30);

    [Fact]
    public void Create_WithValidData_ShouldCreateInvoice()
    {
        // Act
        var invoice = Invoice.Create(_tenantId, _invoiceNumber, _customerId, _invoiceDate, _dueDate);

        // Assert
        invoice.Should().NotBeNull();
        invoice.TenantId.Should().Be(_tenantId);
        invoice.InvoiceNumber.Should().Be(_invoiceNumber);
        invoice.CustomerId.Should().Be(_customerId);
        invoice.InvoiceDate.Should().Be(_invoiceDate);
        invoice.DueDate.Should().Be(_dueDate);
        invoice.Status.Should().Be(InvoiceStatus.Draft);
        invoice.SubTotal.Amount.Should().Be(0);
        invoice.TotalAmount.Amount.Should().Be(0);
    }

    [Fact]
    public void Create_WithEmptyInvoiceNumber_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Invoice.Create(_tenantId, "", _customerId, _invoiceDate, _dueDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Invoice number cannot be empty.*");
    }

    [Fact]
    public void Create_WithDueDateBeforeInvoiceDate_ShouldThrowArgumentException()
    {
        // Arrange
        var invalidDueDate = _invoiceDate.AddDays(-1);

        // Act
        var action = () => Invoice.Create(_tenantId, _invoiceNumber, _customerId, _invoiceDate, invalidDueDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Due date cannot be before invoice date.*");
    }

    [Fact]
    public void AddItem_ToDraftInvoice_ShouldAddItemAndCalculateTotals()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var item = CreateInvoiceItem();

        // Act
        invoice.AddItem(item);

        // Assert
        invoice.Items.Should().HaveCount(1);
        invoice.Items.Should().Contain(item);
        invoice.SubTotal.Should().Be(item.TotalPrice);
        invoice.TotalAmount.Should().Be(item.TotalPrice);
    }

    [Fact]
    public void AddItem_ToSentInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();
        var newItem = CreateInvoiceItem();

        // Act
        var action = () => invoice.AddItem(newItem);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot add items to a non-draft invoice.");
    }

    [Fact]
    public void RemoveItem_FromDraftInvoice_ShouldRemoveItemAndRecalculate()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var item1 = CreateInvoiceItem();
        var item2 = CreateInvoiceItem();
        invoice.AddItem(item1);
        invoice.AddItem(item2);

        // Act
        invoice.RemoveItem(item1.Id);

        // Assert
        invoice.Items.Should().HaveCount(1);
        invoice.Items.Should().NotContain(item1);
        invoice.Items.Should().Contain(item2);
    }

    [Fact]
    public void SetDiscount_OnDraftInvoice_ShouldUpdateTotalAmount()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var item = CreateInvoiceItem();
        invoice.AddItem(item);
        var discount = Money.Create(50m, "TRY");

        // Act
        invoice.SetDiscount(discount);

        // Assert
        invoice.DiscountAmount.Should().Be(discount);
        invoice.TotalAmount.Should().Be(invoice.SubTotal.Subtract(discount));
    }

    [Fact]
    public void SetTax_OnDraftInvoice_ShouldUpdateTotalAmount()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var item = CreateInvoiceItem();
        invoice.AddItem(item);
        var tax = Money.Create(100m, "TRY");

        // Act
        invoice.SetTax(tax);

        // Assert
        invoice.TaxAmount.Should().Be(tax);
        invoice.TotalAmount.Should().Be(invoice.SubTotal.Add(tax));
    }

    [Fact]
    public void Send_DraftInvoiceWithItems_ShouldChangeStatusToSent()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());

        // Act
        invoice.Send();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Sent);
    }

    [Fact]
    public void Send_DraftInvoiceWithoutItems_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateDraftInvoice();

        // Act
        var action = () => invoice.Send();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot send an invoice with no items.");
    }

    [Fact]
    public void Send_AlreadySentInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();

        // Act
        var action = () => invoice.Send();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only draft invoices can be sent.");
    }

    [Fact]
    public void MarkAsPaid_SentInvoice_ShouldUpdateStatusAndPaymentInfo()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();
        var paidDate = DateTime.UtcNow;
        var paymentMethod = "Credit Card";
        var paymentReference = "REF123";

        // Act
        invoice.MarkAsPaid(paidDate, paymentMethod, paymentReference);

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Paid);
        invoice.PaidDate.Should().Be(paidDate);
        invoice.PaymentMethod.Should().Be(paymentMethod);
        invoice.PaymentReference.Should().Be(paymentReference);
    }

    [Fact]
    public void MarkAsPaid_AlreadyPaidInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();
        invoice.MarkAsPaid(DateTime.UtcNow, "Cash");

        // Act
        var action = () => invoice.MarkAsPaid(DateTime.UtcNow, "Credit Card");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Invoice is already paid.");
    }

    [Fact]
    public void MarkAsPaid_CancelledInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();
        invoice.Cancel("Customer request");

        // Act
        var action = () => invoice.MarkAsPaid(DateTime.UtcNow, "Cash");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot mark a cancelled invoice as paid.");
    }

    [Fact]
    public void Cancel_SentInvoice_ShouldUpdateStatusAndNotes()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();
        var reason = "Customer request";

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
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();
        invoice.MarkAsPaid(DateTime.UtcNow, "Cash");

        // Act
        var action = () => invoice.Cancel("Customer request");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot cancel a paid invoice.");
    }

    [Fact]
    public void MarkAsOverdue_SentInvoiceAfterDueDate_ShouldChangeStatusToOverdue()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            _invoiceNumber,
            _customerId,
            DateTime.UtcNow.AddDays(-35),
            DateTime.UtcNow.AddDays(-5));
        invoice.AddItem(CreateInvoiceItem());
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
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();

        // Act
        invoice.MarkAsOverdue();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Sent);
    }

    [Fact]
    public void UpdateInvoiceNumber_DraftInvoice_ShouldUpdateNumber()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var newNumber = "INV-2024-002";

        // Act
        invoice.UpdateInvoiceNumber(newNumber);

        // Assert
        invoice.InvoiceNumber.Should().Be(newNumber);
    }

    [Fact]
    public void UpdateInvoiceNumber_SentInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        invoice.AddItem(CreateInvoiceItem());
        invoice.Send();

        // Act
        var action = () => invoice.UpdateInvoiceNumber("INV-2024-002");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot update invoice number on a non-draft invoice.");
    }

    [Fact]
    public void UpdateDates_DraftInvoice_ShouldUpdateDates()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var newInvoiceDate = DateTime.UtcNow.AddDays(1);
        var newDueDate = DateTime.UtcNow.AddDays(45);

        // Act
        invoice.UpdateDates(newInvoiceDate, newDueDate);

        // Assert
        invoice.InvoiceDate.Should().Be(newInvoiceDate);
        invoice.DueDate.Should().Be(newDueDate);
    }

    [Fact]
    public void UpdateDates_WithInvalidDates_ShouldThrowArgumentException()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var newInvoiceDate = DateTime.UtcNow.AddDays(10);
        var newDueDate = DateTime.UtcNow.AddDays(5);

        // Act
        var action = () => invoice.UpdateDates(newInvoiceDate, newDueDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Due date cannot be before invoice date.*");
    }

    [Fact]
    public void SetNotes_ShouldUpdateNotes()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var notes = "Special discount applied";

        // Act
        invoice.SetNotes(notes);

        // Assert
        invoice.Notes.Should().Be(notes);
    }

    [Fact]
    public void SetTerms_ShouldUpdateTerms()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var terms = "Payment due within 30 days";

        // Act
        invoice.SetTerms(terms);

        // Assert
        invoice.Terms.Should().Be(terms);
    }

    [Fact]
    public void SetTenantId_ShouldUpdateTenantId()
    {
        // Arrange
        var invoice = CreateDraftInvoice();
        var newTenantId = Guid.NewGuid();

        // Act
        invoice.SetTenantId(newTenantId);

        // Assert
        invoice.TenantId.Should().Be(newTenantId);
    }

    private Invoice CreateDraftInvoice()
    {
        return Invoice.Create(_tenantId, _invoiceNumber, _customerId, _invoiceDate, _dueDate);
    }

    private InvoiceItem CreateInvoiceItem()
    {
        var unitPrice = Money.Create(500m, "TRY");
        return InvoiceItem.Create(
            _tenantId,
            Guid.NewGuid(),
            Guid.NewGuid(),
            "Test Product",
            2,
            unitPrice);
    }
}