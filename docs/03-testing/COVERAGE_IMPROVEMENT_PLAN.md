# 📈 Coverage İyileştirme Planı

## 🎯 Mevcut Durum Analizi

### Kritik Problem Alanları:
| Modül | Mevcut Coverage | Hedef | Öncelik |
|-------|----------------|--------|---------|
| **Stocker.API** | %0 | %70 | 🔴 Kritik |
| **Stocker.Identity** | %0 | %80 | 🔴 Kritik |
| **Stocker.Application** | %2.7 | %75 | 🔴 Kritik |
| **Stocker.Domain** | %11 | %85 | 🟡 Yüksek |
| **Stocker.Infrastructure** | %5.6 | %60 | 🟡 Yüksek |
| **Stocker.Persistence** | %3.7 | %50 | 🟢 Orta |

## 🚨 Neden Bu Kadar Düşük?

1. **API Controller'lar hiç test edilmemiş** (%0)
   - Authentication endpoints
   - Tenant management
   - Customer/Invoice operations

2. **Identity/Security katmanı test edilmemiş** (%0)
   - JWT token generation
   - Authentication service
   - Authorization logic

3. **Application Handler'lar test edilmemiş** (%2.7)
   - CQRS command/query handlers
   - Business logic validation
   - Transaction management

4. **Integration testler başarısız**
   - Database connection sorunları
   - Test isolation problemleri
   - Fixture configuration hataları

## 📋 ACİL EYLEM PLANI

### Fase 1: Kritik Güvenlik ve Auth Testleri (1-2 gün)
```csharp
// 🔴 ÖNCELİK 1: Authentication Tests
- [ ] JWT Token Generation Tests
- [ ] Login/Logout Flow Tests
- [ ] Password Reset Tests
- [ ] Token Refresh Tests
- [ ] Multi-tenant Auth Tests
```

### Fase 2: API Controller Testleri (2-3 gün)
```csharp
// 🔴 ÖNCELİK 2: API Integration Tests
- [ ] AuthController Tests
- [ ] TenantsController Tests
- [ ] CustomersController Tests
- [ ] InvoicesController Tests
- [ ] HealthController Tests
```

### Fase 3: Business Logic Testleri (3-4 gün)
```csharp
// 🟡 ÖNCELİK 3: Application Layer Tests
- [ ] Customer CRUD Handler Tests
- [ ] Invoice Processing Tests
- [ ] Tenant Registration Tests
- [ ] Payment Processing Tests
- [ ] Notification Service Tests
```

### Fase 4: Domain Model Testleri (1-2 gün)
```csharp
// 🟢 ÖNCELİK 4: Domain Tests
- [ ] Entity Validation Tests
- [ ] Value Object Tests
- [ ] Domain Event Tests
- [ ] Business Rule Tests
```

## 🎯 HEDEFLER

### Kısa Vade (1 Hafta)
- **Minimum %30 coverage**
- Tüm kritik auth/security pathler
- Temel CRUD operasyonları

### Orta Vade (1 Ay)
- **Minimum %60 coverage**
- Tüm API endpoints
- Core business logic
- Integration test suite

### Uzun Vade (3 Ay)
- **Minimum %80 coverage**
- E2E test scenarios
- Performance tests
- Security penetration tests

## 💊 Hızlı İyileştirme Önerileri

### 1. Low-Hanging Fruits (Hemen Yapılabilecekler)
```csharp
// Simple entity validation tests
[Fact]
public void Customer_Should_Require_Email()
{
    var customer = new Customer();
    var result = customer.Validate();
    result.Should().ContainError("Email is required");
}

// Basic API health check
[Fact]
public async Task Health_Check_Should_Return_Ok()
{
    var response = await _client.GetAsync("/health");
    response.StatusCode.Should().Be(HttpStatusCode.OK);
}
```

### 2. Critical Path Coverage
```csharp
// Authentication flow
[Fact]
public async Task Login_With_Valid_Credentials_Should_Return_Token()
{
    var loginRequest = new { Email = "test@test.com", Password = "Test123!" };
    var response = await _client.PostAsJsonAsync("/api/auth/login", loginRequest);
    
    response.StatusCode.Should().Be(HttpStatusCode.OK);
    var content = await response.Content.ReadAsAsync<AuthResponse>();
    content.Token.Should().NotBeNullOrEmpty();
}
```

### 3. Business Logic Tests
```csharp
// Invoice calculation
[Fact]
public void Invoice_Should_Calculate_Total_Correctly()
{
    var invoice = new Invoice();
    invoice.AddItem(new InvoiceItem { Quantity = 2, UnitPrice = 100 });
    invoice.AddItem(new InvoiceItem { Quantity = 1, UnitPrice = 50 });
    
    invoice.CalculateTotal();
    
    invoice.Total.Should().Be(250);
}
```

## 🛠️ Test Altyapısı İyileştirmeleri

### 1. Test Fixture Optimization
```csharp
public class ApiTestFixture : IAsyncLifetime
{
    public HttpClient Client { get; private set; }
    public IServiceProvider Services { get; private set; }
    
    public async Task InitializeAsync()
    {
        // Shared test setup
        var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(builder =>
            {
                builder.ConfigureServices(services =>
                {
                    // Use in-memory database
                    services.AddDbContext<AppDbContext>(options =>
                        options.UseInMemoryDatabase("TestDb"));
                });
            });
            
        Client = factory.CreateClient();
        Services = factory.Services;
    }
}
```

### 2. Test Data Builders
```csharp
public class CustomerBuilder
{
    private Customer _customer = new();
    
    public CustomerBuilder WithEmail(string email)
    {
        _customer.Email = email;
        return this;
    }
    
    public CustomerBuilder WithValidData()
    {
        _customer.Email = "test@example.com";
        _customer.Name = "Test Customer";
        _customer.Phone = "1234567890";
        return this;
    }
    
    public Customer Build() => _customer;
}
```

### 3. Integration Test Base
```csharp
public abstract class IntegrationTestBase : IClassFixture<ApiTestFixture>
{
    protected HttpClient Client { get; }
    protected IServiceProvider Services { get; }
    
    protected IntegrationTestBase(ApiTestFixture fixture)
    {
        Client = fixture.Client;
        Services = fixture.Services;
    }
    
    protected async Task<T> WithScope<T>(Func<IServiceScope, Task<T>> action)
    {
        using var scope = Services.CreateScope();
        return await action(scope);
    }
}
```

## 📊 Coverage Monitoring

### CI/CD Pipeline Integration
```yaml
- name: Run Tests with Coverage Gate
  run: |
    dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura
    if [ $(coverage) -lt 30 ]; then
      echo "Coverage below 30%! Build failed."
      exit 1
    fi
```

### Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
dotnet test /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura
COVERAGE=$(grep 'line-rate' coverage.cobertura.xml | grep -o '[0-9.]*')
if (( $(echo "$COVERAGE < 0.30" | bc -l) )); then
  echo "Coverage is below 30%. Please add more tests."
  exit 1
fi
```

## 🎬 Başlangıç için Örnek Test Sınıfı

```csharp
// tests/Stocker.UnitTests/API/Controllers/AuthControllerTests.cs
public class AuthControllerTests : IntegrationTestBase
{
    public AuthControllerTests(ApiTestFixture fixture) : base(fixture) { }
    
    [Fact]
    public async Task Register_WithValidData_ShouldCreateUser()
    {
        // Arrange
        var request = new RegisterRequest
        {
            Email = "newuser@test.com",
            Password = "Test123!",
            ConfirmPassword = "Test123!",
            FirstName = "John",
            LastName = "Doe"
        };
        
        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/register", request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var content = await response.Content.ReadAsAsync<AuthResponse>();
        content.Token.Should().NotBeNullOrEmpty();
    }
    
    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        // Arrange
        var request = new LoginRequest
        {
            Email = "wrong@test.com",
            Password = "WrongPass123!"
        };
        
        // Act
        var response = await Client.PostAsJsonAsync("/api/auth/login", request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
```

## 🚀 Sonraki Adımlar

1. **Bu planı onaylayın**
2. **Öncelikli alanları belirleyin**
3. **Test yazımına başlayalım**
4. **CI/CD'ye coverage gate ekleyelim**
5. **Takım ile coverage hedefleri belirleyin**

## 💡 Önemli Notlar

- **Test yazarken TDD yaklaşımını benimseyin**
- **Her bug fix'ten önce failing test yazın**
- **Code review'larda test coverage'ı kontrol edin**
- **Sprint planning'de test task'ları ekleyin**
- **Coverage badge'ini README'ye ekleyin**

---

**⚠️ UYARI**: %12 coverage ile production'a çıkmak çok riskli! En azından kritik pathler için %60+ coverage sağlanmalı.