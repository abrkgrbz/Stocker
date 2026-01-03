using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.AddModuleDependency;

public class AddModuleDependencyCommandHandler : IRequestHandler<AddModuleDependencyCommand, Result>
{
    private readonly IMasterDbContext _context;

    public AddModuleDependencyCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        AddModuleDependencyCommand request,
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

        // Check if dependent module exists
        var dependentModuleExists = await _context.ModuleDefinitions
            .AnyAsync(m => m.Code == request.DependentModuleCode, cancellationToken);

        if (!dependentModuleExists)
        {
            return Result.Failure(
                Error.NotFound("Module.DependencyNotFound", $"Bağımlı modül bulunamadı: {request.DependentModuleCode}"));
        }

        // Prevent self-dependency
        if (module.Code == request.DependentModuleCode)
        {
            return Result.Failure(
                Error.Validation("Module.SelfDependency", "Bir modül kendisine bağımlı olamaz"));
        }

        // Check if dependency already exists
        if (module.Dependencies.Any(d => d.DependentModuleCode == request.DependentModuleCode))
        {
            return Result.Failure(
                Error.Conflict("Module.DependencyExists", $"Bu bağımlılık zaten mevcut: {request.DependentModuleCode}"));
        }

        module.AddDependency(request.DependentModuleCode);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
