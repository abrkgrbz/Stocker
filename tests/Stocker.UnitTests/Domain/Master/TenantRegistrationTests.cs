using FluentAssertions;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Xunit;

namespace Stocker.UnitTests.Domain.Master;

public class TenantRegistrationTests
{
    private readonly string _companyName = "Test Company";
    private readonly string _companyCode = "TST001";
    private readonly string _contactPersonName = "John";
    private readonly string _contactPersonSurname = "Doe";
    private readonly Email _contactEmail;
    private readonly PhoneNumber _contactPhone;
    private readonly string _addressLine1 = "123 Main St";
    private readonly string _city = "Istanbul";
    private readonly string _postalCode = "34000";
    private readonly string _country = "Turkey";
    private readonly Email _adminEmail;
    private readonly string _adminUsername = "admin";
    private readonly string _adminFirstName = "Admin";
    private readonly string _adminLastName = "User";

    public TenantRegistrationTests()
    {
        _contactEmail = Email.Create("contact@test.com").Value!;
        _contactPhone = PhoneNumber.Create("+905551234567").Value!;
        _adminEmail = Email.Create("admin@test.com").Value!;
    }

    [Fact]
    public void Create_WithValidData_ShouldCreateRegistration()
    {
        // Act
        var registration = TenantRegistration.Create(
            _companyName,
            _companyCode,
            _contactPersonName,
            _contactPersonSurname,
            _contactEmail,
            _contactPhone,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _adminEmail,
            _adminUsername,
            _adminFirstName,
            _adminLastName
        );

        // Assert
        registration.Should().NotBeNull();
        registration.Id.Should().NotBeEmpty();
        registration.RegistrationCode.Should().StartWith("REG-");
        registration.CompanyName.Should().Be(_companyName);
        registration.CompanyCode.Should().Be(_companyCode);
        registration.ContactPersonName.Should().Be(_contactPersonName);
        registration.ContactPersonSurname.Should().Be(_contactPersonSurname);
        registration.ContactEmail.Should().Be(_contactEmail);
        registration.ContactPhone.Should().Be(_contactPhone);
        registration.AddressLine1.Should().Be(_addressLine1);
        registration.City.Should().Be(_city);
        registration.PostalCode.Should().Be(_postalCode);
        registration.Country.Should().Be(_country);
        registration.AdminEmail.Should().Be(_adminEmail);
        registration.AdminUsername.Should().Be(_adminUsername);
        registration.AdminFirstName.Should().Be(_adminFirstName);
        registration.AdminLastName.Should().Be(_adminLastName);
        registration.Status.Should().Be(RegistrationStatus.Pending);
        registration.RegistrationDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        registration.EmailVerificationToken.Should().NotBeNullOrWhiteSpace();
        registration.PhoneVerificationCode.Should().NotBeNullOrWhiteSpace();
        registration.BillingCycle.Should().Be("Monthly");
        registration.PackageName.Should().Be("Trial");
        registration.EmailVerified.Should().BeFalse();
        registration.PhoneVerified.Should().BeFalse();
    }

    [Fact]
    public void Create_WithEmptyCompanyName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantRegistration.Create(
            "",
            _companyCode,
            _contactPersonName,
            _contactPersonSurname,
            _contactEmail,
            _contactPhone,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _adminEmail,
            _adminUsername,
            _adminFirstName,
            _adminLastName
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Company name cannot be empty.*")
            .WithParameterName("companyName");
    }

    [Fact]
    public void Create_WithEmptyCompanyCode_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantRegistration.Create(
            _companyName,
            "",
            _contactPersonName,
            _contactPersonSurname,
            _contactEmail,
            _contactPhone,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _adminEmail,
            _adminUsername,
            _adminFirstName,
            _adminLastName
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Company code cannot be empty.*")
            .WithParameterName("companyCode");
    }

    [Fact]
    public void Create_WithEmptyContactPersonName_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantRegistration.Create(
            _companyName,
            _companyCode,
            "",
            _contactPersonSurname,
            _contactEmail,
            _contactPhone,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _adminEmail,
            _adminUsername,
            _adminFirstName,
            _adminLastName
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Contact person name cannot be empty.*")
            .WithParameterName("contactPersonName");
    }

    [Fact]
    public void Create_WithEmptyContactPersonSurname_ShouldThrowArgumentException()
    {
        // Act
        var action = () => TenantRegistration.Create(
            _companyName,
            _companyCode,
            _contactPersonName,
            "",
            _contactEmail,
            _contactPhone,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _adminEmail,
            _adminUsername,
            _adminFirstName,
            _adminLastName
        );

        // Assert
        action.Should().Throw<ArgumentException>()
            .WithMessage("Contact person surname cannot be empty.*")
            .WithParameterName("contactPersonSurname");
    }

    [Fact]
    public void SetTaxInfo_ShouldUpdateTaxNumberAndOffice()
    {
        // Arrange
        var registration = CreateRegistration();
        var taxNumber = "1234567890";
        var taxOffice = "Kadikoy Tax Office";

        // Act
        registration.SetTaxInfo(taxNumber, taxOffice);

        // Assert
        registration.TaxNumber.Should().Be(taxNumber);
        registration.TaxOffice.Should().Be(taxOffice);
    }

    [Fact]
    public void SetCompanyDetails_ShouldUpdateWebsiteEmployeeCountAndIndustry()
    {
        // Arrange
        var registration = CreateRegistration();
        var website = "https://www.testcompany.com";
        var employeeCount = 50;
        var industry = "Technology";

        // Act
        registration.SetCompanyDetails(website, employeeCount, industry);

        // Assert
        registration.CompanyWebsite.Should().Be(website);
        registration.EmployeeCount.Should().Be(employeeCount);
        registration.Industry.Should().Be(industry);
    }

    [Fact]
    public void SelectPackage_ShouldSetPackageIdAndCodes()
    {
        // Arrange
        var registration = CreateRegistration();
        var packageId = Guid.NewGuid();
        var referralCode = "REF123";
        var promoCode = "PROMO50";

        // Act
        registration.SelectPackage(packageId, referralCode, promoCode);

        // Assert
        registration.SelectedPackageId.Should().Be(packageId);
        registration.ReferralCode.Should().Be(referralCode);
        registration.PromoCode.Should().Be(promoCode);
    }

    [Fact]
    public void SelectPackage_WithoutCodes_ShouldSetOnlyPackageId()
    {
        // Arrange
        var registration = CreateRegistration();
        var packageId = Guid.NewGuid();

        // Act
        registration.SelectPackage(packageId);

        // Assert
        registration.SelectedPackageId.Should().Be(packageId);
        registration.ReferralCode.Should().BeNull();
        registration.PromoCode.Should().BeNull();
    }

    [Fact]
    public void SetAdminInfo_ShouldUpdateAdminPhoneAndTitle()
    {
        // Arrange
        var registration = CreateRegistration();
        var adminPhone = "+905559999999";
        var adminTitle = "CEO";

        // Act
        registration.SetAdminInfo(adminPhone, adminTitle);

        // Assert
        registration.AdminPhone.Should().Be(adminPhone);
        registration.AdminTitle.Should().Be(adminTitle);
    }

    [Fact]
    public void SetBillingInfo_ShouldUpdatePackageNameAndBillingCycle()
    {
        // Arrange
        var registration = CreateRegistration();
        var packageName = "Professional";
        var billingCycle = "Annual";

        // Act
        registration.SetBillingInfo(packageName, billingCycle);

        // Assert
        registration.PackageName.Should().Be(packageName);
        registration.BillingCycle.Should().Be(billingCycle);
    }

    [Fact]
    public void VerifyEmail_WithValidToken_ShouldVerifyEmail()
    {
        // Arrange
        var registration = CreateRegistration();
        var token = registration.EmailVerificationToken;

        // Act
        registration.VerifyEmail(token!);

        // Assert
        registration.EmailVerified.Should().BeTrue();
        registration.EmailVerifiedAt.Should().NotBeNull();
        registration.EmailVerifiedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        registration.EmailVerificationToken.Should().BeNull();
    }

    [Fact]
    public void VerifyEmail_WithInvalidToken_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = CreateRegistration();

        // Act
        var action = () => registration.VerifyEmail("invalid-token");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Invalid verification token.");
    }

    [Fact]
    public void VerifyEmail_WhenAlreadyVerified_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = CreateRegistration();
        var token = registration.EmailVerificationToken;
        registration.VerifyEmail(token!);

        // Act
        var action = () => registration.VerifyEmail(token!);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Email already verified.");
    }

    [Fact]
    public void VerifyPhone_WithValidCode_ShouldVerifyPhone()
    {
        // Arrange
        var registration = CreateRegistration();
        var code = registration.PhoneVerificationCode;

        // Act
        registration.VerifyPhone(code!);

        // Assert
        registration.PhoneVerified.Should().BeTrue();
        registration.PhoneVerifiedAt.Should().NotBeNull();
        registration.PhoneVerifiedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        registration.PhoneVerificationCode.Should().BeNull();
    }

    [Fact]
    public void VerifyPhone_WithInvalidCode_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = CreateRegistration();

        // Act
        var action = () => registration.VerifyPhone("123456");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Invalid verification code.");
    }

    [Fact]
    public void VerifyPhone_WhenAlreadyVerified_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = CreateRegistration();
        var code = registration.PhoneVerificationCode;
        registration.VerifyPhone(code!);

        // Act
        var action = () => registration.VerifyPhone(code!);

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Phone already verified.");
    }

    [Fact]
    public void AcceptTerms_ShouldSetTermsAcceptedAndVersion()
    {
        // Arrange
        var registration = CreateRegistration();
        var termsVersion = "v1.0.0";

        // Act
        registration.AcceptTerms(termsVersion);

        // Assert
        registration.TermsAccepted.Should().BeTrue();
        registration.TermsAcceptedAt.Should().NotBeNull();
        registration.TermsAcceptedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        registration.TermsVersion.Should().Be(termsVersion);
    }

    [Fact]
    public void AcceptPrivacyPolicy_ShouldSetPrivacyPolicyAccepted()
    {
        // Arrange
        var registration = CreateRegistration();

        // Act
        registration.AcceptPrivacyPolicy();

        // Assert
        registration.PrivacyPolicyAccepted.Should().BeTrue();
        registration.PrivacyPolicyAcceptedAt.Should().NotBeNull();
        registration.PrivacyPolicyAcceptedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public void SetMarketingPreferences_ShouldUpdatePreferences()
    {
        // Arrange
        var registration = CreateRegistration();

        // Act
        registration.SetMarketingPreferences(true, false);

        // Assert
        registration.MarketingEmailsAllowed.Should().BeTrue();
        registration.MarketingSmsAllowed.Should().BeFalse();
    }

    [Fact]
    public void Approve_WhenPending_ShouldApproveRegistration()
    {
        // Arrange
        var registration = CreateRegistration();
        var approvedBy = "admin@system.com";
        var tenantId = Guid.NewGuid();

        // Act
        registration.Approve(approvedBy, tenantId);

        // Assert
        registration.Status.Should().Be(RegistrationStatus.Approved);
        registration.ApprovalDate.Should().NotBeNull();
        registration.ApprovalDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        registration.ApprovedBy.Should().Be(approvedBy);
        registration.TenantId.Should().Be(tenantId);
    }

    [Fact]
    public void Approve_WhenNotPending_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = CreateRegistration();
        registration.Approve("admin", Guid.NewGuid());

        // Act
        var action = () => registration.Approve("admin", Guid.NewGuid());

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending registrations can be approved.");
    }

    [Fact]
    public void Reject_WhenPending_ShouldRejectRegistration()
    {
        // Arrange
        var registration = CreateRegistration();
        var rejectedBy = "admin@system.com";
        var reason = "Invalid tax information";

        // Act
        registration.Reject(rejectedBy, reason);

        // Assert
        registration.Status.Should().Be(RegistrationStatus.Rejected);
        registration.RejectionDate.Should().NotBeNull();
        registration.RejectionDate.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
        registration.RejectedBy.Should().Be(rejectedBy);
        registration.RejectionReason.Should().Be(reason);
    }

    [Fact]
    public void Reject_WhenNotPending_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = CreateRegistration();
        registration.Reject("admin", "reason");

        // Act
        var action = () => registration.Reject("admin", "another reason");

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending registrations can be rejected.");
    }

    [Fact]
    public void Cancel_WhenPending_ShouldCancelRegistration()
    {
        // Arrange
        var registration = CreateRegistration();

        // Act
        registration.Cancel();

        // Assert
        registration.Status.Should().Be(RegistrationStatus.Cancelled);
    }

    [Fact]
    public void Cancel_WhenNotPending_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var registration = CreateRegistration();
        registration.Cancel();

        // Act
        var action = () => registration.Cancel();

        // Assert
        action.Should().Throw<InvalidOperationException>()
            .WithMessage("Only pending registrations can be cancelled.");
    }

    [Fact]
    public void CompleteRegistrationWorkflow_ShouldWorkCorrectly()
    {
        // Arrange & Act
        var registration = TenantRegistration.Create(
            _companyName,
            _companyCode,
            _contactPersonName,
            _contactPersonSurname,
            _contactEmail,
            _contactPhone,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _adminEmail,
            _adminUsername,
            _adminFirstName,
            _adminLastName
        );

        // Set additional details
        registration.SetTaxInfo("1234567890", "Kadikoy Tax Office");
        registration.SetCompanyDetails("https://test.com", 100, "Technology");
        registration.SetAdminInfo("+905559999999", "CEO");
        registration.SetBillingInfo("Professional", "Annual");

        // Select package
        var packageId = Guid.NewGuid();
        registration.SelectPackage(packageId, "REF123", "PROMO50");

        // Verify email and phone
        var emailToken = registration.EmailVerificationToken;
        var phoneCode = registration.PhoneVerificationCode;
        registration.VerifyEmail(emailToken!);
        registration.VerifyPhone(phoneCode!);

        // Accept terms and privacy policy
        registration.AcceptTerms("v1.0.0");
        registration.AcceptPrivacyPolicy();

        // Set marketing preferences
        registration.SetMarketingPreferences(true, true);

        // Approve registration
        var tenantId = Guid.NewGuid();
        registration.Approve("admin@system.com", tenantId);

        // Assert
        registration.Status.Should().Be(RegistrationStatus.Approved);
        registration.TenantId.Should().Be(tenantId);
        registration.EmailVerified.Should().BeTrue();
        registration.PhoneVerified.Should().BeTrue();
        registration.TermsAccepted.Should().BeTrue();
        registration.PrivacyPolicyAccepted.Should().BeTrue();
        registration.MarketingEmailsAllowed.Should().BeTrue();
        registration.MarketingSmsAllowed.Should().BeTrue();
    }

    [Fact]
    public void RegistrationCode_ShouldHaveCorrectFormat()
    {
        // Arrange
        var registration = CreateRegistration();

        // Assert
        registration.RegistrationCode.Should().MatchRegex(@"^REG-\d{8}-[A-Z0-9]{8}$");
    }

    [Fact]
    public void PhoneVerificationCode_ShouldBeSixDigits()
    {
        // Arrange
        var registration = CreateRegistration();

        // Assert
        registration.PhoneVerificationCode.Should().MatchRegex(@"^\d{6}$");
    }

    private TenantRegistration CreateRegistration()
    {
        return TenantRegistration.Create(
            _companyName,
            _companyCode,
            _contactPersonName,
            _contactPersonSurname,
            _contactEmail,
            _contactPhone,
            _addressLine1,
            _city,
            _postalCode,
            _country,
            _adminEmail,
            _adminUsername,
            _adminFirstName,
            _adminLastName
        );
    }
}