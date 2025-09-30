using Xunit;
using FluentAssertions;
using Stocker.Application.DTOs.Company;
using System;

namespace Stocker.UnitTests.Application.DTOs.Company
{
    public class CompanyDtoTests
    {
        [Fact]
        public void CompanyDto_Should_Initialize_With_Default_Values()
        {
            // Act
            var dto = new CompanyDto();

            // Assert
            dto.Id.Should().Be(Guid.Empty);
            dto.TenantId.Should().Be(Guid.Empty);
            dto.Name.Should().Be(string.Empty);
            dto.Code.Should().Be(string.Empty);
            dto.LegalName.Should().BeNull();
            dto.IdentityType.Should().BeNull();
            dto.IdentityNumber.Should().BeNull();
            dto.TaxNumber.Should().BeNull();
            dto.TaxOffice.Should().BeNull();
            dto.TradeRegisterNumber.Should().BeNull();
            dto.Email.Should().Be(string.Empty);
            dto.Phone.Should().Be(string.Empty);
            dto.Fax.Should().BeNull();
            dto.Address.Should().NotBeNull();
            dto.Website.Should().BeNull();
            dto.LogoUrl.Should().BeNull();
            dto.Sector.Should().BeNull();
            dto.EmployeeCount.Should().BeNull();
            dto.FoundedDate.Should().Be(default(DateTime));
            dto.Currency.Should().Be("TRY");
            dto.Timezone.Should().BeNull();
            dto.IsActive.Should().BeFalse();
            dto.CreatedAt.Should().Be(default(DateTime));
            dto.UpdatedAt.Should().BeNull();
        }

        [Fact]
        public void CompanyDto_Should_Set_All_Properties_Correctly()
        {
            // Arrange
            var id = Guid.NewGuid();
            var tenantId = Guid.NewGuid();
            var createdAt = DateTime.UtcNow;
            var updatedAt = DateTime.UtcNow.AddDays(1);
            var foundedDate = DateTime.UtcNow.AddYears(-10);

            // Act
            var dto = new CompanyDto
            {
                Id = id,
                TenantId = tenantId,
                Name = "Test Company",
                Code = "TST001",
                LegalName = "Test Company Ltd.",
                IdentityType = "Corporation",
                IdentityNumber = "123456789",
                TaxNumber = "TAX123",
                TaxOffice = "Central Tax Office",
                TradeRegisterNumber = "TR12345",
                Email = "info@testcompany.com",
                Phone = "+1234567890",
                Fax = "+0987654321",
                Address = new AddressDto
                {
                    Country = "Turkey",
                    City = "Istanbul",
                    District = "Kadikoy",
                    PostalCode = "34700",
                    AddressLine = "123 Main Street"
                },
                Website = "https://testcompany.com",
                LogoUrl = "https://testcompany.com/logo.png",
                Sector = "Technology",
                EmployeeCount = 50,
                FoundedDate = foundedDate,
                Currency = "USD",
                Timezone = "UTC",
                IsActive = true,
                CreatedAt = createdAt,
                UpdatedAt = updatedAt
            };

            // Assert
            dto.Id.Should().Be(id);
            dto.TenantId.Should().Be(tenantId);
            dto.Name.Should().Be("Test Company");
            dto.Code.Should().Be("TST001");
            dto.LegalName.Should().Be("Test Company Ltd.");
            dto.IdentityType.Should().Be("Corporation");
            dto.IdentityNumber.Should().Be("123456789");
            dto.TaxNumber.Should().Be("TAX123");
            dto.TaxOffice.Should().Be("Central Tax Office");
            dto.TradeRegisterNumber.Should().Be("TR12345");
            dto.Email.Should().Be("info@testcompany.com");
            dto.Phone.Should().Be("+1234567890");
            dto.Fax.Should().Be("+0987654321");
            dto.Website.Should().Be("https://testcompany.com");
            dto.LogoUrl.Should().Be("https://testcompany.com/logo.png");
            dto.Sector.Should().Be("Technology");
            dto.EmployeeCount.Should().Be(50);
            dto.FoundedDate.Should().Be(foundedDate);
            dto.Currency.Should().Be("USD");
            dto.Timezone.Should().Be("UTC");
            dto.IsActive.Should().BeTrue();
            dto.CreatedAt.Should().Be(createdAt);
            dto.UpdatedAt.Should().Be(updatedAt);
        }

        [Fact]
        public void AddressDto_Should_Initialize_With_Default_Values()
        {
            // Act
            var dto = new AddressDto();

            // Assert
            dto.Country.Should().Be(string.Empty);
            dto.City.Should().Be(string.Empty);
            dto.District.Should().Be(string.Empty);
            dto.PostalCode.Should().BeNull();
            dto.AddressLine.Should().Be(string.Empty);
        }

        [Fact]
        public void AddressDto_Should_Set_Properties_Correctly()
        {
            // Act
            var dto = new AddressDto
            {
                Country = "United States",
                City = "New York",
                District = "Manhattan",
                PostalCode = "10001",
                AddressLine = "123 Broadway"
            };

            // Assert
            dto.Country.Should().Be("United States");
            dto.City.Should().Be("New York");
            dto.District.Should().Be("Manhattan");
            dto.PostalCode.Should().Be("10001");
            dto.AddressLine.Should().Be("123 Broadway");
        }

        [Fact]
        public void CompanyDto_Should_Handle_Nullable_Properties()
        {
            // Act
            var dto = new CompanyDto
            {
                Name = "Minimal Company",
                Code = "MIN",
                Email = "min@company.com",
                Phone = "123456",
                LegalName = null,
                TaxNumber = null,
                Website = null,
                EmployeeCount = null,
                UpdatedAt = null
            };

            // Assert
            dto.LegalName.Should().BeNull();
            dto.TaxNumber.Should().BeNull();
            dto.Website.Should().BeNull();
            dto.EmployeeCount.Should().BeNull();
            dto.UpdatedAt.Should().BeNull();
        }
    }
}