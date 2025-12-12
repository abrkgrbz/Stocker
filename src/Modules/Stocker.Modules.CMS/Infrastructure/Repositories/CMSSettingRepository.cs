using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Domain.Repositories;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Infrastructure.Repositories;

public class CMSSettingRepository : ICMSSettingRepository
{
    private readonly CMSDbContext _context;

    public CMSSettingRepository(CMSDbContext context)
    {
        _context = context;
    }

    public async Task<CMSSetting?> GetByKeyAsync(string key, CancellationToken cancellationToken = default)
    {
        return await _context.Settings
            .FirstOrDefaultAsync(s => s.Key == key, cancellationToken);
    }

    public async Task<IEnumerable<CMSSetting>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Settings
            .OrderBy(s => s.Group)
            .ThenBy(s => s.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<CMSSetting>> GetByGroupAsync(string group, CancellationToken cancellationToken = default)
    {
        return await _context.Settings
            .Where(s => s.Group == group)
            .OrderBy(s => s.Key)
            .ToListAsync(cancellationToken);
    }

    public async Task<CMSSetting> UpsertAsync(CMSSetting setting, CancellationToken cancellationToken = default)
    {
        var existing = await _context.Settings
            .FirstOrDefaultAsync(s => s.Key == setting.Key, cancellationToken);

        if (existing != null)
        {
            existing.Value = setting.Value;
            existing.Group = setting.Group;
            existing.Description = setting.Description;
            _context.Settings.Update(existing);
        }
        else
        {
            await _context.Settings.AddAsync(setting, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return existing ?? setting;
    }

    public async Task DeleteAsync(string key, CancellationToken cancellationToken = default)
    {
        var setting = await _context.Settings
            .FirstOrDefaultAsync(s => s.Key == key, cancellationToken);

        if (setting != null)
        {
            _context.Settings.Remove(setting);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}
