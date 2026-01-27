using MediatR;
using Microsoft.Extensions.Logging;
using Stocker.Modules.HR.Infrastructure.Persistence;
using Stocker.Modules.HR.Infrastructure.SeedData;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.SeedData.Commands;

/// <summary>
/// HR modülü için standart verileri yükler
/// </summary>
public class SeedHRDataCommand : IRequest<Result<SeedHRDataResult>>
{
    public Guid TenantId { get; set; }

    /// <summary>
    /// Eğer true ise, mevcut veriler olsa bile yeniden yükleme yapar
    /// </summary>
    public bool ForceReseed { get; set; } = false;
}

/// <summary>
/// HR seed data sonuç bilgisi
/// </summary>
public class SeedHRDataResult
{
    public int LeaveTypesSeeded { get; set; }
    public int HolidaysSeeded { get; set; }
    public int ShiftsSeeded { get; set; }
    public bool AlreadySeeded { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// SeedHRDataCommand handler
/// </summary>
public class SeedHRDataCommandHandler : IRequestHandler<SeedHRDataCommand, Result<SeedHRDataResult>>
{
    private readonly HRDbContext _context;
    private readonly ILogger<SeedHRDataCommandHandler> _logger;

    public SeedHRDataCommandHandler(
        HRDbContext context,
        ILogger<SeedHRDataCommandHandler> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<Result<SeedHRDataResult>> Handle(SeedHRDataCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Starting HR seed data for tenant: {TenantId}", request.TenantId);

            var seeder = new HRDataSeeder(
                _context,
                _logger as ILogger<HRDataSeeder> ??
                    LoggerFactory.Create(builder => builder.AddConsole()).CreateLogger<HRDataSeeder>(),
                request.TenantId);

            await seeder.SeedAsync();

            var result = new SeedHRDataResult
            {
                LeaveTypesSeeded = 10,
                HolidaysSeeded = 12,
                ShiftsSeeded = 7,
                AlreadySeeded = false,
                Message = "HR standart verileri başarıyla yüklendi"
            };

            _logger.LogInformation("HR seed data completed for tenant: {TenantId}", request.TenantId);

            return Result<SeedHRDataResult>.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding HR data for tenant: {TenantId}", request.TenantId);
            return Result<SeedHRDataResult>.Failure(
                new Error("SeedData.Failed", $"Seed data yüklenirken hata oluştu: {ex.Message}", ErrorType.Failure));
        }
    }
}
