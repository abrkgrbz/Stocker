using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Manufacturing.Domain.Entities;
using Stocker.Modules.Manufacturing.Domain.Enums;
using Stocker.Modules.Manufacturing.Domain.Repositories;
using Stocker.Modules.Manufacturing.Infrastructure.Data;

namespace Stocker.Modules.Manufacturing.Infrastructure.Repositories;

public class MachineRepository : IMachineRepository
{
    private readonly ManufacturingDbContext _context;

    public MachineRepository(ManufacturingDbContext context)
    {
        _context = context;
    }

    public async Task<Machine?> GetByIdAsync(Guid tenantId, int id, CancellationToken cancellationToken = default)
        => await _context.Machines
            .Include(m => m.WorkCenter)
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.Id == id, cancellationToken);

    public async Task<Machine?> GetByCodeAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.Machines
            .Include(m => m.WorkCenter)
            .FirstOrDefaultAsync(m => m.TenantId == tenantId && m.Code == code, cancellationToken);

    public async Task<IReadOnlyList<Machine>> GetAllAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.Machines
            .Include(m => m.WorkCenter)
            .Where(m => m.TenantId == tenantId)
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.Code)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Machine>> GetByWorkCenterAsync(Guid tenantId, int workCenterId, CancellationToken cancellationToken = default)
        => await _context.Machines
            .Where(m => m.TenantId == tenantId && m.WorkCenterId == workCenterId)
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.Code)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Machine>> GetActiveAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.Machines
            .Include(m => m.WorkCenter)
            .Where(m => m.TenantId == tenantId && m.IsActive)
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.Code)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Machine>> GetByStatusAsync(Guid tenantId, MachineStatus status, CancellationToken cancellationToken = default)
        => await _context.Machines
            .Include(m => m.WorkCenter)
            .Where(m => m.TenantId == tenantId && m.Status == status)
            .OrderBy(m => m.DisplayOrder)
            .ThenBy(m => m.Code)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<Machine>> GetRequiringMaintenanceAsync(Guid tenantId, CancellationToken cancellationToken = default)
        => await _context.Machines
            .Include(m => m.WorkCenter)
            .Where(m => m.TenantId == tenantId &&
                        m.IsActive &&
                        m.NextMaintenanceDate.HasValue &&
                        m.NextMaintenanceDate <= DateTime.UtcNow.AddDays(7))
            .OrderBy(m => m.NextMaintenanceDate)
            .ToListAsync(cancellationToken);

    public async Task<bool> ExistsAsync(Guid tenantId, string code, CancellationToken cancellationToken = default)
        => await _context.Machines.AnyAsync(m => m.TenantId == tenantId && m.Code == code, cancellationToken);

    public async Task<string> GenerateMachineCodeAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var prefix = "MCH";
        var lastMachine = await _context.Machines
            .Where(m => m.TenantId == tenantId && m.Code.StartsWith(prefix))
            .OrderByDescending(m => m.Code)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 1;
        if (lastMachine != null && int.TryParse(lastMachine.Code.Substring(prefix.Length), out var lastSequence))
        {
            sequence = lastSequence + 1;
        }

        return $"{prefix}{sequence:D5}";
    }

    public async Task AddAsync(Machine machine, CancellationToken cancellationToken = default)
        => await _context.Machines.AddAsync(machine, cancellationToken);

    public Task DeleteAsync(Machine machine, CancellationToken cancellationToken = default)
    {
        _context.Machines.Remove(machine);
        return Task.CompletedTask;
    }
}
