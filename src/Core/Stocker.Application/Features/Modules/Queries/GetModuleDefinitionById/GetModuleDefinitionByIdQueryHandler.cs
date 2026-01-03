using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.GetModuleDefinitionById;

public class GetModuleDefinitionByIdQueryHandler : IRequestHandler<GetModuleDefinitionByIdQuery, Result<ModuleDefinitionDto>>
{
    private readonly IMasterDbContext _context;

    public GetModuleDefinitionByIdQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ModuleDefinitionDto>> Handle(
        GetModuleDefinitionByIdQuery request,
        CancellationToken cancellationToken)
    {
        var module = await _context.ModuleDefinitions
            .AsNoTracking()
            .Include(m => m.Features)
            .Include(m => m.Dependencies)
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (module is null)
        {
            return Result<ModuleDefinitionDto>.Failure(
                Error.NotFound("Module.NotFound", $"Modül bulunamadı: {request.Id}"));
        }

        var result = new ModuleDefinitionDto
        {
            Id = module.Id,
            Code = module.Code,
            Name = module.Name,
            Description = module.Description,
            Icon = module.Icon,
            MonthlyPrice = module.MonthlyPrice.Amount,
            Currency = module.MonthlyPrice.Currency,
            IsCore = module.IsCore,
            IsActive = module.IsActive,
            DisplayOrder = module.DisplayOrder,
            Category = module.Category,
            Features = module.Features.Select(f => new ModuleFeatureDto
            {
                FeatureName = f.FeatureName,
                Description = f.Description
            }).ToList(),
            Dependencies = module.Dependencies.Select(d => d.DependentModuleCode).ToList()
        };

        return Result<ModuleDefinitionDto>.Success(result);
    }
}
