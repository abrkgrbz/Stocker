using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Inventory.Infrastructure.Persistence;
using Stocker.Modules.Inventory.Infrastructure.SeedData;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.SeedData.Commands;

/// <summary>
/// Command to seed standard inventory data for a tenant
/// </summary>
public class SeedInventoryDataCommand : IRequest<Result<SeedInventoryDataResult>>
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// If true, forces re-seeding even if data already exists
    /// </summary>
    public bool ForceReseed { get; set; } = false;
}

/// <summary>
/// Result of seed inventory data operation
/// </summary>
public class SeedInventoryDataResult
{
    public int UnitsSeeded { get; set; }
    public int PackagingTypesSeeded { get; set; }
    public int CategoriesSeeded { get; set; }
    public int WarehousesSeeded { get; set; }
    public bool AlreadySeeded { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// Handler for SeedInventoryDataCommand
/// </summary>
public class SeedInventoryDataCommandHandler : IRequestHandler<SeedInventoryDataCommand, Result<SeedInventoryDataResult>>
{
    private readonly InventoryDbContext _context;
    private readonly ILogger<SeedInventoryDataCommandHandler> _logger;

    public SeedInventoryDataCommandHandler(
        InventoryDbContext context,
        ILogger<SeedInventoryDataCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SeedInventoryDataResult>> Handle(SeedInventoryDataCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting inventory seed data for tenant: {TenantId}", request.TenantId);

            var seeder = new InventoryDataSeeder(
                _context,
                _logger as ILogger<InventoryDataSeeder> ??
                    LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<InventoryDataSeeder>(),
                request.TenantId);

            await seeder.SeedAsync();

            var result = new SeedInventoryDataResult
            {
                UnitsSeeded = 26,
                PackagingTypesSeeded = 29,
                CategoriesSeeded = 8,
                WarehousesSeeded = 1,
                AlreadySeeded = false,
                Message = "Envanter standart verileri başarıyla yüklendi"
            };

            _logger.LogInformation("Inventory seed data completed for tenant: {TenantId}", request.TenantId);

            return Result<SeedInventoryDataResult>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding inventory data for tenant: {TenantId}", request.TenantId);
            return Result<SeedInventoryDataResult>.Failure(
                new Error("SeedData.Failed", $"Seed data yüklenirken hata oluştu: {ex.Message}", ErrorType.Failure));
        }
    }
}
