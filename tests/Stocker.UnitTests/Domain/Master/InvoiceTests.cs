using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Xunit;
using PaymentMethod = Stocker.Domain.Master.Enums.PaymentMethod;
using InvoiceStatus = Stocker.Domain.Master.Enums.InvoiceStatus;

namespace Stocker.UnitTests.Domain.Master;

public class InvoiceTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _subscriptionId = Guid.NewGuid();
    private readonly Money _totalAmount = Money.Create(100m, "USD");
    private readonly decimal _taxRate = 18m;
    private readonly DateTime _issueDate = DateTime.UtcNow;
    private readonly DateTime _dueDate = DateTime.UtcNow.AddDays(30);
    private readonly Address _billingAddress = Address.Create("123 Main St", "New York", "USA", "10001");

    [Fact]
    public void Create_WithValidData_ShouldCreateInvoice()
    {
        // Act
        var invoice = Invoice.Create(
            _tenantId,
            _subscriptionId,
            _totalAmount,
            _taxRate,
            _issueDate,
            _dueDate,
            _billingAddress,
            "Test invoice");

        // Assert
        invoice.Should().NotBeNull();
        invoice.Id.Should().NotBeEmpty();
        invoice.TenantId.Should().Be(_tenantId);
        invoice.SubscriptionId.Should().Be(_subscriptionId);
        invoice.InvoiceNumber.Should().NotBeNullOrWhiteSpace();
        invoice.InvoiceNumber.Should().StartWith("INV-");
        invoice.Status.Should().Be(InvoiceStatus.Taslak);
        invoice.Subtotal.Should().Be(_totalAmount);
        invoice.TaxRate.Should().Be(_taxRate);
        invoice.TaxAmount.Amount.Should().Be(18m); // 100 * 0.18
        invoice.TotalAmount.Amount.Should().Be(118m); // 100 + 18
        invoice.PaidAmount.Amount.Should().Be(0);
        invoice.IssueDate.Should().Be(_issueDate);
        invoice.DueDate.Should().Be(_dueDate);
        invoice.PaidDate.Should().BeNull();
        invoice.BillingAddress.Should().Be(_billingAddress);
        invoice.Notes.Should().Be("Test invoice");
        invoice.Items.Should().BeEmpty();
        invoice.Payments.Should().BeEmpty();
    }

    [Fact]
    public void Create_WithNegativeTaxRate_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Invoice.Create(
            _tenantId,
            _subscriptionId,
            _totalAmount,
            -5m,
            _issueDate,
            _dueDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Tax rate must be between 0 and 100*")
            .WithParameterName("taxRate");
    }

    [Fact]
    public void Create_WithTaxRateOver100_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Invoice.Create(
            _tenantId,
            _subscriptionId,
            _totalAmount,
            101m,
            _issueDate,
            _dueDate);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Tax rate must be between 0 and 100*")
            .WithParameterName("taxRate");
    }

    [Fact]
    public void Create_WithDueDateBeforeIssueDate_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Invoice.Create(
            _tenantId,
            _subscriptionId,
            _totalAmount,
            _taxRate,
            _issueDate,
            _issueDate.AddDays(-1));

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("*Due date must be after issue date*")
            .WithParameterName("dueDate");
    }

    [Fact]
    public void AddItem_ToDraftInvoice_ShouldAddItemAndRecalculateTotals()
    {
        // Arrange
        var invoice = CreateInvoice();
        var description = "Product A";
        var quantity = 2;
        var unitPrice = Money.Create(50m, "USD");

        // Act
        invoice.AddItem(description, quantity, unitPrice);

        // Assert
        invoice.Items.Should().HaveCount(1);
        var item = invoice.Items.First();
        item.Description.Should().Be(description);
        item.Quantity.Should().Be(quantity);
        item.UnitPrice.Should().Be(unitPrice);
        item.LineTotal.Amount.Should().Be(100m); // 2 * 50
        
        // Check recalculated totals
        invoice.Subtotal.Amount.Should().Be(100m);
        invoice.TaxAmount.Amount.Should().Be(18m); // 100 * 0.18
        invoice.TotalAmount.Amount.Should().Be(118m); // 100 + 18
    }

    [Fact]
    public void AddItem_ToNonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        var action = () => invoice.AddItem("Another Item", 1, Money.Create(50m, "USD"));

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Items can only be added to draft invoices.");
    }

    [Fact]
    public void AddMultipleItems_ShouldRecalculateTotalsCorrectly()
    {
        // Arrange
        var invoice = CreateInvoice();

        // Act
        invoice.AddItem("Item 1", 2, Money.Create(50m, "USD")); // 100
        invoice.AddItem("Item 2", 3, Money.Create(30m, "USD")); // 90
        invoice.AddItem("Item 3", 1, Money.Create(10m, "USD")); // 10

        // Assert
        invoice.Items.Should().HaveCount(3);
        invoice.Subtotal.Amount.Should().Be(200m); // 100 + 90 + 10
        invoice.TaxAmount.Amount.Should().Be(36m); // 200 * 0.18
        invoice.TotalAmount.Amount.Should().Be(236m); // 200 + 36
    }

    [Fact]
    public void RemoveItem_FromDraftInvoice_ShouldRemoveItemAndRecalculateTotals()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item 1", 2, Money.Create(50m, "USD"));
        invoice.AddItem("Item 2", 1, Money.Create(30m, "USD"));
        var itemId = invoice.Items.First().Id;

        // Act
        invoice.RemoveItem(itemId);

        // Assert
        invoice.Items.Should().HaveCount(1);
        invoice.Items.Should().NotContain(i => i.Id == itemId);
        invoice.Subtotal.Amount.Should().Be(30m);
        invoice.TaxAmount.Amount.Should().Be(5.40m); // 30 * 0.18
        invoice.TotalAmount.Amount.Should().Be(35.40m); // 30 + 5.40
    }

    [Fact]
    public void RemoveItem_FromNonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        var itemId = invoice.Items.First().Id;
        invoice.Send();

        // Act
        var action = () => invoice.RemoveItem(itemId);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Items can only be removed from draft invoices.");
    }

    [Fact]
    public void RemoveItem_WithNonExistentId_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        var nonExistentId = Guid.NewGuid();

        // Act
        var action = () => invoice.RemoveItem(nonExistentId);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage($"Item with ID '{nonExistentId}' not found.");
    }

    [Fact]
    public void Send_DraftInvoiceWithItems_ShouldChangeStatusToSent()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));

        // Act
        invoice.Send();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Gonderildi);
    }

    [Fact]
    public void Send_DraftInvoiceWithoutItems_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();

        // Act
        var action = () => invoice.Send();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot send an invoice without items.");
    }

    [Fact]
    public void Send_NonDraftInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        var action = () => invoice.Send();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only draft invoices can be sent.");
    }

    [Fact]
    public void AddPayment_ToValidInvoice_ShouldAddPaymentAndUpdatePaidAmount()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();
        var paymentAmount = Money.Create(50m, "USD");

        // Act
        invoice.AddPayment(PaymentMethod.KrediKarti, paymentAmount, "TRX-123", "Partial payment");

        // Assert
        invoice.Payments.Should().HaveCount(1);
        var payment = invoice.Payments.First();
        payment.Method.Should().Be(PaymentMethod.KrediKarti);
        payment.Amount.Should().Be(paymentAmount);
        payment.TransactionId.Should().Be("TRX-123");
        payment.Notes.Should().Be("Partial payment");
        payment.IsRefund.Should().BeFalse();
        
        invoice.PaidAmount.Amount.Should().Be(50m);
        invoice.Status.Should().Be(InvoiceStatus.KismiOdendi);
    }

    [Fact]
    public void AddPayment_FullAmount_ShouldMarkAsPaid()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        invoice.AddPayment(PaymentMethod.BankaTransferi, invoice.TotalAmount);

        // Assert
        invoice.PaidAmount.Should().Be(invoice.TotalAmount);
        invoice.Status.Should().Be(InvoiceStatus.Odendi);
        invoice.PaidDate.Should().NotBeNull();
        invoice.PaidDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void AddPayment_ToCancelledInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Cancel();

        // Act
        var action = () => invoice.AddPayment(PaymentMethod.KrediKarti, Money.Create(50m, "USD"));

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot add payment to cancelled or refunded invoices.");
    }

    [Fact]
    public void AddPayment_WithDifferentCurrency_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        var action = () => invoice.AddPayment(PaymentMethod.KrediKarti, Money.Create(50m, "EUR"));

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Payment currency must match invoice currency.");
    }

    [Fact]
    public void AddMultiplePayments_ShouldAccumulatePaidAmount()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        invoice.AddPayment(PaymentMethod.KrediKarti, Money.Create(30m, "USD"));
        invoice.AddPayment(PaymentMethod.BankaTransferi, Money.Create(40m, "USD"));
        invoice.AddPayment(PaymentMethod.PayPal, Money.Create(48m, "USD"));

        // Assert
        invoice.Payments.Should().HaveCount(3);
        invoice.PaidAmount.Amount.Should().Be(118m); // 30 + 40 + 48
        invoice.Status.Should().Be(InvoiceStatus.Odendi);
        invoice.PaidDate.Should().NotBeNull();
    }

    [Fact]
    public void MarkAsPaid_UnpaidInvoice_ShouldUpdateStatusAndPaidAmount()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        invoice.MarkAsPaid();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Odendi);
        invoice.PaidAmount.Should().Be(invoice.TotalAmount);
        invoice.PaidDate.Should().NotBeNull();
        invoice.PaidDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkAsPaid_AlreadyPaidInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();
        invoice.MarkAsPaid();

        // Act
        var action = () => invoice.MarkAsPaid();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Invoice is already paid.");
    }

    [Fact]
    public void MarkAsOverdue_SentInvoiceAfterDueDate_ShouldChangeStatus()
    {
        // Arrange
        var invoice = Invoice.Create(
            _tenantId,
            _subscriptionId,
            _totalAmount,
            _taxRate,
            DateTime.UtcNow.AddDays(-35),
            DateTime.UtcNow.AddDays(-5)); // Due date in the past
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        invoice.MarkAsOverdue();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.Gecikti);
    }

    [Fact]
    public void MarkAsOverdue_InvoiceNotYetDue_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        var action = () => invoice.MarkAsOverdue();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Invoice is not yet overdue.");
    }

    [Fact]
    public void MarkAsOverdue_InvalidStatus_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));

        // Act
        var action = () => invoice.MarkAsOverdue();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only sent or partially paid invoices can be marked as overdue.");
    }

    [Fact]
    public void Cancel_UnpaidInvoice_ShouldChangeStatus()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        invoice.Cancel();

        // Assert
        invoice.Status.Should().Be(InvoiceStatus.IptalEdildi);
    }

    [Fact]
    public void Cancel_PaidInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();
        invoice.MarkAsPaid();

        // Act
        var action = () => invoice.Cancel();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot cancel paid or refunded invoices.");
    }

    [Fact]
    public void Cancel_RefundedInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();
        invoice.MarkAsPaid();
        invoice.Refund(invoice.TotalAmount, "Full refund");

        // Act
        var action = () => invoice.Cancel();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot cancel paid or refunded invoices.");
    }

    [Fact]
    public void Refund_PaidInvoice_ShouldAddRefundPaymentAndUpdateStatus()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();
        invoice.MarkAsPaid();
        var refundAmount = Money.Create(50m, "USD");

        // Act
        invoice.Refund(refundAmount, "Partial refund due to complaint");

        // Assert
        invoice.Payments.Should().HaveCount(1);
        var refund = invoice.Payments.First();
        refund.IsRefund.Should().BeTrue();
        refund.Amount.Should().Be(refundAmount);
        refund.RefundReason.Should().Be("Partial refund due to complaint");
        
        invoice.PaidAmount.Amount.Should().Be(68m); // 118 - 50
        invoice.Status.Should().Be(InvoiceStatus.KismiOdendi);
    }

    [Fact]
    public void Refund_FullAmount_ShouldChangeStatusToRefunded()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();
        invoice.MarkAsPaid();

        // Act
        invoice.Refund(invoice.TotalAmount, "Full refund");

        // Assert
        invoice.PaidAmount.Amount.Should().Be(0);
        invoice.Status.Should().Be(InvoiceStatus.IadeEdildi);
    }

    [Fact]
    public void Refund_UnpaidInvoice_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();

        // Act
        var action = () => invoice.Refund(Money.Create(50m, "USD"), "Refund");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only paid invoices can be refunded.");
    }

    [Fact]
    public void Refund_WithDifferentCurrency_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var invoice = CreateInvoice();
        invoice.AddItem("Item", 1, Money.Create(100m, "USD"));
        invoice.Send();
        invoice.MarkAsPaid();

        // Act
        var action = () => invoice.Refund(Money.Create(50m, "EUR"), "Refund");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Refund currency must match invoice currency.");
    }

    [Fact]
    public void CompleteInvoiceWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var invoice = Invoice.Create(
            _tenantId,
            _subscriptionId,
            Money.Create(0m, "USD"), // Start with zero, will add items
            _taxRate,
            _issueDate,
            _dueDate,
            _billingAddress);

        // Add items
        invoice.AddItem("Professional Services", 10, Money.Create(100m, "USD")); // 1000
        invoice.AddItem("Software License", 5, Money.Create(200m, "USD")); // 1000
        invoice.AddItem("Support Package", 1, Money.Create(500m, "USD")); // 500

        // Verify draft state
        invoice.Status.Should().Be(InvoiceStatus.Taslak);
        invoice.Subtotal.Amount.Should().Be(2500m);
        invoice.TaxAmount.Amount.Should().Be(450m); // 2500 * 0.18
        invoice.TotalAmount.Amount.Should().Be(2950m); // 2500 + 450

        // Send invoice
        invoice.Send();
        invoice.Status.Should().Be(InvoiceStatus.Gonderildi);

        // Add partial payment
        invoice.AddPayment(PaymentMethod.BankaTransferi, Money.Create(1000m, "USD"), "BANK-001");
        invoice.Status.Should().Be(InvoiceStatus.KismiOdendi);
        invoice.PaidAmount.Amount.Should().Be(1000m);

        // Add another payment
        invoice.AddPayment(PaymentMethod.KrediKarti, Money.Create(1500m, "USD"), "CC-002");
        invoice.Status.Should().Be(InvoiceStatus.KismiOdendi);
        invoice.PaidAmount.Amount.Should().Be(2500m);

        // Final payment
        invoice.AddPayment(PaymentMethod.PayPal, Money.Create(450m, "USD"), "PP-003");
        invoice.Status.Should().Be(InvoiceStatus.Odendi);
        invoice.PaidAmount.Amount.Should().Be(2950m);
        invoice.PaidDate.Should().NotBeNull();

        // Process refund
        invoice.Refund(Money.Create(500m, "USD"), "Customer complaint resolved");
        invoice.Status.Should().Be(InvoiceStatus.KismiOdendi);
        invoice.PaidAmount.Amount.Should().Be(2450m);
        invoice.Payments.Should().HaveCount(4); // 3 payments + 1 refund
    }

    private Invoice CreateInvoice()
    {
        return Invoice.Create(
            _tenantId,
            _subscriptionId,
            _totalAmount,
            _taxRate,
            _issueDate,
            _dueDate,
            _billingAddress);
    }
}