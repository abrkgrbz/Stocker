using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.DeleteModuleDefinition;

public class DeleteModuleDefinitionCommandHandler : IRequestHandler<DeleteModuleDefinitionCommand, Result>
{
    private readonly IMasterDbContext _context;

    public DeleteModuleDefinitionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        DeleteModuleDefinitionCommand request,
        CancellationToken cancellationToken)
    {
        var module = await _context.ModuleDefinitions
            .Include(m => m.Features)
            .Include(m => m.Dependencies)
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (module is null)
        {
            return Result.Failure(
                Error.NotFound("Module.NotFound", $"Modül bulunamadı: {request.Id}"));
        }

        // Check if module is used in any package
        var isUsedInPackage = await _context.PackageModules
            .AnyAsync(pm => pm.ModuleCode == module.Code, cancellationToken);

        if (isUsedInPackage)
        {
            return Result.Failure(
                Error.Conflict("Module.InUse", "Bu modül bir veya daha fazla pakette kullanılıyor. Önce paketlerden kaldırın."));
        }

        // Check if module is dependency for other modules
        var isDependency = await _context.ModuleDefinitions
            .AnyAsync(m => m.Dependencies.Any(d => d.DependentModuleCode == module.Code), cancellationToken);

        if (isDependency)
        {
            return Result.Failure(
                Error.Conflict("Module.IsDependency", "Bu modül başka modüller tarafından bağımlılık olarak kullanılıyor."));
        }

        _context.ModuleDefinitions.Remove(module);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
