using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.GetAvailableModules;

public class GetAvailableModulesQueryHandler : IRequestHandler<GetAvailableModulesQuery, Result<List<ModuleDefinitionDto>>>
{
    private readonly IMasterDbContext _context;

    public GetAvailableModulesQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<ModuleDefinitionDto>>> Handle(
        GetAvailableModulesQuery request,
        CancellationToken cancellationToken)
    {
        try
        {
            var modules = await _context.ModuleDefinitions
                .AsNoTracking()
                .Where(m => m.IsActive)
                .Include(m => m.Features)
                .Include(m => m.Dependencies)
                .OrderBy(m => m.DisplayOrder)
                .ThenBy(m => m.Name)
                .ToListAsync(cancellationToken);

            var result = modules.Select(m => new ModuleDefinitionDto
            {
                Id = m.Id,
                Code = m.Code,
                Name = m.Name,
                Description = m.Description,
                Icon = m.Icon,
                MonthlyPrice = m.MonthlyPrice.Amount,
                Currency = m.MonthlyPrice.Currency,
                IsCore = m.IsCore,
                IsActive = m.IsActive,
                DisplayOrder = m.DisplayOrder,
                Category = m.Category,
                Features = m.Features.Select(f => new ModuleFeatureDto
                {
                    FeatureName = f.FeatureName,
                    Description = f.Description
                }).ToList(),
                Dependencies = m.Dependencies.Select(d => d.DependentModuleCode).ToList()
            }).ToList();

            return Result<List<ModuleDefinitionDto>>.Success(result);
        }
        catch (Exception ex)
        {
            return Result<List<ModuleDefinitionDto>>.Failure(
                new Error("Modules.GetFailed", $"Modüller yüklenirken hata oluştu: {ex.Message}"));
        }
    }
}
