using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Xunit;
using PaymentMethod = Stocker.Domain.Master.Enums.PaymentMethod;
using PaymentStatus = Stocker.Domain.Master.Enums.PaymentStatus;

namespace Stocker.UnitTests.Domain.Master;

public class PaymentTests
{
    private readonly Guid _invoiceId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreatePayment()
    {
        // Arrange
        var amount = Money.Create(100m, "USD");
        var transactionId = "TRX-123456";
        var notes = "Payment via credit card";

        // Act
        var payment = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, amount, transactionId, notes);

        // Assert
        payment.Should().NotBeNull();
        payment.Id.Should().NotBeEmpty();
        payment.InvoiceId.Should().Be(_invoiceId);
        payment.Method.Should().Be(PaymentMethod.KrediKarti);
        payment.Status.Should().Be(PaymentStatus.Tamamlandi);
        payment.Amount.Should().Be(amount);
        payment.TransactionId.Should().Be(transactionId);
        payment.Notes.Should().Be(notes);
        payment.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        payment.IsRefund.Should().BeFalse();
        payment.RefundReason.Should().BeNull();
    }

    [Fact]
    public void Create_WithMinimalData_ShouldCreatePayment()
    {
        // Arrange
        var amount = Money.Create(50m, "EUR");

        // Act
        var payment = Payment.Create(_invoiceId, PaymentMethod.BankaTransferi, amount);

        // Assert
        payment.Should().NotBeNull();
        payment.TransactionId.Should().BeNull();
        payment.Notes.Should().BeNull();
        payment.IsRefund.Should().BeFalse();
    }

    [Fact]
    public void Create_WithZeroAmount_ShouldThrowArgumentException()
    {
        // Arrange
        var amount = Money.Create(0m, "USD");

        // Act
        var action = () => Payment.Create(_invoiceId, PaymentMethod.KrediKarti, amount);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Payment amount must be greater than zero.*")
            .WithParameterName("amount");
    }

    [Fact]
    public void Create_WithNegativeAmount_ShouldThrowArgumentException()
    {
        // Money.Create already throws for negative amounts, so we can't test Payment validation
        // Instead, we'll test that Money validates the amount
        
        // Act & Assert - Money.Create will throw first
        var action = () => Money.Create(-50m, "USD");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Amount cannot be negative.*")
            .WithParameterName("amount");
    }

    [Fact]
    public void CreateRefund_WithValidData_ShouldCreateRefundPayment()
    {
        // Arrange
        var amount = Money.Create(75m, "USD");
        var reason = "Customer requested refund due to defective product";

        // Act
        var refund = Payment.CreateRefund(_invoiceId, amount, reason);

        // Assert
        refund.Should().NotBeNull();
        refund.Id.Should().NotBeEmpty();
        refund.InvoiceId.Should().Be(_invoiceId);
        refund.Method.Should().Be(PaymentMethod.Diger);
        refund.Status.Should().Be(PaymentStatus.Tamamlandi);
        refund.Amount.Should().Be(amount);
        refund.IsRefund.Should().BeTrue();
        refund.RefundReason.Should().Be(reason);
        refund.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void CreateRefund_WithZeroAmount_ShouldThrowArgumentException()
    {
        // Arrange
        var amount = Money.Create(0m, "USD");

        // Act
        var action = () => Payment.CreateRefund(_invoiceId, amount, "Refund reason");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Refund amount must be greater than zero.*")
            .WithParameterName("amount");
    }

    [Fact]
    public void CreateRefund_WithNegativeAmount_ShouldThrowArgumentException()
    {
        // Money.Create already throws for negative amounts
        // Act & Assert
        var action = () => Money.Create(-25m, "USD");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Amount cannot be negative.*")
            .WithParameterName("amount");
    }

    [Fact]
    public void CreateRefund_WithNullReason_ShouldThrowArgumentException()
    {
        // Arrange
        var amount = Money.Create(50m, "USD");

        // Act
        var action = () => Payment.CreateRefund(_invoiceId, amount, null!);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Refund reason is required.*")
            .WithParameterName("reason");
    }

    [Fact]
    public void CreateRefund_WithEmptyReason_ShouldThrowArgumentException()
    {
        // Arrange
        var amount = Money.Create(50m, "USD");

        // Act
        var action = () => Payment.CreateRefund(_invoiceId, amount, "");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Refund reason is required.*")
            .WithParameterName("reason");
    }

    [Fact]
    public void CreateRefund_WithWhitespaceReason_ShouldThrowArgumentException()
    {
        // Arrange
        var amount = Money.Create(50m, "USD");

        // Act
        var action = () => Payment.CreateRefund(_invoiceId, amount, "   ");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Refund reason is required.*")
            .WithParameterName("reason");
    }

    [Fact]
    public void MarkAsFailed_WhenPending_ShouldUpdateStatusAndNotes()
    {
        // Arrange
        var payment = CreatePendingPayment();
        var failureReason = "Insufficient funds";

        // Act
        payment.MarkAsFailed(failureReason);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Basarisiz);
        payment.Notes.Should().Be($"Failed: {failureReason}");
    }

    [Fact]
    public void MarkAsFailed_WhenProcessing_ShouldUpdateStatusAndNotes()
    {
        // Arrange
        var payment = CreateProcessingPayment();
        var failureReason = "Card declined";

        // Act
        payment.MarkAsFailed(failureReason);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Basarisiz);
        payment.Notes.Should().Be($"Failed: {failureReason}");
    }

    [Fact]
    public void MarkAsFailed_WhenCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, Money.Create(100m, "USD"));

        // Act
        var action = () => payment.MarkAsFailed("Some reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending or processing payments can be marked as failed.");
    }

    [Fact]
    public void MarkAsFailed_WhenAlreadyFailed_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePendingPayment();
        payment.MarkAsFailed("First failure");

        // Act
        var action = () => payment.MarkAsFailed("Second failure");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending or processing payments can be marked as failed.");
    }

    [Fact]
    public void MarkAsCompleted_WhenPending_ShouldUpdateStatus()
    {
        // Arrange
        var payment = CreatePendingPayment();
        var transactionId = "NEW-TRX-789";

        // Act
        payment.MarkAsCompleted(transactionId);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Tamamlandi);
        payment.TransactionId.Should().Be(transactionId);
        payment.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkAsCompleted_WhenProcessing_ShouldUpdateStatus()
    {
        // Arrange
        var payment = CreateProcessingPayment();

        // Act
        payment.MarkAsCompleted();

        // Assert
        payment.Status.Should().Be(PaymentStatus.Tamamlandi);
        payment.ProcessedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void MarkAsCompleted_WithoutTransactionId_ShouldNotChangeExistingTransactionId()
    {
        // Arrange
        var originalTransactionId = "ORIGINAL-123";
        var payment = CreatePendingPayment();
        
        // Use reflection to set the transaction ID since it's private
        var transactionIdProperty = payment.GetType().GetProperty("TransactionId");
        transactionIdProperty!.SetValue(payment, originalTransactionId);

        // Act
        payment.MarkAsCompleted();

        // Assert
        payment.TransactionId.Should().Be(originalTransactionId);
    }

    [Fact]
    public void MarkAsCompleted_WhenAlreadyCompleted_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, Money.Create(100m, "USD"));

        // Act
        var action = () => payment.MarkAsCompleted();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending or processing payments can be marked as completed.");
    }

    [Fact]
    public void MarkAsCompleted_WhenFailed_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePendingPayment();
        payment.MarkAsFailed("Card declined");

        // Act
        var action = () => payment.MarkAsCompleted();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending or processing payments can be marked as completed.");
    }

    [Theory]
    [InlineData(Stocker.Domain.Master.Enums.PaymentMethod.KrediKarti)]
    [InlineData(Stocker.Domain.Master.Enums.PaymentMethod.BankaKarti)]
    [InlineData(Stocker.Domain.Master.Enums.PaymentMethod.BankaTransferi)]
    [InlineData(Stocker.Domain.Master.Enums.PaymentMethod.PayPal)]
    [InlineData(Stocker.Domain.Master.Enums.PaymentMethod.Stripe)]
    [InlineData(Stocker.Domain.Master.Enums.PaymentMethod.Diger)]
    public void Create_WithDifferentPaymentMethods_ShouldCreatePayment(PaymentMethod method)
    {
        // Arrange
        var amount = Money.Create(100m, "USD");

        // Act
        var payment = Payment.Create(_invoiceId, method, amount);

        // Assert
        payment.Method.Should().Be(method);
    }

    [Fact]
    public void Create_WithLargeAmount_ShouldCreatePayment()
    {
        // Arrange
        var amount = Money.Create(999999999.99m, "USD");

        // Act
        var payment = Payment.Create(_invoiceId, PaymentMethod.BankaTransferi, amount);

        // Assert
        payment.Amount.Amount.Should().Be(999999999.99m);
    }

    [Fact]
    public void Create_WithSmallAmount_ShouldCreatePayment()
    {
        // Arrange
        var amount = Money.Create(0.01m, "USD");

        // Act
        var payment = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, amount);

        // Assert
        payment.Amount.Amount.Should().Be(0.01m);
    }

    [Fact]
    public void Create_WithDifferentCurrencies_ShouldCreatePayments()
    {
        // Arrange & Act
        var usdPayment = Payment.Create(_invoiceId, PaymentMethod.PayPal, Money.Create(100m, "USD"));
        var eurPayment = Payment.Create(_invoiceId, PaymentMethod.PayPal, Money.Create(100m, "EUR"));
        var gbpPayment = Payment.Create(_invoiceId, PaymentMethod.PayPal, Money.Create(100m, "GBP"));

        // Assert
        usdPayment.Amount.Currency.Should().Be("USD");
        eurPayment.Amount.Currency.Should().Be("EUR");
        gbpPayment.Amount.Currency.Should().Be("GBP");
    }

    [Fact]
    public void Create_WithLongTransactionId_ShouldCreatePayment()
    {
        // Arrange
        var longTransactionId = new string('A', 500);
        var amount = Money.Create(100m, "USD");

        // Act
        var payment = Payment.Create(_invoiceId, PaymentMethod.Stripe, amount, longTransactionId);

        // Assert
        payment.TransactionId.Should().Be(longTransactionId);
    }

    [Fact]
    public void Create_WithLongNotes_ShouldCreatePayment()
    {
        // Arrange
        var longNotes = new string('B', 1000);
        var amount = Money.Create(100m, "USD");

        // Act
        var payment = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, amount, notes: longNotes);

        // Assert
        payment.Notes.Should().Be(longNotes);
    }

    [Fact]
    public void CreateRefund_WithLongReason_ShouldCreateRefund()
    {
        // Arrange
        var longReason = new string('C', 1000);
        var amount = Money.Create(50m, "USD");

        // Act
        var refund = Payment.CreateRefund(_invoiceId, amount, longReason);

        // Assert
        refund.RefundReason.Should().Be(longReason);
    }

    [Fact]
    public void MultiplePayments_WithSameData_ShouldHaveDifferentIds()
    {
        // Arrange
        var amount = Money.Create(100m, "USD");

        // Act
        var payment1 = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, amount);
        var payment2 = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, amount);

        // Assert
        payment1.Id.Should().NotBe(payment2.Id);
        payment1.InvoiceId.Should().Be(payment2.InvoiceId);
    }

    [Fact]
    public void PaymentWorkflow_FromPendingToCompleted_ShouldWorkCorrectly()
    {
        // Arrange
        var payment = CreatePendingPayment();
        payment.Status.Should().Be(PaymentStatus.Beklemede);

        // Move to processing
        var statusProperty = payment.GetType().GetProperty("Status");
        statusProperty!.SetValue(payment, PaymentStatus.Isleniyor);
        payment.Status.Should().Be(PaymentStatus.Isleniyor);

        // Act - Complete the payment
        payment.MarkAsCompleted("FINAL-TRX-123");

        // Assert
        payment.Status.Should().Be(PaymentStatus.Tamamlandi);
        payment.TransactionId.Should().Be("FINAL-TRX-123");
    }

    [Fact]
    public void PaymentWorkflow_FromPendingToFailed_ShouldWorkCorrectly()
    {
        // Arrange
        var payment = CreatePendingPayment();
        payment.Status.Should().Be(PaymentStatus.Beklemede);

        // Act - Fail the payment
        payment.MarkAsFailed("Bank rejected the transaction");

        // Assert
        payment.Status.Should().Be(PaymentStatus.Basarisiz);
        payment.Notes.Should().Contain("Bank rejected the transaction");
    }

    private Payment CreatePendingPayment()
    {
        // Use reflection to create a payment with Pending status
        var payment = Payment.Create(_invoiceId, PaymentMethod.KrediKarti, Money.Create(100m, "USD"));
        var statusProperty = payment.GetType().GetProperty("Status");
        statusProperty!.SetValue(payment, PaymentStatus.Beklemede);
        return payment;
    }

    private Payment CreateProcessingPayment()
    {
        // Use reflection to create a payment with Processing status
        var payment = Payment.Create(_invoiceId, PaymentMethod.BankaTransferi, Money.Create(200m, "USD"));
        var statusProperty = payment.GetType().GetProperty("Status");
        statusProperty!.SetValue(payment, PaymentStatus.Isleniyor);
        return payment;
    }
}