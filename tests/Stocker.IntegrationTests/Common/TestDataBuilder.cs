using Bogus;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.Domain.Master.ValueObjects;
using Stocker.Domain.Tenant.Entities;
using TenantEntity = Stocker.Domain.Master.Entities.Tenant;
using MasterUserType = Stocker.Domain.Master.Enums.UserType;
using MasterBillingCycle = Stocker.Domain.Master.Enums.BillingCycle;
using MasterPackageType = Stocker.Domain.Master.Enums.PackageType;
using MasterSubscriptionStatus = Stocker.Domain.Master.Enums.SubscriptionStatus;

namespace Stocker.IntegrationTests.Common;

public class TestDataBuilder
{
    private readonly Faker _faker = new();

    public MasterUser CreateMasterUser(
        string? username = null, 
        string? email = null,
        bool isActive = true)
    {
        username ??= _faker.Internet.UserName();
        email ??= _faker.Internet.Email();
        
        var user = MasterUser.Create(
            username: username,
            email: Email.Create(email).Value,
            plainPassword: "Test123!@#",
            firstName: _faker.Name.FirstName(),
            lastName: _faker.Name.LastName(),
            userType: MasterUserType.Personel,
            phoneNumber: PhoneNumber.Create($"+90555{_faker.Random.Number(1000000, 9999999)}").Value);

        if (isActive)
        {
            user.Activate();
            user.VerifyEmail();
        }

        return user;
    }

    public TenantEntity CreateTenant(
        string? name = null,
        string? code = null,
        bool isActive = true)
    {
        name ??= _faker.Company.CompanyName();
        code ??= _faker.Random.AlphaNumeric(6).ToLower();
        
        var tenant = TenantEntity.Create(
            name: name,
            code: code,
            databaseName: $"DB_{code}",
            connectionString: ConnectionString.Create($"Server=localhost;Database=DB_{code};").Value,
            contactEmail: Email.Create(_faker.Internet.Email()).Value,
            contactPhone: PhoneNumber.Create($"+90555{_faker.Random.Number(1000000, 9999999)}").Value,
            description: _faker.Lorem.Sentence(),
            logoUrl: null);

        // Tenant is created as active by default, only deactivate if needed
        if (!isActive)
        {
            tenant.Deactivate();
        }

        return tenant;
    }

    public Package CreatePackage(
        string? name = null,
        MasterPackageType? type = null,
        bool isActive = true)
    {
        name ??= _faker.Commerce.ProductName();
        type ??= _faker.PickRandom<MasterPackageType>();
        
        var package = Package.Create(
            name: name,
            type: type.Value,
            basePrice: Money.Create(_faker.Random.Decimal(100, 1000), "USD"),
            limits: PackageLimit.Create(
                maxUsers: _faker.Random.Number(10, 100),
                maxStorage: _faker.Random.Number(1000, 100000),
                maxProjects: _faker.Random.Number(1, 50),
                maxApiCalls: _faker.Random.Number(1000, 10000)),
            description: _faker.Lorem.Sentence(),
            trialDays: _faker.Random.Number(7, 30),
            displayOrder: _faker.Random.Number(1, 10),
            isPublic: true);

        if (isActive)
        {
            package.Activate();
        }

        return package;
    }

    public Subscription CreateSubscription(
        TenantEntity tenant,
        Package package,
        MasterSubscriptionStatus? status = null)
    {
        status ??= MasterSubscriptionStatus.Aktif;
        
        var subscription = Subscription.Create(
            tenantId: tenant.Id,
            packageId: package.Id,
            billingCycle: MasterBillingCycle.Aylik,
            price: package.BasePrice,
            startDate: DateTime.UtcNow,
            trialEndDate: DateTime.UtcNow.AddDays(package.TrialDays));

        if (status == MasterSubscriptionStatus.Aktif)
        {
            subscription.Activate();
        }

        return subscription;
    }

    public Company CreateCompany(
        Guid tenantId,
        string? name = null,
        string? email = null)
    {
        name ??= _faker.Company.CompanyName();
        email ??= _faker.Internet.Email();
        
        var address = CompanyAddress.Create(
            country: "Türkiye",
            city: _faker.Address.City(),
            district: _faker.Address.County(),
            postalCode: _faker.Address.ZipCode(),
            addressLine: _faker.Address.FullAddress()).Value;

        return Company.Create(
            tenantId: tenantId,
            name: name,
            code: _faker.Random.AlphaNumeric(6).ToUpper(),
            taxNumber: _faker.Random.Int(100000000, 999999999).ToString() + _faker.Random.Int(0, 9).ToString(),
            email: Email.Create(email).Value,
            address: address,
            phone: PhoneNumber.Create($"+90555{_faker.Random.Number(1000000, 9999999)}").Value);
    }

    public TenantUser CreateTenantUser(
        Guid tenantId,
        string? username = null,
        string? email = null)
    {
        username ??= _faker.Internet.UserName();
        email ??= _faker.Internet.Email();
        
        var user = TenantUser.Create(
            tenantId: tenantId,
            masterUserId: Guid.NewGuid(),
            username: username,
            email: Email.Create(email).Value,
            firstName: _faker.Name.FirstName(),
            lastName: _faker.Name.LastName(),
            employeeCode: _faker.Random.AlphaNumeric(6).ToUpper(),
            phone: null,
            mobile: PhoneNumber.Create($"+90555{_faker.Random.Number(1000000, 9999999)}").Value);
        
        return user;
    }

    public Department CreateDepartment(
        Guid tenantId,
        Guid companyId,
        string? name = null)
    {
        name ??= _faker.Commerce.Department();
        
        var department = new Department(
            tenantId: tenantId,
            companyId: companyId,
            name: name,
            code: _faker.Random.AlphaNumeric(4).ToUpper(),
            description: _faker.Lorem.Sentence());
        
        return department;
    }

    public Branch CreateBranch(
        Guid tenantId,
        Guid companyId,
        string? name = null,
        string? code = null)
    {
        name ??= $"{_faker.Address.City()} Branch";
        code ??= _faker.Random.AlphaNumeric(4).ToUpper();
        
        var address = Address.Create(
            street: _faker.Address.StreetAddress(),
            city: _faker.Address.City(),
            country: "Türkiye",
            postalCode: _faker.Address.ZipCode());

        var branch = new Branch(
            tenantId: tenantId,
            companyId: companyId,
            name: name,
            address: address,
            phone: PhoneNumber.Create($"+90555{_faker.Random.Number(1000000, 9999999)}").Value,
            code: code);
        
        return branch;
    }
}