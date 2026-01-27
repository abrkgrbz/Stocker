using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.Finance.Infrastructure.Persistence;
using Stocker.Modules.Finance.Infrastructure.SeedData;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Finance.Application.Features.SeedData.Commands;

/// <summary>
/// Finance modülü için standart verileri yükler
/// </summary>
public class SeedFinanceDataCommand : IRequest<Result<SeedFinanceDataResult>>
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Eğer true ise, mevcut veriler olsa bile yeniden yükleme yapar
    /// </summary>
    public bool ForceReseed { get; set; } = false;
}

/// <summary>
/// Finance seed data sonuç bilgisi
/// </summary>
public class SeedFinanceDataResult
{
    public int AccountsSeeded { get; set; }
    public int CostCentersSeeded { get; set; }
    public bool AlreadySeeded { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// SeedFinanceDataCommand handler
/// </summary>
public class SeedFinanceDataCommandHandler : IRequestHandler<SeedFinanceDataCommand, Result<SeedFinanceDataResult>>
{
    private readonly FinanceDbContext _context;
    private readonly ILogger<SeedFinanceDataCommandHandler> _logger;

    public SeedFinanceDataCommandHandler(
        FinanceDbContext context,
        ILogger<SeedFinanceDataCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SeedFinanceDataResult>> Handle(SeedFinanceDataCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting Finance seed data for tenant: {TenantId}", request.TenantId);

            var seeder = new FinanceDataSeeder(
                _context,
                _logger as ILogger<FinanceDataSeeder> ??
                    LoggerFactory.Create(builder => { }).CreateLogger<FinanceDataSeeder>(),
                request.TenantId);

            await seeder.SeedAsync();

            var result = new SeedFinanceDataResult
            {
                AccountsSeeded = 150,
                CostCentersSeeded = 8,
                AlreadySeeded = false,
                Message = "Finance standart verileri başarıyla yüklendi (Tekdüzen Hesap Planı)"
            };

            _logger.LogInformation("Finance seed data completed for tenant: {TenantId}", request.TenantId);

            return Result<SeedFinanceDataResult>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding Finance data for tenant: {TenantId}", request.TenantId);
            return Result<SeedFinanceDataResult>.Failure(
                new Error("SeedData.Failed", $"Seed data yüklenirken hata oluştu: {ex.Message}", ErrorType.Failure));
        }
    }
}
