using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.AddModuleFeature;

public class AddModuleFeatureCommandHandler : IRequestHandler<AddModuleFeatureCommand, Result>
{
    private readonly IMasterDbContext _context;

    public AddModuleFeatureCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        AddModuleFeatureCommand request,
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

        // Check if feature already exists
        if (module.Features.Any(f => f.FeatureName == request.FeatureName))
        {
            return Result.Failure(
                Error.Conflict("Module.FeatureExists", $"Bu özellik zaten mevcut: {request.FeatureName}"));
        }

        module.AddFeature(request.FeatureName, request.Description);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
