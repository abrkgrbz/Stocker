using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using Stocker.Domain.Tenant.Enums;
using Xunit;

namespace Stocker.UnitTests.Domain.Tenant;

public class PaymentTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly Guid _invoiceId = Guid.NewGuid();
    private readonly Guid _customerId = Guid.NewGuid();
    private readonly string _paymentNumber = "PAY-2024-001";
    private readonly DateTime _paymentDate = DateTime.UtcNow;
    private readonly Money _amount = Money.Create(1000m, "TRY");

    [Fact]
    public void Create_WithValidData_ShouldCreatePayment()
    {
        // Act
        var payment = Payment.Create(
            _tenantId,
            _paymentNumber,
            _invoiceId,
            _customerId,
            _paymentDate,
            _amount,
            PaymentMethod.Cash);

        // Assert
        payment.Should().NotBeNull();
        payment.TenantId.Should().Be(_tenantId);
        payment.PaymentNumber.Should().Be(_paymentNumber);
        payment.InvoiceId.Should().Be(_invoiceId);
        payment.CustomerId.Should().Be(_customerId);
        payment.PaymentDate.Should().Be(_paymentDate);
        payment.Amount.Should().Be(_amount);
        payment.PaymentMethod.Should().Be(PaymentMethod.Cash);
        payment.Status.Should().Be(PaymentStatus.Pending);
    }

    [Fact]
    public void Create_WithEmptyPaymentNumber_ShouldThrowArgumentException()
    {
        // Act
        var action = () => Payment.Create(
            _tenantId,
            "",
            _invoiceId,
            _customerId,
            _paymentDate,
            _amount,
            PaymentMethod.Cash);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Payment number cannot be empty.*");
    }

    [Fact]
    public void Create_WithZeroAmount_ShouldThrowArgumentException()
    {
        // Arrange
        var zeroAmount = Money.Create(0m, "TRY");

        // Act
        var action = () => Payment.Create(
            _tenantId,
            _paymentNumber,
            _invoiceId,
            _customerId,
            _paymentDate,
            zeroAmount,
            PaymentMethod.Cash);

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Payment amount must be greater than zero.*");
    }

    [Fact]
    public void Create_WithNegativeAmount_ShouldThrowWhenCreatingMoney()
    {
        // Act
        var action = () => Money.Create(-100m, "TRY");

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Amount cannot be negative.*");
    }

    [Fact]
    public void SetReferenceNumber_ShouldUpdateReferenceNumber()
    {
        // Arrange
        var payment = CreatePayment();
        var referenceNumber = "REF123456";

        // Act
        payment.SetReferenceNumber(referenceNumber);

        // Assert
        payment.ReferenceNumber.Should().Be(referenceNumber);
    }

    [Fact]
    public void SetTransactionId_ShouldUpdateTransactionId()
    {
        // Arrange
        var payment = CreatePayment();
        var transactionId = "TXN123456";

        // Act
        payment.SetTransactionId(transactionId);

        // Assert
        payment.TransactionId.Should().Be(transactionId);
    }

    [Fact]
    public void SetNotes_ShouldUpdateNotes()
    {
        // Arrange
        var payment = CreatePayment();
        var notes = "Payment received via bank";

        // Act
        payment.SetNotes(notes);

        // Assert
        payment.Notes.Should().Be(notes);
    }

    [Fact]
    public void SetBankDetails_ForBankTransferPayment_ShouldUpdateDetails()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.BankTransfer);
        var bankName = "Test Bank";
        var checkNumber = "CHK123";

        // Act
        payment.SetBankDetails(bankName, checkNumber);

        // Assert
        payment.BankName.Should().Be(bankName);
        payment.CheckNumber.Should().Be(checkNumber);
    }

    [Fact]
    public void SetBankDetails_ForCheckPayment_ShouldUpdateDetails()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.Check);
        var bankName = "Test Bank";
        var checkNumber = "CHK123";

        // Act
        payment.SetBankDetails(bankName, checkNumber);

        // Assert
        payment.BankName.Should().Be(bankName);
        payment.CheckNumber.Should().Be(checkNumber);
    }

    [Fact]
    public void SetBankDetails_ForCashPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.Cash);

        // Act
        var action = () => payment.SetBankDetails("Test Bank");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Bank details can only be set for bank transfer or check payments.");
    }

    [Fact]
    public void SetCardDetails_ForCreditCardPayment_ShouldUpdateDetails()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.CreditCard);
        var lastFourDigits = "1234";
        var cardType = "Visa";

        // Act
        payment.SetCardDetails(lastFourDigits, cardType);

        // Assert
        payment.CardLastFourDigits.Should().Be(lastFourDigits);
        payment.CardType.Should().Be(cardType);
    }

    [Fact]
    public void SetCardDetails_ForCashPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.Cash);

        // Act
        var action = () => payment.SetCardDetails("1234", "Visa");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Card details can only be set for credit card payments.");
    }

    [Fact]
    public void Process_PendingPayment_ShouldChangeStatusToProcessing()
    {
        // Arrange
        var payment = CreatePayment();

        // Act
        payment.Process();

        // Assert
        payment.Status.Should().Be(PaymentStatus.Processing);
    }

    [Fact]
    public void Process_ProcessingPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment();
        payment.Process();

        // Act
        var action = () => payment.Process();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending payments can be processed.");
    }

    [Fact]
    public void Complete_ProcessingPayment_ShouldChangeStatusToCompleted()
    {
        // Arrange
        var payment = CreatePayment();
        payment.Process();

        // Act
        payment.Complete();

        // Assert
        payment.Status.Should().Be(PaymentStatus.Completed);
    }

    [Fact]
    public void Complete_ProcessingPaymentWithTransactionId_ShouldUpdateTransactionId()
    {
        // Arrange
        var payment = CreatePayment();
        payment.Process();
        var transactionId = "TXN789";

        // Act
        payment.Complete(transactionId);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Completed);
        payment.TransactionId.Should().Be(transactionId);
    }

    [Fact]
    public void Complete_PendingPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment();

        // Act
        var action = () => payment.Complete();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only processing payments can be completed.");
    }

    [Fact]
    public void Fail_ProcessingPayment_ShouldChangeStatusToFailed()
    {
        // Arrange
        var payment = CreatePayment();
        payment.Process();
        var reason = "Insufficient funds";

        // Act
        payment.Fail(reason);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Failed);
        payment.Notes.Should().Contain("[FAILED]");
        payment.Notes.Should().Contain(reason);
    }

    [Fact]
    public void Fail_CompletedPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment();
        payment.Process();
        payment.Complete();

        // Act
        var action = () => payment.Fail("Some reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot fail a completed or refunded payment.");
    }

    [Fact]
    public void Cancel_PendingPayment_ShouldChangeStatusToCancelled()
    {
        // Arrange
        var payment = CreatePayment();
        var reason = "Customer request";

        // Act
        payment.Cancel(reason);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Cancelled);
        payment.Notes.Should().Contain("[CANCELLED]");
        payment.Notes.Should().Contain(reason);
    }

    [Fact]
    public void Cancel_CompletedPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment();
        payment.Process();
        payment.Complete();

        // Act
        var action = () => payment.Cancel("Some reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Cannot cancel a completed or refunded payment.");
    }

    [Fact]
    public void Refund_CompletedPayment_ShouldChangeStatusToRefunded()
    {
        // Arrange
        var payment = CreatePayment();
        payment.Process();
        payment.Complete();
        var reason = "Product returned";

        // Act
        payment.Refund(reason);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Refunded);
        payment.Notes.Should().Contain("[REFUNDED]");
        payment.Notes.Should().Contain(reason);
    }

    [Fact]
    public void Refund_PendingPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment();

        // Act
        var action = () => payment.Refund("Some reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only completed payments can be refunded.");
    }

    [Fact]
    public void MarkAsCleared_ProcessingCheckPayment_ShouldCompleteWithClearanceDate()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.Check);
        payment.Process();
        var clearanceDate = DateTime.UtcNow.AddDays(3);

        // Act
        payment.MarkAsCleared(clearanceDate);

        // Assert
        payment.Status.Should().Be(PaymentStatus.Completed);
        payment.ClearanceDate.Should().Be(clearanceDate);
    }

    [Fact]
    public void MarkAsCleared_CashPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.Cash);
        payment.Process();

        // Act
        var action = () => payment.MarkAsCleared(DateTime.UtcNow);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only check payments can be marked as cleared.");
    }

    [Fact]
    public void MarkAsCleared_PendingCheckPayment_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.Check);

        // Act
        var action = () => payment.MarkAsCleared(DateTime.UtcNow);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only processing check payments can be marked as cleared.");
    }

    [Fact]
    public void SetTenantId_ShouldUpdateTenantId()
    {
        // Arrange
        var payment = CreatePayment();
        var newTenantId = Guid.NewGuid();

        // Act
        payment.SetTenantId(newTenantId);

        // Assert
        payment.TenantId.Should().Be(newTenantId);
    }

    [Fact]
    public void PaymentWorkflow_CompleteFlow_ShouldWorkCorrectly()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.CreditCard);

        // Act & Assert - Start as Pending
        payment.Status.Should().Be(PaymentStatus.Pending);

        // Process payment
        payment.Process();
        payment.Status.Should().Be(PaymentStatus.Processing);

        // Set card details
        payment.SetCardDetails("4567", "MasterCard");
        payment.CardLastFourDigits.Should().Be("4567");

        // Complete payment
        payment.Complete("TXN123");
        payment.Status.Should().Be(PaymentStatus.Completed);
        payment.TransactionId.Should().Be("TXN123");
    }

    [Fact]
    public void CheckPaymentWorkflow_WithClearance_ShouldWorkCorrectly()
    {
        // Arrange
        var payment = CreatePayment(PaymentMethod.Check);

        // Act & Assert
        payment.SetBankDetails("ABC Bank", "CHK999");
        payment.Process();
        payment.Status.Should().Be(PaymentStatus.Processing);

        var clearanceDate = DateTime.UtcNow.AddDays(5);
        payment.MarkAsCleared(clearanceDate);
        
        payment.Status.Should().Be(PaymentStatus.Completed);
        payment.ClearanceDate.Should().Be(clearanceDate);
        payment.BankName.Should().Be("ABC Bank");
        payment.CheckNumber.Should().Be("CHK999");
    }

    private Payment CreatePayment(PaymentMethod method = PaymentMethod.Cash)
    {
        return Payment.Create(
            _tenantId,
            _paymentNumber,
            _invoiceId,
            _customerId,
            _paymentDate,
            _amount,
            method);
    }
}