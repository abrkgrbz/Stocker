using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.Module;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Queries.GetModuleDefinitionsList;

public class GetModuleDefinitionsListQueryHandler : IRequestHandler<GetModuleDefinitionsListQuery, Result<List<ModuleDefinitionDto>>>
{
    private readonly IMasterDbContext _context;

    public GetModuleDefinitionsListQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<ModuleDefinitionDto>>> Handle(
        GetModuleDefinitionsListQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.ModuleDefinitions
            .AsNoTracking()
            .Include(m => m.Features)
            .Include(m => m.Dependencies)
            .AsQueryable();

        // Apply filters
        if (request.IsActive.HasValue)
        {
            query = query.Where(m => m.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Category))
        {
            query = query.Where(m => m.Category == request.Category);
        }

        var modules = await query
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
}
