using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.ActivateModuleDefinition;

public class ActivateModuleDefinitionCommandHandler : IRequestHandler<ActivateModuleDefinitionCommand, Result>
{
    private readonly IMasterDbContext _context;

    public ActivateModuleDefinitionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        ActivateModuleDefinitionCommand request,
        CancellationToken cancellationToken)
    {
        var module = await _context.ModuleDefinitions
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (module is null)
        {
            return Result.Failure(
                Error.NotFound("Module.NotFound", $"Modül bulunamadı: {request.Id}"));
        }

        if (module.IsActive)
        {
            return Result.Failure(
                Error.Conflict("Module.AlreadyActive", "Modül zaten aktif"));
        }

        module.Activate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
