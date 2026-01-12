# Stocker Modül Yapısı Standardı

Bu doküman, Stocker ERP projesindeki modüllerin standart yapısını ve geliştirme kurallarını tanımlar.

## İçindekiler

- [Genel Bakış](#genel-bakış)
- [Klasör Yapısı](#klasör-yapısı)
- [Katmanlar](#katmanlar)
- [Dosya Adlandırma Kuralları](#dosya-adlandırma-kuralları)
- [Entity Yapısı](#entity-yapısı)
- [Repository Pattern](#repository-pattern)
- [CQRS Pattern](#cqrs-pattern)
- [Validasyon](#validasyon)
- [Domain Events](#domain-events)
- [Dependency Injection](#dependency-injection)
- [Yeni Modül Oluşturma Rehberi](#yeni-modül-oluşturma-rehberi)

---

## Genel Bakış

Stocker, **Clean Architecture** ve **Domain-Driven Design (DDD)** prensiplerine dayalı modüler bir monolith yapı kullanır. Her modül bağımsız bir bounded context olarak tasarlanmıştır.

### Mimari Prensipler

- **Clean Architecture**: Bağımlılıklar dıştan içe doğru akar
- **CQRS**: Command/Query Responsibility Segregation
- **Repository Pattern**: Data access soyutlaması
- **Unit of Work**: Transaction yönetimi
- **Multi-Tenancy**: Tenant bazlı veri izolasyonu
- **Domain Events**: Modüller arası iletişim

---

## Klasör Yapısı

```
src/Modules/Stocker.Modules.{ModuleName}/
│
├── {ModuleName}Module.cs              # Modül kayıt sınıfı
├── Stocker.Modules.{ModuleName}.csproj
│
├── API/
│   └── Controllers/                    # REST API Controller'ları
│       └── {Entity}Controller.cs
│
├── Application/
│   ├── DependencyInjection.cs         # Application layer DI
│   ├── Contracts/                      # External service contracts
│   ├── DTOs/                          # Data Transfer Objects
│   │   └── {Entity}Dto.cs
│   ├── EventHandlers/                 # Domain event handlers
│   │   └── {Entity}EventHandlers.cs
│   ├── Features/                      # CQRS Commands & Queries
│   │   └── {Entity}s/
│   │       ├── Commands/
│   │       │   ├── Create{Entity}Command.cs
│   │       │   ├── Update{Entity}Command.cs
│   │       │   ├── Delete{Entity}Command.cs
│   │       │   ├── Activate{Entity}Command.cs
│   │       │   └── Deactivate{Entity}Command.cs
│   │       └── Queries/
│   │           ├── Get{Entity}ByIdQuery.cs
│   │           └── Get{Entity}sQuery.cs
│   ├── IntegrationEvents/             # Cross-module events
│   └── Services/                      # Application services
│       └── I{Service}Service.cs
│
├── Domain/
│   ├── Entities/                      # Domain entities
│   │   └── {Entity}.cs
│   ├── Enums/                         # Domain enums
│   │   └── {Entity}Status.cs
│   ├── Events/                        # Domain events
│   │   └── {Entity}Events.cs
│   ├── Repositories/                  # Repository interfaces
│   │   ├── I{ModuleName}Repository.cs # Base repository interface
│   │   └── I{Entity}Repository.cs
│   └── Services/                      # Domain services
│       └── I{DomainService}.cs
│
├── Infrastructure/
│   ├── DependencyInjection.cs         # Infrastructure layer DI
│   ├── Configuration/                 # External config classes
│   ├── EventConsumers/                # MassTransit consumers
│   ├── Persistence/
│   │   ├── {ModuleName}DbContext.cs
│   │   ├── {ModuleName}DbContextFactory.cs
│   │   ├── {ModuleName}UnitOfWork.cs
│   │   ├── Configurations/            # EF Core entity configs
│   │   │   └── {Entity}Configuration.cs
│   │   └── Migrations/
│   ├── Repositories/                  # Repository implementations
│   │   ├── BaseRepository.cs
│   │   └── {Entity}Repository.cs
│   └── Services/                      # Service implementations
│       └── {Service}Service.cs
│
└── Interfaces/
    └── I{ModuleName}UnitOfWork.cs     # Module-specific UoW interface
```

---

## Katmanlar

### 1. Domain Layer (İç Katman)

En içteki katman, iş kurallarını içerir. Hiçbir dış bağımlılığı yoktur.

**İçerik:**
- Entities (Domain modelleri)
- Value Objects
- Domain Events
- Repository Interfaces
- Domain Services

### 2. Application Layer

Use case'leri ve iş mantığını orkestra eder.

**İçerik:**
- Commands & Queries (CQRS)
- DTOs
- Validators (FluentValidation)
- Event Handlers
- Application Services

### 3. Infrastructure Layer

Dış sistemlerle iletişimi sağlar.

**İçerik:**
- DbContext & Configurations
- Repository Implementations
- External Service Integrations
- Event Consumers (MassTransit)

### 4. API Layer

HTTP endpoint'lerini tanımlar.

**İçerik:**
- REST Controllers
- Request/Response models

---

## Dosya Adlandırma Kuralları

### Entities
```
{Entity}.cs                    # Product.cs, Category.cs
```

### DTOs
```
{Entity}Dto.cs                 # ProductDto.cs
Create{Entity}Dto.cs           # CreateProductDto.cs
Update{Entity}Dto.cs           # UpdateProductDto.cs
```

### Commands
```
Create{Entity}Command.cs       # CreateProductCommand.cs
Update{Entity}Command.cs       # UpdateProductCommand.cs
Delete{Entity}Command.cs       # DeleteProductCommand.cs
Activate{Entity}Command.cs     # ActivateProductCommand.cs
Deactivate{Entity}Command.cs   # DeactivateProductCommand.cs
```

### Queries
```
Get{Entity}ByIdQuery.cs        # GetProductByIdQuery.cs
Get{Entity}sQuery.cs           # GetProductsQuery.cs (liste)
Get{Entity}TreeQuery.cs        # GetCategoryTreeQuery.cs (hiyerarşik)
```

### Repositories
```
I{Entity}Repository.cs         # ICategoryRepository.cs (interface)
{Entity}Repository.cs          # CategoryRepository.cs (implementation)
```

### Events
```
{Entity}Events.cs              # CategoryEvents.cs (tüm event'ler tek dosyada)
```

### Configurations
```
{Entity}Configuration.cs       # ProductConfiguration.cs
```

---

## Entity Yapısı

### Temel Entity Şablonu

```csharp
using Stocker.SharedKernel.Common;
using Stocker.Modules.{Module}.Domain.Events;

namespace Stocker.Modules.{Module}.Domain.Entities;

public class {Entity} : BaseEntity
{
    // Properties (private set for encapsulation)
    public string Code { get; private set; }
    public string Name { get; private set; }
    public string? Description { get; private set; }
    public bool IsActive { get; private set; }
    public int DisplayOrder { get; private set; }

    // Navigation properties
    public virtual ICollection<RelatedEntity> RelatedEntities { get; private set; }

    // Protected constructor for EF Core
    protected {Entity}() { }

    // Public constructor with required parameters
    public {Entity}(string code, string name)
    {
        Code = code;
        Name = name;
        IsActive = true;
        DisplayOrder = 0;
        RelatedEntities = new List<RelatedEntity>();
    }

    // Domain methods
    public void Update(string name, string? description)
    {
        Name = name;
        Description = description;

        RaiseDomainEvent(new {Entity}UpdatedDomainEvent(
            Id, TenantId, Code, Name));
    }

    public void SetDisplayOrder(int order)
    {
        DisplayOrder = order;
    }

    public void Activate()
    {
        IsActive = true;
        RaiseDomainEvent(new {Entity}ActivatedDomainEvent(
            Id, TenantId, Code, Name));
    }

    public void Deactivate()
    {
        IsActive = false;
        RaiseDomainEvent(new {Entity}DeactivatedDomainEvent(
            Id, TenantId, Code, Name));
    }
}
```

### BaseEntity Özellikleri

`BaseEntity` sınıfı şu özellikleri sağlar:
- `Id` (int) - Primary key
- `TenantId` (Guid) - Multi-tenancy desteği
- `CreatedDate` (DateTime)
- `UpdatedDate` (DateTime?)
- `IsDeleted` (bool) - Soft delete
- `RaiseDomainEvent()` - Domain event tetikleme

---

## Repository Pattern

### Base Repository Interface

```csharp
public interface I{Module}Repository<TEntity> where TEntity : BaseEntity
{
    IQueryable<TEntity> AsQueryable();
    Task<TEntity?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TEntity>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TEntity>> FindAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task<TEntity?> SingleOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task<int> CountAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken cancellationToken = default);
    Task<TEntity> AddAsync(TEntity entity, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<TEntity> entities, CancellationToken cancellationToken = default);
    void Update(TEntity entity);
    void Remove(TEntity entity);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<TEntity> Items, int TotalCount)> GetPagedAsync(
        int pageIndex, int pageSize,
        Expression<Func<TEntity, bool>>? predicate = null,
        Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
        CancellationToken cancellationToken = default);
}
```

### Entity-Specific Repository Interface

```csharp
public interface I{Entity}Repository : I{Module}Repository<{Entity}>
{
    Task<{Entity}?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<bool> ExistsWithCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default);
    Task<bool> HasActiveProductsAsync(int entityId, CancellationToken cancellationToken = default);
    // Entity'ye özel diğer metodlar...
}
```

### Unit of Work Interface

```csharp
public interface I{Module}UnitOfWork : IUnitOfWork
{
    Guid TenantId { get; }
    
    // Domain-specific repositories
    IProductRepository Products { get; }
    ICategoryRepository Categories { get; }
    IBrandRepository Brands { get; }
    // Diğer repository'ler...
}
```

---

## CQRS Pattern

### Command Yapısı

```csharp
// Command
public class Create{Entity}Command : IRequest<Result<{Entity}Dto>>
{
    public Guid TenantId { get; set; }
    public Create{Entity}Dto Data { get; set; } = null!;
}

// Validator
public class Create{Entity}CommandValidator : AbstractValidator<Create{Entity}Command>
{
    private static readonly Regex ValidNamePattern = 
        new(@"^[\p{L}\p{N}\s\-]+$", RegexOptions.Compiled);

    public Create{Entity}CommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Kiracı kimliği gereklidir");

        RuleFor(x => x.Data)
            .NotNull().WithMessage("{Entity} bilgileri gereklidir");

        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Code)
                .NotEmpty().WithMessage("{Entity} kodu gereklidir")
                .MinimumLength(2).WithMessage("{Entity} kodu en az 2 karakter olmalıdır")
                .MaximumLength(50).WithMessage("{Entity} kodu en fazla 50 karakter olabilir")
                .Must(code => !string.IsNullOrEmpty(code) && ValidNamePattern.IsMatch(code))
                .WithMessage("{Entity} kodu sadece harf, rakam, boşluk ve tire içerebilir.");

            RuleFor(x => x.Data.Name)
                .NotEmpty().WithMessage("{Entity} adı gereklidir")
                .MinimumLength(2).WithMessage("{Entity} adı en az 2 karakter olmalıdır")
                .MaximumLength(100).WithMessage("{Entity} adı en fazla 100 karakter olabilir");
        });
    }
}

// Handler
public class Create{Entity}CommandHandler : IRequestHandler<Create{Entity}Command, Result<{Entity}Dto>>
{
    private readonly I{Module}UnitOfWork _unitOfWork;

    public Create{Entity}CommandHandler(I{Module}UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<{Entity}Dto>> Handle(
        Create{Entity}Command request, 
        CancellationToken cancellationToken)
    {
        // 1. Validation checks
        var existing = await _unitOfWork.{Entity}s.GetByCodeAsync(
            request.Data.Code, cancellationToken);
        if (existing != null)
        {
            return Result<{Entity}Dto>.Failure(
                Error.Conflict("{Entity}.Code", "Bu kod zaten kullanılmaktadır"));
        }

        // 2. Create entity
        var entity = new {Entity}(request.Data.Code, request.Data.Name);
        entity.SetTenantId(request.TenantId);

        // 3. Save
        await _unitOfWork.{Entity}s.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 4. Map to DTO and return
        var dto = new {Entity}Dto { /* mapping */ };
        return Result<{Entity}Dto>.Success(dto);
    }
}
```

### Query Yapısı

```csharp
// Query
public class Get{Entity}ByIdQuery : IRequest<Result<{Entity}Dto>>
{
    public Guid TenantId { get; set; }
    public int {Entity}Id { get; set; }
}

// Handler
public class Get{Entity}ByIdQueryHandler : IRequestHandler<Get{Entity}ByIdQuery, Result<{Entity}Dto>>
{
    private readonly I{Module}UnitOfWork _unitOfWork;

    public Get{Entity}ByIdQueryHandler(I{Module}UnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<{Entity}Dto>> Handle(
        Get{Entity}ByIdQuery request, 
        CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.{Entity}s.GetByIdAsync(
            request.{Entity}Id, cancellationToken);

        if (entity == null || entity.TenantId != request.TenantId)
        {
            return Result<{Entity}Dto>.Failure(
                Error.NotFound("{Entity}", $"{Entity} bulunamadı (ID: {request.{Entity}Id})"));
        }

        var dto = new {Entity}Dto { /* mapping */ };
        return Result<{Entity}Dto>.Success(dto);
    }
}
```

---

## Validasyon

### Standart Validasyon Kuralları

| Alan | Kural | Hata Mesajı (TR) |
|------|-------|------------------|
| Code | NotEmpty, Min(2), Max(50), NoSpecialChars | "{Entity} kodu gereklidir" |
| Name | NotEmpty, Min(2), Max(100), NoSpecialChars | "{Entity} adı gereklidir" |
| Description | Max(500) | "Açıklama en fazla 500 karakter olabilir" |
| DisplayOrder | >= 0 | "Görüntüleme sırası negatif olamaz" |

### Özel Karakter Regex Pattern

```csharp
// Sadece harf (Türkçe dahil), rakam, boşluk ve tire
private static readonly Regex ValidNamePattern = 
    new(@"^[\p{L}\p{N}\s\-]+$", RegexOptions.Compiled);
```

---

## Domain Events

### Event Tanımlama

```csharp
// {Entity}Events.cs
using Stocker.SharedKernel.Events;

namespace Stocker.Modules.{Module}.Domain.Events;

public sealed record {Entity}CreatedDomainEvent(
    int {Entity}Id,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

public sealed record {Entity}UpdatedDomainEvent(
    int {Entity}Id,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

public sealed record {Entity}ActivatedDomainEvent(
    int {Entity}Id,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;

public sealed record {Entity}DeactivatedDomainEvent(
    int {Entity}Id,
    Guid TenantId,
    string Code,
    string Name) : DomainEvent;
```

### Event Handler

```csharp
public class {Entity}CreatedEventHandler : INotificationHandler<{Entity}CreatedDomainEvent>
{
    private readonly ILogger<{Entity}CreatedEventHandler> _logger;

    public {Entity}CreatedEventHandler(ILogger<{Entity}CreatedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle({Entity}CreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "{Entity} created: {Code} ({Name})",
            notification.Code,
            notification.Name);

        return Task.CompletedTask;
    }
}
```

---

## Dependency Injection

### Application DI

```csharp
public static class DependencyInjection
{
    public static IServiceCollection Add{Module}Application(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}
```

### Infrastructure DI

```csharp
public static class DependencyInjection
{
    public static IServiceCollection Add{Module}Infrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // DbContext
        services.AddDbContext<{Module}DbContext>((sp, options) =>
        {
            var tenantService = sp.GetRequiredService<ITenantService>();
            var connectionString = tenantService.GetConnectionString();
            options.UseNpgsql(connectionString);
        });

        // Unit of Work
        services.AddScoped<{Module}UnitOfWork>();
        services.AddScoped<I{Module}UnitOfWork>(sp => sp.GetRequiredService<{Module}UnitOfWork>());
        services.AddScoped<IUnitOfWork>(sp => sp.GetRequiredService<{Module}UnitOfWork>());

        // Repositories (UnitOfWork üzerinden)
        services.AddScoped<I{Entity}Repository>(sp => 
            sp.GetRequiredService<I{Module}UnitOfWork>().{Entity}s);

        // Services
        services.AddScoped<I{Service}Service, {Service}Service>();

        return services;
    }
}
```

### Module Registration

```csharp
public static class {Module}Module
{
    public static IServiceCollection Add{Module}Module(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.Add{Module}Application();
        services.Add{Module}Infrastructure(configuration);
        return services;
    }
}
```

---

## Yeni Modül Oluşturma Rehberi

### Adım 1: Proje Oluşturma

```bash
dotnet new classlib -n Stocker.Modules.{ModuleName} -o src/Modules/Stocker.Modules.{ModuleName}
```

### Adım 2: Klasör Yapısını Oluşturma

```bash
mkdir -p src/Modules/Stocker.Modules.{ModuleName}/{API/Controllers,Application/{Contracts,DTOs,EventHandlers,Features,IntegrationEvents,Services},Domain/{Entities,Enums,Events,Repositories,Services},Infrastructure/{Configuration,EventConsumers,Persistence/{Configurations,Migrations},Repositories,Services},Interfaces}
```

### Adım 3: Temel Dosyaları Oluşturma

1. `{ModuleName}Module.cs` - Modül kayıt sınıfı
2. `Application/DependencyInjection.cs`
3. `Infrastructure/DependencyInjection.cs`
4. `Domain/Repositories/I{ModuleName}Repository.cs` - Base repository
5. `Interfaces/I{ModuleName}UnitOfWork.cs`
6. `Infrastructure/Persistence/{ModuleName}DbContext.cs`
7. `Infrastructure/Persistence/{ModuleName}UnitOfWork.cs`
8. `Infrastructure/Repositories/BaseRepository.cs`

### Adım 4: Entity Ekleme (Her Entity İçin)

1. `Domain/Entities/{Entity}.cs`
2. `Domain/Events/{Entity}Events.cs`
3. `Domain/Repositories/I{Entity}Repository.cs`
4. `Application/DTOs/{Entity}Dto.cs`
5. `Application/Features/{Entity}s/Commands/Create{Entity}Command.cs`
6. `Application/Features/{Entity}s/Commands/Update{Entity}Command.cs`
7. `Application/Features/{Entity}s/Commands/Delete{Entity}Command.cs`
8. `Application/Features/{Entity}s/Commands/Activate{Entity}Command.cs`
9. `Application/Features/{Entity}s/Commands/Deactivate{Entity}Command.cs`
10. `Application/Features/{Entity}s/Queries/Get{Entity}ByIdQuery.cs`
11. `Application/Features/{Entity}s/Queries/Get{Entity}sQuery.cs`
12. `Application/EventHandlers/{Entity}EventHandlers.cs`
13. `Infrastructure/Persistence/Configurations/{Entity}Configuration.cs`
14. `Infrastructure/Repositories/{Entity}Repository.cs`
15. `API/Controllers/{Entity}sController.cs`

### Adım 5: Migration Oluşturma

```bash
dotnet ef migrations add Initial{ModuleName} --project src/Modules/Stocker.Modules.{ModuleName} --startup-project src/API/Stocker.API --context {ModuleName}DbContext
```

---

## Mevcut Modüller

| Modül | Entity Sayısı | Durum |
|-------|---------------|-------|
| Inventory | 30 | ✅ Aktif |
| Sales | 26 | ✅ Aktif |
| CRM | 40 | ✅ Aktif |
| Purchase | - | 🔄 Geliştiriliyor |
| Finance | - | 🔄 Geliştiriliyor |
| HR | - | 🔄 Geliştiriliyor |
| CMS | - | 🔄 Geliştiriliyor |

---

## Referanslar

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [CQRS Pattern - Martin Fowler](https://martinfowler.com/bliki/CQRS.html)
- [MediatR Documentation](https://github.com/jbogard/MediatR)
- [FluentValidation Documentation](https://docs.fluentvalidation.net/)
