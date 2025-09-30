using FluentAssertions;
using Stocker.Domain.Master.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class TenantContractTests
{
    private readonly Guid _tenantId = Guid.NewGuid();
    private readonly DateTime _startDate = DateTime.UtcNow.Date;
    private readonly DateTime _endDate = DateTime.UtcNow.Date.AddYears(1);
    private readonly decimal _contractValue = 50000m;
    private readonly string _currency = "USD";
    private readonly string _createdBy = "admin@test.com";

    [Fact]
    public void Create_WithValidData_ShouldCreateContract()
    {
        // Act
        var contract = TenantContract.Create(
            _tenantId,
            ContractType.Standard,
            _startDate,
            _endDate,
            _contractValue,
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );

        // Assert
        contract.Should().NotBeNull();
        contract.Id.Should().NotBeEmpty();
        contract.TenantId.Should().Be(_tenantId);
        contract.ContractNumber.Should().StartWith("CNT-");
        contract.ContractType.Should().Be(ContractType.Standard);
        contract.StartDate.Should().Be(_startDate);
        contract.EndDate.Should().Be(_endDate);
        contract.ContractValue.Should().Be(_contractValue);
        contract.Currency.Should().Be(_currency);
        contract.PaymentTerms.Should().Be(PaymentTerms.Monthly);
        contract.Status.Should().Be(ContractStatus.Draft);
        contract.NoticePeriodDays.Should().Be(30);
        contract.AutoRenewal.Should().BeFalse();
        contract.RequiresApproval.Should().BeTrue(); // Value > 10000
        contract.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        contract.CreatedBy.Should().Be(_createdBy);
    }

    [Fact]
    public void Create_WithLowValue_ShouldNotRequireApproval()
    {
        // Act
        var contract = TenantContract.Create(
            _tenantId,
            ContractType.Trial,
            _startDate,
            _endDate,
            5000m, // Below 10000 threshold
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );

        // Assert
        contract.RequiresApproval.Should().BeFalse();
    }

    [Fact]
    public void Create_WithEmptyTenantId_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantContract.Create(
            Guid.Empty,
            ContractType.Standard,
            _startDate,
            _endDate,
            _contractValue,
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Tenant ID cannot be empty.*")
            .WithParameterName("tenantId");
    }

    [Fact]
    public void Create_WithEndDateBeforeStartDate_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantContract.Create(
            _tenantId,
            ContractType.Standard,
            _startDate,
            _startDate.AddDays(-1), // End before start
            _contractValue,
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("End date must be after start date.*")
            .WithParameterName("endDate");
    }

    [Fact]
    public void Create_WithNegativeContractValue_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantContract.Create(
            _tenantId,
            ContractType.Standard,
            _startDate,
            _endDate,
            -1000m,
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Contract value cannot be negative.*")
            .WithParameterName("contractValue");
    }

    [Fact]
    public void Create_WithEmptyCurrency_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantContract.Create(
            _tenantId,
            ContractType.Standard,
            _startDate,
            _endDate,
            _contractValue,
            "",
            PaymentTerms.Monthly,
            _createdBy
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Currency cannot be empty.*")
            .WithParameterName("currency");
    }

    [Theory]
    [InlineData(ContractType.Standard)]
    [InlineData(ContractType.Enterprise)]
    [InlineData(ContractType.Custom)]
    [InlineData(ContractType.Trial)]
    [InlineData(ContractType.Partnership)]
    public void Create_WithDifferentContractTypes_ShouldSetCorrectType(ContractType contractType)
    {
        // Act
        var contract = TenantContract.Create(
            _tenantId,
            contractType,
            _startDate,
            _endDate,
            _contractValue,
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );

        // Assert
        contract.ContractType.Should().Be(contractType);
    }

    [Theory]
    [InlineData(PaymentTerms.Monthly)]
    [InlineData(PaymentTerms.Quarterly)]
    [InlineData(PaymentTerms.SemiAnnual)]
    [InlineData(PaymentTerms.Annual)]
    [InlineData(PaymentTerms.OneTime)]
    [InlineData(PaymentTerms.Custom)]
    public void Create_WithDifferentPaymentTerms_ShouldSetCorrectTerms(PaymentTerms paymentTerms)
    {
        // Act
        var contract = TenantContract.Create(
            _tenantId,
            ContractType.Standard,
            _startDate,
            _endDate,
            _contractValue,
            _currency,
            paymentTerms,
            _createdBy
        );

        // Assert
        contract.PaymentTerms.Should().Be(paymentTerms);
    }

    [Fact]
    public void SetTerms_ShouldUpdateTermsAndSpecialConditions()
    {
        // Arrange
        var contract = CreateContract();
        var terms = "Standard terms and conditions apply";
        var specialConditions = "Custom discount of 10% for first year";

        // Act
        contract.SetTerms(terms, specialConditions);

        // Assert
        contract.Terms.Should().Be(terms);
        contract.SpecialConditions.Should().Be(specialConditions);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetTerms_WithoutSpecialConditions_ShouldSetOnlyTerms()
    {
        // Arrange
        var contract = CreateContract();
        var terms = "Basic terms";

        // Act
        contract.SetTerms(terms);

        // Assert
        contract.Terms.Should().Be(terms);
        contract.SpecialConditions.Should().BeNull();
    }

    [Fact]
    public void SetRenewalTerms_WithAutoRenewal_ShouldSetAllRenewalTerms()
    {
        // Arrange
        var contract = CreateContract();
        var renewalMonths = 12;
        var priceIncrease = 5m;

        // Act
        contract.SetRenewalTerms(true, renewalMonths, priceIncrease);

        // Assert
        contract.AutoRenewal.Should().BeTrue();
        contract.RenewalPeriodMonths.Should().Be(renewalMonths);
        contract.RenewalPriceIncrease.Should().Be(priceIncrease);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void SetRenewalTerms_WithoutAutoRenewal_ShouldDisableRenewal()
    {
        // Arrange
        var contract = CreateContract();

        // Act
        contract.SetRenewalTerms(false);

        // Assert
        contract.AutoRenewal.Should().BeFalse();
        contract.RenewalPeriodMonths.Should().BeNull();
        contract.RenewalPriceIncrease.Should().BeNull();
    }

    [Fact]
    public void SetSLA_ShouldSetServiceLevelAgreementTerms()
    {
        // Arrange
        var contract = CreateContract();
        var uptimeGuarantee = 99.9m;
        var responseTimeHours = 4;
        var resolutionTimeHours = 24;
        var supportLevel = "Premium";

        // Act
        contract.SetSLA(uptimeGuarantee, responseTimeHours, resolutionTimeHours, supportLevel);

        // Assert
        contract.UptimeGuarantee.Should().Be(uptimeGuarantee);
        contract.ResponseTimeHours.Should().Be(responseTimeHours);
        contract.ResolutionTimeHours.Should().Be(resolutionTimeHours);
        contract.SupportLevel.Should().Be(supportLevel);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Sign_WhenDraft_ShouldSignContract()
    {
        // Arrange
        var contract = CreateContract();
        var signedBy = "John Doe";
        var signerTitle = "CEO";
        var signerEmail = "john@company.com";
        var documentUrl = "https://docs.example.com/contract.pdf";
        var documentHash = "sha256:abc123";

        // Act
        contract.Sign(signedBy, signerTitle, signerEmail, documentUrl, documentHash);

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        contract.SignedDate.Should().NotBeNull();
        contract.SignedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        contract.SignedBy.Should().Be(signedBy);
        contract.SignerTitle.Should().Be(signerTitle);
        contract.SignerEmail.Should().Be(signerEmail);
        contract.DocumentUrl.Should().Be(documentUrl);
        contract.DocumentHash.Should().Be(documentHash);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Sign_WhenApproved_ShouldSignContract()
    {
        // Arrange
        var contract = CreateContract();
        contract.Approve("approver@test.com");

        // Act
        contract.Sign("signer", "Manager", "signer@test.com", "url");

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
    }

    [Fact]
    public void Sign_WhenActive_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = CreateContract();
        contract.Sign("signer", "title", "email", "url");

        // Act
        var action = () => contract.Sign("another", "title", "email", "url");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Contract must be in draft or approved status to sign.");
    }

    [Fact]
    public void Approve_WhenDraftAndRequiresApproval_ShouldApproveContract()
    {
        // Arrange
        var contract = CreateContract(); // High value, requires approval
        var approvedBy = "manager@test.com";
        var notes = "Approved after legal review";

        // Act
        contract.Approve(approvedBy, notes);

        // Assert
        contract.Status.Should().Be(ContractStatus.Approved);
        contract.ApprovedDate.Should().NotBeNull();
        contract.ApprovedDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        contract.ApprovedBy.Should().Be(approvedBy);
        contract.ApprovalNotes.Should().Be(notes);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Approve_WhenNotRequiringApproval_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = TenantContract.Create(
            _tenantId,
            ContractType.Trial,
            _startDate,
            _endDate,
            5000m, // Low value, no approval needed
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );

        // Act
        var action = () => contract.Approve("approver");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Contract does not require approval.");
    }

    [Fact]
    public void Approve_WhenNotDraft_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = CreateContract();
        contract.Approve("approver1");

        // Act
        var action = () => contract.Approve("approver2");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only draft contracts can be approved.");
    }

    [Fact]
    public void Terminate_WhenActive_ShouldTerminateContract()
    {
        // Arrange
        var contract = CreateContract();
        contract.Sign("signer", "CEO", "email", "url");
        var terminatedBy = "legal@test.com";
        var reason = "Breach of contract terms";
        var terminationFee = 10000m;

        // Act
        contract.Terminate(terminatedBy, reason, terminationFee);

        // Assert
        contract.Status.Should().Be(ContractStatus.Terminated);
        contract.TerminationDate.Should().NotBeNull();
        contract.TerminationDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        contract.TerminatedBy.Should().Be(terminatedBy);
        contract.TerminationReason.Should().Be(reason);
        contract.EarlyTerminationFee.Should().Be(terminationFee);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Terminate_WhenNotActive_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = CreateContract();

        // Act
        var action = () => contract.Terminate("terminator", "reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only active contracts can be terminated.");
    }

    [Fact]
    public void Expire_WhenActive_ShouldExpireContract()
    {
        // Arrange
        var contract = CreateContract();
        contract.Sign("signer", "CEO", "email", "url");

        // Act
        contract.Expire();

        // Assert
        contract.Status.Should().Be(ContractStatus.Expired);
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Expire_WhenNotActive_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = CreateContract();

        // Act
        var action = () => contract.Expire();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only active contracts can expire.");
    }

    [Fact]
    public void Renew_WhenActiveWithAutoRenewal_ShouldRenewContract()
    {
        // Arrange
        var contract = CreateContract();
        contract.SetRenewalTerms(true, 12, 10m); // 10% increase
        contract.Sign("signer", "CEO", "email", "url");
        var newEndDate = _endDate.AddYears(1);

        // Act
        contract.Renew(newEndDate);

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        contract.EndDate.Should().Be(newEndDate);
        contract.ContractValue.Should().Be(_contractValue * 1.1m); // 10% increase
        contract.UpdatedAt.Should().NotBeNull();
    }

    [Fact]
    public void Renew_WhenExpiredWithAutoRenewal_ShouldRenewContract()
    {
        // Arrange
        var contract = CreateContract();
        contract.SetRenewalTerms(true);
        contract.Sign("signer", "CEO", "email", "url");
        contract.Expire();
        var newEndDate = _endDate.AddYears(1);
        var newValue = 60000m;

        // Act
        contract.Renew(newEndDate, newValue);

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        contract.EndDate.Should().Be(newEndDate);
        contract.ContractValue.Should().Be(newValue);
    }

    [Fact]
    public void Renew_WithoutAutoRenewal_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = CreateContract();
        contract.Sign("signer", "CEO", "email", "url");

        // Act
        var action = () => contract.Renew(_endDate.AddYears(1));

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Contract does not have auto-renewal enabled.");
    }

    [Fact]
    public void Renew_WhenDraft_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var contract = CreateContract();
        contract.SetRenewalTerms(true);

        // Act
        var action = () => contract.Renew(_endDate.AddYears(1));

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only active or expired contracts can be renewed.");
    }

    [Fact]
    public void ContractNumber_ShouldHaveCorrectFormat()
    {
        // Arrange
        var contract = CreateContract();

        // Assert
        contract.ContractNumber.Should().MatchRegex(@"^CNT-\d{8}-[A-Z0-9]{8}$");
    }

    [Fact]
    public void CompleteContractLifecycle_WithApproval_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var contract = TenantContract.Create(
            _tenantId,
            ContractType.Enterprise,
            _startDate,
            _endDate.AddYears(2),
            150000m, // High value, requires approval
            "EUR",
            PaymentTerms.Annual,
            "sales@company.com"
        );

        // Set contract terms
        contract.SetTerms(
            "Enterprise agreement terms with full support",
            "20% discount for 3-year commitment"
        );

        // Set SLA
        contract.SetSLA(99.99m, 2, 8, "Platinum");

        // Set renewal terms
        contract.SetRenewalTerms(true, 36, 3m);

        // Approve (required for high value)
        contract.Approve("cfo@company.com", "Approved after financial review");

        // Sign contract
        contract.Sign(
            "Jane Smith",
            "CEO",
            "jane@client.com",
            "https://contracts.example.com/ent-001.pdf",
            "sha256:xyz789"
        );

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        contract.RequiresApproval.Should().BeTrue();
        contract.ApprovedBy.Should().Be("cfo@company.com");
        contract.SignedBy.Should().Be("Jane Smith");
        contract.AutoRenewal.Should().BeTrue();
        contract.UptimeGuarantee.Should().Be(99.99m);
        contract.SupportLevel.Should().Be("Platinum");
    }

    [Fact]
    public void CompleteContractLifecycle_WithTermination_ShouldWorkCorrectly()
    {
        // Arrange
        var contract = CreateContract();
        contract.SetTerms("Standard terms");
        contract.Sign("client", "Manager", "client@test.com", "doc.pdf");

        // Act - Terminate early
        contract.Terminate(
            "legal@company.com",
            "Client requested early termination",
            5000m
        );

        // Assert
        contract.Status.Should().Be(ContractStatus.Terminated);
        contract.TerminationDate.Should().NotBeNull();
        contract.TerminatedBy.Should().Be("legal@company.com");
        contract.EarlyTerminationFee.Should().Be(5000m);
    }

    [Fact]
    public void CompleteContractLifecycle_WithRenewal_ShouldWorkCorrectly()
    {
        // Arrange
        var contract = CreateContract();
        contract.SetRenewalTerms(true, 12, 5m); // 5% annual increase
        contract.Sign("client", "CEO", "ceo@client.com", "contract.pdf");
        
        // Simulate contract expiring
        contract.Expire();

        // Act - Renew for another year
        var newEndDate = _endDate.AddYears(1);
        contract.Renew(newEndDate);

        // Assert
        contract.Status.Should().Be(ContractStatus.Active);
        contract.EndDate.Should().Be(newEndDate);
        contract.ContractValue.Should().Be(_contractValue * 1.05m); // 5% increase
    }

    private TenantContract CreateContract()
    {
        return TenantContract.Create(
            _tenantId,
            ContractType.Standard,
            _startDate,
            _endDate,
            _contractValue,
            _currency,
            PaymentTerms.Monthly,
            _createdBy
        );
    }
}