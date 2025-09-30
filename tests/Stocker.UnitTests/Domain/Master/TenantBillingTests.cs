using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.Enums;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class TenantBillingTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly string _companyName = "Test Company Ltd.";
    private readonly string _addressLine1 = "123 Business Street";
    private readonly string _city = "Istanbul";
    private readonly string _postalCode = "34000";
    private readonly string _country = "Turkey";
    private readonly Email _invoiceEmail;
    private readonly string _createdBy = "admin@test.com";

    public TenantBillingTests()
    {
        _invoiceEmail = Email.Create("billing@test.com").Value!;
    }

    [Fact]
    public void Create_WithValidData_ShouldCreateBilling()
    {
        // Act
        var billing = TenantBilling.Create(
            _tenantId,
            _companyName,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _invoiceEmail,
            Stocker.Domain.Master.Entities.PaymentMethod.CreditCard,
            BillingCycle.Aylik,
            "USD",
            _createdBy
        );

        // Assert
        billing.Should().NotBeNull();
        billing.Id.Should().NotBeEmpty();
        billing.TenantId.Should().Be(_tenantId);
        billing.CompanyName.Should().Be(_companyName);
        billing.AddressLine1.Should().Be(_addressLine1);
        billing.City.Should().Be(_city);
        billing.PostalCode.Should().Be(_postalCode);
        billing.Country.Should().Be(_country);
        billing.InvoiceEmail.Should().Be(_invoiceEmail);
        billing.PreferredPaymentMethod.Should().Be(Stocker.Domain.Master.Entities.PaymentMethod.CreditCard);
        billing.BillingCycle.Should().Be(BillingCycle.Aylik);
        billing.BillingDay.Should().Be(1);
        billing.Currency.Should().Be("USD");
        billing.AutoPaymentEnabled.Should().BeFalse();
        billing.SendInvoiceByEmail.Should().BeTrue();
        billing.SendInvoiceByPost.Should().BeFalse();
        billing.ConsolidatedBilling.Should().BeFalse();
        billing.PaymentTermsDays.Should().Be(30);
        billing.GracePeriodDays.Should().Be(7);
        billing.IsActive.Should().BeTrue();
        billing.IsVerified.Should().BeFalse();
        billing.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        billing.CreatedBy.Should().Be(_createdBy);
    }

    [Fact]
    public void Create_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantBilling.Create(
            Guid.Empty,
            _companyName,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _invoiceEmail,
            Stocker.Domain.Master.Entities.PaymentMethod.CreditCard,
            BillingCycle.Aylik,
            "USD",
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant ID cannot be empty.*")
            .WithParameterName("tenantId");
    }

    [Fact]
    public void Create_WithEmptyCompanyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantBilling.Create(
            _tenantId,
            "",
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _invoiceEmail,
            Stocker.Domain.Master.Entities.PaymentMethod.CreditCard,
            BillingCycle.Aylik,
            "USD",
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Company name cannot be empty.*")
            .WithParameterName("companyName");
    }

    [Fact]
    public void Create_WithEmptyCurrency_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantBilling.Create(
            _tenantId,
            _companyName,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _invoiceEmail,
            Stocker.Domain.Master.Entities.PaymentMethod.CreditCard,
            BillingCycle.Aylik,
            "",
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Currency cannot be empty.*")
            .WithParameterName("currency");
    }

    [Fact]
    public void UpdateTaxInfo_ShouldUpdateTaxNumberAndOffice()
    {
        // Arrange
        var billing = CreateBilling();
        var taxNumber = "1234567890";
        var taxOffice = "Kadikoy Tax Office";

        // Act
        billing.UpdateTaxInfo(taxNumber, taxOffice);

        // Assert
        billing.TaxNumber.Should().Be(taxNumber);
        billing.TaxOffice.Should().Be(taxOffice);
        billing.UpdatedAt.Should().NotBeNull();
        billing.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void UpdateTaxInfo_WithNullValues_ShouldSetNulls()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.UpdateTaxInfo(null, null);

        // Assert
        billing.TaxNumber.Should().BeNull();
        billing.TaxOffice.Should().BeNull();
    }

    [Fact]
    public void UpdateAddress_ShouldUpdateAllAddressFields()
    {
        // Arrange
        var billing = CreateBilling();
        var newAddressLine1 = "456 New Street";
        var newAddressLine2 = "Suite 100";
        var newCity = "Ankara";
        var newState = "Ankara";
        var newPostalCode = "06000";
        var newCountry = "Turkey";

        // Act
        billing.UpdateAddress(
            newAddressLine1,
            newAddressLine2,
            newCity,
            newState,
            newPostalCode,
            newCountry
        );

        // Assert
        billing.AddressLine1.Should().Be(newAddressLine1);
        billing.AddressLine2.Should().Be(newAddressLine2);
        billing.City.Should().Be(newCity);
        billing.State.Should().Be(newState);
        billing.PostalCode.Should().Be(newPostalCode);
        billing.Country.Should().Be(newCountry);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetBankAccount_ShouldSetBankDetails()
    {
        // Arrange
        var billing = CreateBilling();
        var bankName = "Test Bank";
        var bankBranch = "Main Branch";
        var accountHolder = "Test Company Ltd.";
        var iban = "TR123456789012345678901234";
        var swiftCode = "TESTTRXX";
        var accountNumber = "12345678";
        var routingNumber = "987654321";

        // Act
        billing.SetBankAccount(
            bankName,
            bankBranch,
            accountHolder,
            iban,
            swiftCode,
            accountNumber,
            routingNumber
        );

        // Assert
        billing.BankName.Should().Be(bankName);
        billing.BankBranch.Should().Be(bankBranch);
        billing.AccountHolder.Should().Be(accountHolder);
        billing.IBAN.Should().Be(iban);
        billing.SwiftCode.Should().Be(swiftCode);
        billing.AccountNumber.Should().Be(accountNumber);
        billing.RoutingNumber.Should().Be(routingNumber);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetBankAccount_WithNullOptionalFields_ShouldSetNulls()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.SetBankAccount(
            "Bank Name",
            null,
            "Account Holder",
            null,
            null,
            null,
            null
        );

        // Assert
        billing.BankName.Should().Be("Bank Name");
        billing.BankBranch.Should().BeNull();
        billing.AccountHolder.Should().Be("Account Holder");
        billing.IBAN.Should().BeNull();
        billing.SwiftCode.Should().BeNull();
        billing.AccountNumber.Should().BeNull();
        billing.RoutingNumber.Should().BeNull();
    }

    [Fact]
    public void SetCreditCard_ShouldSetCardDetails()
    {
        // Arrange
        var billing = CreateBilling();
        var cardHolderName = "John Doe";
        var cardNumberMasked = "**** **** **** 1234";
        var cardType = "Visa";
        var expiryMonth = 12;
        var expiryYear = 2025;
        var cardToken = "tok_test123";

        // Act
        billing.SetCreditCard(
            cardHolderName,
            cardNumberMasked,
            cardType,
            expiryMonth,
            expiryYear,
            cardToken
        );

        // Assert
        billing.CardHolderName.Should().Be(cardHolderName);
        billing.CardNumberMasked.Should().Be(cardNumberMasked);
        billing.CardType.Should().Be(cardType);
        billing.CardExpiryMonth.Should().Be(expiryMonth);
        billing.CardExpiryYear.Should().Be(expiryYear);
        billing.CardToken.Should().Be(cardToken);
        billing.CardAddedDate.Should().NotBeNull();
        billing.CardAddedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetPayPal_ShouldSetPayPalDetails()
    {
        // Arrange
        var billing = CreateBilling();
        var payPalEmail = "paypal@test.com";
        var payPalAccountId = "PAYPAL123";

        // Act
        billing.SetPayPal(payPalEmail, payPalAccountId);

        // Assert
        billing.PayPalEmail.Should().Be(payPalEmail);
        billing.PayPalAccountId.Should().Be(payPalAccountId);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetPayPal_WithoutAccountId_ShouldSetOnlyEmail()
    {
        // Arrange
        var billing = CreateBilling();
        var payPalEmail = "paypal@test.com";

        // Act
        billing.SetPayPal(payPalEmail);

        // Assert
        billing.PayPalEmail.Should().Be(payPalEmail);
        billing.PayPalAccountId.Should().BeNull();
    }

    [Theory]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.CreditCard)]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.BankTransfer)]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.PayPal)]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.Check)]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.Cash)]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.DirectDebit)]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.Cryptocurrency)]
    [InlineData(Stocker.Domain.Master.Entities.PaymentMethod.Diger)]
    public void UpdatePaymentMethod_ShouldChangePaymentMethod(Stocker.Domain.Master.Entities.PaymentMethod paymentMethod)
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.UpdatePaymentMethod(paymentMethod);

        // Assert
        billing.PreferredPaymentMethod.Should().Be(paymentMethod);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Theory]
    [InlineData(BillingCycle.Aylik, 15)]
    [InlineData(BillingCycle.UcAylik, 1)]
    [InlineData(BillingCycle.Yillik, 25)]
    public void UpdateBillingCycle_ShouldChangeBillingCycleAndDay(BillingCycle cycle, int day)
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.UpdateBillingCycle(cycle, day);

        // Assert
        billing.BillingCycle.Should().Be(cycle);
        billing.BillingDay.Should().Be(day);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void EnableAutoPayment_WithLimit_ShouldEnableWithLimit()
    {
        // Arrange
        var billing = CreateBilling();
        var limit = 10000m;

        // Act
        billing.EnableAutoPayment(limit);

        // Assert
        billing.AutoPaymentEnabled.Should().BeTrue();
        billing.PaymentLimit.Should().Be(limit);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void EnableAutoPayment_WithoutLimit_ShouldEnableWithoutLimit()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.EnableAutoPayment();

        // Assert
        billing.AutoPaymentEnabled.Should().BeTrue();
        billing.PaymentLimit.Should().BeNull();
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void DisableAutoPayment_ShouldDisableAndClearLimit()
    {
        // Arrange
        var billing = CreateBilling();
        billing.EnableAutoPayment(5000m);

        // Act
        billing.DisableAutoPayment();

        // Assert
        billing.AutoPaymentEnabled.Should().BeFalse();
        billing.PaymentLimit.Should().BeNull();
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateBillingPreferences_ShouldUpdateAllPreferences()
    {
        // Arrange
        var billing = CreateBilling();
        var poNumber = "PO-2025-001";
        var costCenter = "IT-Department";

        // Act
        billing.UpdateBillingPreferences(
            sendByEmail: false,
            sendByPost: true,
            consolidatedBilling: true,
            purchaseOrderNumber: poNumber,
            costCenter: costCenter
        );

        // Assert
        billing.SendInvoiceByEmail.Should().BeFalse();
        billing.SendInvoiceByPost.Should().BeTrue();
        billing.ConsolidatedBilling.Should().BeTrue();
        billing.PurchaseOrderNumber.Should().Be(poNumber);
        billing.CostCenter.Should().Be(costCenter);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void UpdateBillingPreferences_WithNullOptionalFields_ShouldSetNulls()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.UpdateBillingPreferences(
            sendByEmail: true,
            sendByPost: false,
            consolidatedBilling: false
        );

        // Assert
        billing.SendInvoiceByEmail.Should().BeTrue();
        billing.SendInvoiceByPost.Should().BeFalse();
        billing.ConsolidatedBilling.Should().BeFalse();
        billing.PurchaseOrderNumber.Should().BeNull();
        billing.CostCenter.Should().BeNull();
    }

    [Fact]
    public void SetPaymentTerms_WithInterestRate_ShouldSetAllTerms()
    {
        // Arrange
        var billing = CreateBilling();
        var paymentTermsDays = 45;
        var gracePeriodDays = 10;
        var interestRate = 2.5m;

        // Act
        billing.SetPaymentTerms(paymentTermsDays, gracePeriodDays, interestRate);

        // Assert
        billing.PaymentTermsDays.Should().Be(paymentTermsDays);
        billing.GracePeriodDays.Should().Be(gracePeriodDays);
        billing.LatePaymentInterestRate.Should().Be(interestRate);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetPaymentTerms_WithoutInterestRate_ShouldSetTermsWithNullInterest()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.SetPaymentTerms(60, 15);

        // Assert
        billing.PaymentTermsDays.Should().Be(60);
        billing.GracePeriodDays.Should().Be(15);
        billing.LatePaymentInterestRate.Should().BeNull();
    }

    [Fact]
    public void Verify_ShouldSetVerificationDetails()
    {
        // Arrange
        var billing = CreateBilling();
        var verifiedBy = "compliance@test.com";

        // Act
        billing.Verify(verifiedBy);

        // Assert
        billing.IsVerified.Should().BeTrue();
        billing.VerifiedAt.Should().NotBeNull();
        billing.VerifiedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        billing.VerifiedBy.Should().Be(verifiedBy);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RecordPayment_WithNextBillingDate_ShouldRecordPaymentDetails()
    {
        // Arrange
        var billing = CreateBilling();
        var amount = 1500.50m;
        var nextBillingDate = DateTime.UtcNow.AddDays(30);

        // Act
        billing.RecordPayment(amount, nextBillingDate);

        // Assert
        billing.LastPaymentDate.Should().NotBeNull();
        billing.LastPaymentDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        billing.LastPaymentAmount.Should().Be(amount);
        billing.NextBillingDate.Should().Be(nextBillingDate);
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void RecordPayment_WithoutNextBillingDate_ShouldRecordPaymentWithoutNext()
    {
        // Arrange
        var billing = CreateBilling();
        var amount = 500m;

        // Act
        billing.RecordPayment(amount);

        // Assert
        billing.LastPaymentDate.Should().NotBeNull();
        billing.LastPaymentAmount.Should().Be(amount);
        billing.NextBillingDate.Should().BeNull();
    }

    [Fact]
    public void Activate_WhenDeactivated_ShouldActivate()
    {
        // Arrange
        var billing = CreateBilling();
        billing.Deactivate();

        // Act
        billing.Activate();

        // Assert
        billing.IsActive.Should().BeTrue();
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Deactivate_WhenActive_ShouldDeactivate()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.Deactivate();

        // Assert
        billing.IsActive.Should().BeFalse();
        billing.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void CompleteBillingSetupWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var billing = TenantBilling.Create(
            _tenantId,
            "Enterprise Corp",
            "999 Corporate Blvd",
            "New York",
            "10001",
            "USA",
            _invoiceEmail,
            Stocker.Domain.Master.Entities.PaymentMethod.BankTransfer,
            BillingCycle.Yillik,
            "USD",
            "setup@admin.com"
        );

        // Set tax information
        billing.UpdateTaxInfo("98-7654321", "Manhattan Tax Office");

        // Set complete address
        billing.UpdateAddress(
            "999 Corporate Blvd",
            "Floor 25",
            "New York",
            "NY",
            "10001",
            "USA"
        );

        // Set bank account for wire transfers
        billing.SetBankAccount(
            "Chase Bank",
            "Manhattan Branch",
            "Enterprise Corp",
            "US123456789012345678",
            "CHASUS33XXX",
            "987654321",
            "021000021"
        );

        // Set payment terms
        billing.SetPaymentTerms(45, 15, 1.5m);

        // Update billing preferences
        billing.UpdateBillingPreferences(
            sendByEmail: true,
            sendByPost: true,
            consolidatedBilling: true,
            purchaseOrderNumber: "PO-2025-ENT-001",
            costCenter: "Corporate"
        );

        // Enable auto payment with limit
        billing.EnableAutoPayment(100000m);

        // Verify the billing setup
        billing.Verify("finance@admin.com");

        // Record first payment
        billing.RecordPayment(25000m, DateTime.UtcNow.AddYears(1));

        // Assert
        billing.IsVerified.Should().BeTrue();
        billing.IsActive.Should().BeTrue();
        billing.AutoPaymentEnabled.Should().BeTrue();
        billing.PaymentLimit.Should().Be(100000m);
        billing.LastPaymentAmount.Should().Be(25000m);
        billing.NextBillingDate.Should().NotBeNull();
        billing.TaxNumber.Should().Be("98-7654321");
        billing.BankName.Should().Be("Chase Bank");
        billing.SendInvoiceByEmail.Should().BeTrue();
        billing.SendInvoiceByPost.Should().BeTrue();
        billing.ConsolidatedBilling.Should().BeTrue();
    }

    [Fact]
    public void CreditCardPaymentSetup_ShouldWorkCorrectly()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.UpdatePaymentMethod(Stocker.Domain.Master.Entities.PaymentMethod.CreditCard);
        billing.SetCreditCard(
            "Jane Smith",
            "**** **** **** 5678",
            "MasterCard",
            6,
            2027,
            "tok_mastercard_test"
        );
        billing.EnableAutoPayment(5000m);

        // Assert
        billing.PreferredPaymentMethod.Should().Be(Stocker.Domain.Master.Entities.PaymentMethod.CreditCard);
        billing.CardHolderName.Should().Be("Jane Smith");
        billing.CardNumberMasked.Should().Be("**** **** **** 5678");
        billing.CardType.Should().Be("MasterCard");
        billing.CardExpiryMonth.Should().Be(6);
        billing.CardExpiryYear.Should().Be(2027);
        billing.AutoPaymentEnabled.Should().BeTrue();
    }

    [Fact]
    public void PayPalPaymentSetup_ShouldWorkCorrectly()
    {
        // Arrange
        var billing = CreateBilling();

        // Act
        billing.UpdatePaymentMethod(Stocker.Domain.Master.Entities.PaymentMethod.PayPal);
        billing.SetPayPal("business@paypal.com", "PAYPAL-BUS-123");
        billing.EnableAutoPayment();

        // Assert
        billing.PreferredPaymentMethod.Should().Be(Stocker.Domain.Master.Entities.PaymentMethod.PayPal);
        billing.PayPalEmail.Should().Be("business@paypal.com");
        billing.PayPalAccountId.Should().Be("PAYPAL-BUS-123");
        billing.AutoPaymentEnabled.Should().BeTrue();
        billing.PaymentLimit.Should().BeNull();
    }

    private TenantBilling CreateBilling()
    {
        return TenantBilling.Create(
            _tenantId,
            _companyName,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _invoiceEmail,
            Stocker.Domain.Master.Entities.PaymentMethod.CreditCard,
            BillingCycle.Aylik,
            "USD",
            _createdBy
        );
    }
}