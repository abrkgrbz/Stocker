# 🔧 Stocker ERP - Refactoring ve Eksik Tamamlama Roadmap

## 📊 Mevcut Durum Analizi

### Tespit Edilen Kritik Sorunlar

#### 🔴 **Kritik - Tamamlanmamış İşlevler (20+ TODO)**
- CRM modülünde UpdateCustomer ve DeleteCustomer eksik
- Invoice controller'da 6 endpoint implementasyonu eksik
- Pipeline handlers tamamen boş
- MasterUser update metodları eksik

#### 🔴 **Kritik - Hata Yönetimi**
- 89 dosyada generic Exception catch (anti-pattern)
- Global error handling eksik
- Structured error response yok
- Error logging tutarsız

#### 🟡 **Yüksek - Güvenlik Sorunları**
- SmtpPassword şifrelenmemiş saklanıyor
- Hangfire authorization filter devre dışı
- Rate limiting gerçek implementasyon eksik
- SQL Injection riski olan sorgular

#### 🟡 **Yüksek - Mimari Sorunlar**
- CRM DbContext circular dependency riski
- Generic repository pattern tutarsız kullanım
- CQRS pattern bazı yerlerde bypass ediliyor
- Domain events kullanılmıyor

#### 🟢 **Orta - Kod Kalitesi**
- Test coverage %0 (hiç test yok!)
- Duplicate code fazla
- Naming convention tutarsızlıkları
- Magic string/number kullanımı

---

## 📅 Faz 1: Kritik Eksiklerin Tamamlanması (1-2 Hafta)

### Sprint 1.1: CRM Modülü Tamamlama (3 gün)

```csharp
// ✅ Tamamlanacaklar:
1. CustomersController
   - [ ] UpdateCustomerCommand implementation
   - [ ] DeleteCustomerCommand implementation
   - [ ] Validation rules
   - [ ] Error handling

2. Pipeline Management
   - [ ] CreatePipelineCommandHandler
   - [ ] GetPipelinesQueryHandler
   - [ ] Pipeline stages CRUD
   - [ ] Drag-drop stage update

3. Activity Management
   - [ ] Activity entity
   - [ ] Activity tracking
   - [ ] Timeline view
```

**Örnek Implementation:**
```csharp
// UpdateCustomerCommand.cs
public class UpdateCustomerCommand : IRequest<Result<CustomerDto>>
{
    public Guid Id { get; set; }
    public string Name { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string TaxNumber { get; set; }
}

// UpdateCustomerCommandHandler.cs
public async Task<Result<CustomerDto>> Handle(UpdateCustomerCommand request, CancellationToken cancellationToken)
{
    var customer = await _repository.GetByIdAsync(request.Id);
    if (customer == null)
        return Result.Failure<CustomerDto>(CustomerErrors.NotFound);
    
    customer.Update(request.Name, request.Email, request.Phone, request.TaxNumber);
    await _unitOfWork.SaveChangesAsync(cancellationToken);
    
    return Result.Success(_mapper.Map<CustomerDto>(customer));
}
```

### Sprint 1.2: Invoice Modülü Tamamlama (3 gün)

```csharp
// ✅ Tamamlanacaklar:
1. InvoicesController
   - [ ] GetInvoiceByIdQuery
   - [ ] SendInvoiceCommand
   - [ ] MarkInvoiceAsPaidCommand
   - [ ] CancelInvoiceCommand
   - [ ] UpdateInvoiceCommand
   - [ ] DeleteInvoiceCommand

2. E-Fatura Entegrasyonu
   - [ ] GİB servis entegrasyonu
   - [ ] PDF generation
   - [ ] Email gönderimi
```

### Sprint 1.3: MasterUser Update İşlemleri (2 gün)

```csharp
// ✅ MasterUser entity'ye eklenecek metodlar:
public void UpdateEmail(Email newEmail)
{
    Email = newEmail;
    UpdatedAt = DateTime.UtcNow;
    RaiseDomainEvent(new MasterUserEmailUpdatedEvent(Id, newEmail));
}

public void UpdateProfile(string firstName, string lastName, PhoneNumber phone)
{
    FirstName = firstName;
    LastName = lastName;
    PhoneNumber = phone;
    UpdatedAt = DateTime.UtcNow;
}
```

---

## 📅 Faz 2: Hata Yönetimi Refactoring (1 Hafta)

### Sprint 2.1: Global Exception Handling (2 gün)

```csharp
// 🔧 GlobalExceptionMiddleware refactor
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var response = exception switch
        {
            ValidationException validationEx => CreateValidationErrorResponse(validationEx),
            NotFoundException notFoundEx => CreateNotFoundResponse(notFoundEx),
            UnauthorizedException => CreateUnauthorizedResponse(),
            DomainException domainEx => CreateDomainErrorResponse(domainEx),
            _ => CreateInternalErrorResponse(exception)
        };

        context.Response.StatusCode = response.StatusCode;
        await context.Response.WriteAsJsonAsync(response);
    }
}
```

### Sprint 2.2: Structured Error Response (2 gün)

```csharp
// 🔧 Yeni Error Response yapısı
public class ApiErrorResponse
{
    public string Type { get; set; }
    public string Title { get; set; }
    public int Status { get; set; }
    public string Detail { get; set; }
    public string Instance { get; set; }
    public string TraceId { get; set; }
    public Dictionary<string, string[]> Errors { get; set; }
}
```

### Sprint 2.3: Logging Standardization (1 gün)

```csharp
// 🔧 Structured logging pattern
_logger.LogError(ex, 
    "Error processing {Operation} for {Entity} with Id {EntityId}",
    nameof(UpdateCustomer),
    nameof(Customer),
    request.Id);
```

---

## 📅 Faz 3: Güvenlik İyileştirmeleri (1 Hafta)

### Sprint 3.1: Sensitive Data Encryption (2 gün)

```csharp
// 🔐 Password encryption implementation
public class EncryptionService : IEncryptionService
{
    private readonly IDataProtector _protector;
    
    public string Encrypt(string plainText)
    {
        return _protector.Protect(plainText);
    }
    
    public string Decrypt(string cipherText)
    {
        return _protector.Unprotect(cipherText);
    }
}

// Usage in SettingsController
emailSettings["smtpPassword"] = _encryptionService.Encrypt(request.SmtpPassword);
```

### Sprint 3.2: Rate Limiting Implementation (2 gün)

```csharp
// 🔐 Real rate limiting with Redis
public class TenantRateLimiter
{
    private readonly IConnectionMultiplexer _redis;
    
    public async Task<bool> IsRateLimitExceeded(string tenantId, string endpoint)
    {
        var db = _redis.GetDatabase();
        var key = $"rate_limit:{tenantId}:{endpoint}";
        
        var count = await db.StringIncrementAsync(key);
        if (count == 1)
        {
            await db.KeyExpireAsync(key, TimeSpan.FromMinutes(1));
        }
        
        return count > 100; // 100 requests per minute
    }
}
```

### Sprint 3.3: SQL Injection Prevention (1 gün)

```csharp
// 🔐 Parameterized queries
// ❌ YANLIŞ
var query = $"SELECT * FROM Customers WHERE Name = '{name}'";

// ✅ DOĞRU
var customers = await _context.Customers
    .Where(c => c.Name == name)
    .ToListAsync();
```

---

## 📅 Faz 4: Test Altyapısı Kurulumu (2 Hafta)

### Sprint 4.1: Unit Test Setup (3 gün)

```csharp
// 🧪 Test project structure
Stocker.Tests/
├── Unit/
│   ├── Domain/
│   │   └── CustomerTests.cs
│   ├── Application/
│   │   └── UpdateCustomerCommandHandlerTests.cs
│   └── Infrastructure/
│       └── RepositoryTests.cs
├── Integration/
│   └── API/
│       └── CustomersControllerTests.cs
└── Fixtures/
    └── TestDataBuilder.cs
```

**Örnek Unit Test:**
```csharp
[Fact]
public async Task UpdateCustomer_Should_Update_Successfully()
{
    // Arrange
    var customer = Customer.Create("Test", "test@test.com", "5551234567");
    var repository = new Mock<ICustomerRepository>();
    repository.Setup(x => x.GetByIdAsync(It.IsAny<Guid>()))
              .ReturnsAsync(customer);
    
    var handler = new UpdateCustomerCommandHandler(repository.Object, _mapper);
    var command = new UpdateCustomerCommand { Id = customer.Id, Name = "Updated" };
    
    // Act
    var result = await handler.Handle(command, CancellationToken.None);
    
    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value.Name.Should().Be("Updated");
}
```

### Sprint 4.2: Integration Tests (3 gün)

```csharp
// 🧪 API Integration test
public class CustomersControllerTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    
    [Fact]
    public async Task Get_Customers_Returns_Success()
    {
        // Arrange
        var client = _factory.CreateClient();
        
        // Act
        var response = await client.GetAsync("/api/v1/customers");
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        content.Should().Contain("customers");
    }
}
```

### Sprint 4.3: Test Coverage Goals (2 gün)

```yaml
Coverage Targets:
- Domain Layer: %90
- Application Layer: %80
- API Controllers: %70
- Infrastructure: %60

CI/CD Integration:
- GitHub Actions workflow
- Automatic test run on PR
- Coverage report generation
- SonarQube integration
```

---

## 📅 Faz 5: Mimari Refactoring (2-3 Hafta)

### Sprint 5.1: Repository Pattern Standardization (3 gün)

```csharp
// 🏗️ Generic Repository refactor
public interface IRepository<T> where T : AggregateRoot
{
    Task<T> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<T>> GetAsync(ISpecification<T> spec, CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    Task<int> CountAsync(ISpecification<T> spec, CancellationToken cancellationToken = default);
}
```

### Sprint 5.2: Domain Events Implementation (3 gün)

```csharp
// 🏗️ Domain Event handling
public class CustomerCreatedDomainEvent : DomainEvent
{
    public Guid CustomerId { get; }
    public string CustomerName { get; }
    
    public CustomerCreatedDomainEvent(Guid customerId, string customerName)
    {
        CustomerId = customerId;
        CustomerName = customerName;
    }
}

// Event Handler
public class CustomerCreatedDomainEventHandler : INotificationHandler<CustomerCreatedDomainEvent>
{
    public async Task Handle(CustomerCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        // Send welcome email
        // Create initial pipeline stage
        // Log activity
    }
}
```

### Sprint 5.3: CRM Module Separation (4 gün)

```csharp
// 🏗️ Separate CRM DbContext
public class CRMDbContext : DbContext
{
    public DbSet<Customer> Customers { get; set; }
    public DbSet<Lead> Leads { get; set; }
    public DbSet<Pipeline> Pipelines { get; set; }
    public DbSet<Activity> Activities { get; set; }
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(CRMDbContext).Assembly);
    }
}
```

---

## 📅 Faz 6: Performance Optimization (1 Hafta)

### Sprint 6.1: Database Query Optimization (2 gün)

```csharp
// ⚡ Query optimization
// ❌ N+1 Problem
var customers = await _context.Customers.ToListAsync();
foreach (var customer in customers)
{
    var orders = await _context.Orders.Where(o => o.CustomerId == customer.Id).ToListAsync();
}

// ✅ Eager Loading
var customers = await _context.Customers
    .Include(c => c.Orders)
    .ThenInclude(o => o.OrderItems)
    .AsSplitQuery()
    .ToListAsync();
```

### Sprint 6.2: Caching Strategy (2 gün)

```csharp
// ⚡ Redis caching implementation
public class CachedCustomerRepository : ICustomerRepository
{
    private readonly ICustomerRepository _repository;
    private readonly IDistributedCache _cache;
    
    public async Task<Customer> GetByIdAsync(Guid id)
    {
        var cacheKey = $"customer:{id}";
        var cached = await _cache.GetStringAsync(cacheKey);
        
        if (!string.IsNullOrEmpty(cached))
            return JsonSerializer.Deserialize<Customer>(cached);
        
        var customer = await _repository.GetByIdAsync(id);
        
        await _cache.SetStringAsync(cacheKey, 
            JsonSerializer.Serialize(customer),
            new DistributedCacheEntryOptions
            {
                SlidingExpiration = TimeSpan.FromMinutes(5)
            });
        
        return customer;
    }
}
```

### Sprint 6.3: Async/Await Optimization (1 gün)

```csharp
// ⚡ Parallel processing
// ❌ Sequential
var customer = await GetCustomerAsync(id);
var orders = await GetOrdersAsync(id);
var invoices = await GetInvoicesAsync(id);

// ✅ Parallel
var customerTask = GetCustomerAsync(id);
var ordersTask = GetOrdersAsync(id);
var invoicesTask = GetInvoicesAsync(id);

await Task.WhenAll(customerTask, ordersTask, invoicesTask);
```

---

## 📊 Öncelik Matrisi

### 🔴 Hemen (Bu Hafta)
1. CRM CRUD operations tamamlama
2. Invoice endpoints implementasyonu
3. Global exception handling

### 🟡 Kısa Vade (2 Hafta)
1. Security improvements
2. Unit test setup
3. Rate limiting implementation

### 🟢 Orta Vade (1 Ay)
1. Architecture refactoring
2. Performance optimization
3. Integration tests

### 🔵 Uzun Vade (2+ Ay)
1. Microservices migration
2. Event sourcing
3. GraphQL API

---

## 📈 Başarı Metrikleri

```yaml
Kod Kalitesi:
- Code Coverage: >%80
- Cyclomatic Complexity: <10
- Technical Debt Ratio: <%5
- Duplicated Lines: <%3

Performance:
- API Response Time: <200ms (P95)
- Database Query Time: <50ms
- Cache Hit Ratio: >%80

Güvenlik:
- OWASP Top 10: Tamamı kapalı
- Security Headers Score: A+
- Vulnerability Scan: 0 critical

Reliability:
- Error Rate: <%0.1
- Uptime: %99.9
- MTTR: <30 dakika
```

---

## 🚀 Hızlı Başlangıç Checklist

### Bu Haftanın Görevleri:
- [ ] UpdateCustomerCommand implementasyonu (2 saat)
- [ ] DeleteCustomerCommand implementasyonu (2 saat)
- [ ] Global exception middleware refactor (4 saat)
- [ ] İlk unit test yazma (2 saat)
- [ ] Rate limiting Redis implementation (4 saat)

### Yarın Yapılacaklar:
1. [ ] CRM UpdateCustomer endpoint bitir
2. [ ] Validation rules ekle
3. [ ] Error response standardize et
4. [ ] İlk integration test yaz

---

## 📝 Notlar

1. **Test Coverage Önceliği**: Önce domain ve application layer'ı kapsa
2. **Incremental Refactoring**: Büyük değişiklikleri küçük PR'lara böl
3. **Feature Flags**: Yeni özellikleri feature flag ile kontrol et
4. **Monitoring First**: Her refactoring'den önce metrik ekle
5. **Documentation**: Her PR'da dokümantasyon güncelle

Bu roadmap yaşayan bir dokümandır ve proje ilerledikçe güncellenmelidir.