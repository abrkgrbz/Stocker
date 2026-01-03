using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.RemoveModuleDependency;

public class RemoveModuleDependencyCommandHandler : IRequestHandler<RemoveModuleDependencyCommand, Result>
{
    private readonly IMasterDbContext _context;

    public RemoveModuleDependencyCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        RemoveModuleDependencyCommand request,
        CancellationToken cancellationToken)
    {
        var module = await _context.ModuleDefinitions
            .Include(m => m.Dependencies)
            .FirstOrDefaultAsync(m => m.Id == request.ModuleId, cancellationToken);

        if (module is null)
        {
            return Result.Failure(
                Error.NotFound("Module.NotFound", $"Modül bulunamadı: {request.ModuleId}"));
        }

        var dependency = module.Dependencies.FirstOrDefault(d => d.DependentModuleCode == request.DependentModuleCode);
        if (dependency is null)
        {
            return Result.Failure(
                Error.NotFound("Module.DependencyNotFound", $"Bağımlılık bulunamadı: {request.DependentModuleCode}"));
        }

        module.RemoveDependency(request.DependentModuleCode);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
