using Bogus;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.TestUtilities;

public static class TestDataBuilder
{
    private static readonly Faker _faker = new();

    public static class Master
    {
        public static Domain.Master.Entities.MasterUser CreateUser(string? email = null)
        {
            var emailResult = Email.Create(email ?? _faker.Internet.Email());
            if (emailResult.IsFailure)
                throw new InvalidOperationException($"Failed to create email: {emailResult.Error}");
            
            var phoneResult = PhoneNumber.Create("+905551234567"); // Use a valid Turkish phone number
            if (phoneResult.IsFailure)
                throw new InvalidOperationException($"Failed to create phone: {phoneResult.Error}");
            
            return Domain.Master.Entities.MasterUser.Create(
                _faker.Internet.UserName(),
                emailResult.Value,
                _faker.Internet.Password(),
                _faker.Name.FirstName(),
                _faker.Name.LastName(),
                Domain.Master.Enums.UserType.SistemYoneticisi,
                phoneResult.Value
            );
        }

        public static Domain.Master.Entities.Tenant CreateTenant(string? name = null)
        {
            var connectionString = Domain.Master.ValueObjects.ConnectionString.Create(
                $"Server=localhost;Database=TestDb_{Guid.NewGuid():N};User Id=sa;Password=TestPass123!;TrustServerCertificate=true"
            ).Value;
            
            var emailValue = Email.Create(_faker.Internet.Email()).Value;
            
            var tenant = Domain.Master.Entities.Tenant.Create(
                name ?? _faker.Company.CompanyName(),
                _faker.Internet.DomainName(),
                $"TestDb_{Guid.NewGuid():N}",
                connectionString,
                emailValue
            );
            
            return tenant;
        }
    }

    public static class TenantData
    {
        public static Domain.Tenant.Entities.Customer CreateCustomer(Guid tenantId, string? name = null)
        {
            var emailResult = Email.Create(_faker.Internet.Email());
            if (emailResult.IsFailure)
                throw new InvalidOperationException($"Failed to create email: {emailResult.Error}");
            
            var phoneResult = PhoneNumber.Create("+905551234567"); // Use a valid Turkish phone number
            if (phoneResult.IsFailure)
                throw new InvalidOperationException($"Failed to create phone: {phoneResult.Error}");
            
            var addressValue = Address.Create(
                _faker.Address.StreetAddress(),
                _faker.Address.City(),
                _faker.Address.Country(),
                _faker.Address.ZipCode(),
                state: _faker.Address.State()
            );
            
            var customer = Domain.Tenant.Entities.Customer.Create(
                tenantId,
                name ?? _faker.Company.CompanyName(),
                emailResult.Value,
                phoneResult.Value,
                addressValue
            );
            
            return customer;
        }

        public static Domain.Tenant.Entities.Product CreateProduct(Guid tenantId, string? name = null)
        {
            var product = Domain.Tenant.Entities.Product.Create(
                tenantId,
                _faker.Commerce.ProductName(),
                _faker.Commerce.Product(),
                _faker.Commerce.Ean13(),
                Money.Create(decimal.Parse(_faker.Commerce.Price()), "TRY")
            );
            
            return product;
        }

        public static Domain.Tenant.Entities.Invoice CreateInvoice(Guid tenantId, Guid customerId)
        {
            var invoice = Domain.Tenant.Entities.Invoice.Create(
                tenantId,
                $"INV-{_faker.Random.Number(1000, 9999)}",
                customerId,
                DateTime.UtcNow,
                DateTime.UtcNow.AddDays(30)
            );
            
            return invoice;
        }

        public static Domain.Tenant.Entities.Company CreateCompany(Guid tenantId, string? name = null)
        {
            var emailValue = Email.Create(_faker.Internet.Email()).Value;
            var phoneValue = PhoneNumber.Create(_faker.Phone.PhoneNumber()).Value;
            var addressValue = Domain.Common.ValueObjects.CompanyAddress.Create(
                _faker.Address.StreetAddress(),
                _faker.Address.City(),
                _faker.Address.State(),
                _faker.Address.ZipCode(),
                _faker.Address.Country()
            ).Value;
            
            var company = Domain.Tenant.Entities.Company.Create(
                tenantId,
                name ?? _faker.Company.CompanyName(),
                _faker.Company.Random.AlphaNumeric(10),
                emailValue.Value,
                emailValue,
                addressValue
            );
            
            return company;
        }
    }
}