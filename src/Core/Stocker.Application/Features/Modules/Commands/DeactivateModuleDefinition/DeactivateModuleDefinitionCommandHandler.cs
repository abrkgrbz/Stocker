using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.DeactivateModuleDefinition;

public class DeactivateModuleDefinitionCommandHandler : IRequestHandler<DeactivateModuleDefinitionCommand, Result>
{
    private readonly IMasterDbContext _context;

    public DeactivateModuleDefinitionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        DeactivateModuleDefinitionCommand request,
        CancellationToken cancellationToken)
    {
        var module = await _context.ModuleDefinitions
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (module is null)
        {
            return Result.Failure(
                Error.NotFound("Module.NotFound", $"Modül bulunamadı: {request.Id}"));
        }

        if (!module.IsActive)
        {
            return Result.Failure(
                Error.Conflict("Module.AlreadyInactive", "Modül zaten pasif"));
        }

        // Check if this is a core module
        if (module.IsCore)
        {
            return Result.Failure(
                Error.Validation("Module.CoreCannotDeactivate", "Core modüller pasif yapılamaz"));
        }

        module.Deactivate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
