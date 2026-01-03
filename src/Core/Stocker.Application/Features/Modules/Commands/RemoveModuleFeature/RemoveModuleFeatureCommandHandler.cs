using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.RemoveModuleFeature;

public class RemoveModuleFeatureCommandHandler : IRequestHandler<RemoveModuleFeatureCommand, Result>
{
    private readonly IMasterDbContext _context;

    public RemoveModuleFeatureCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        RemoveModuleFeatureCommand request,
        CancellationToken cancellationToken)
    {
        var module = await _context.ModuleDefinitions
            .Include(m => m.Features)
            .FirstOrDefaultAsync(m => m.Id == request.ModuleId, cancellationToken);

        if (module is null)
        {
            return Result.Failure(
                Error.NotFound("Module.NotFound", $"Modül bulunamadı: {request.ModuleId}"));
        }

        var feature = module.Features.FirstOrDefault(f => f.FeatureName == request.FeatureName);
        if (feature is null)
        {
            return Result.Failure(
                Error.NotFound("Module.FeatureNotFound", $"Özellik bulunamadı: {request.FeatureName}"));
        }

        module.RemoveFeature(request.FeatureName);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
