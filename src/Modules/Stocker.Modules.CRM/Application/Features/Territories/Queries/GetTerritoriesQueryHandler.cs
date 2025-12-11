using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Territories.Queries;

public class GetTerritoriesQueryHandler : IRequestHandler<GetTerritoriesQuery, Result<List<TerritoryDto>>>
{
    private readonly ITerritoryRepository _repository;

    public GetTerritoriesQueryHandler(ITerritoryRepository repository)
    {
        _repository = repository;
    }

    public async System.Threading.Tasks.Task<Result<List<TerritoryDto>>> Handle(GetTerritoriesQuery request, CancellationToken cancellationToken)
    {
        var entities = await _repository.GetAllAsync(
            request.TerritoryType,
            request.IsActive,
            request.ParentTerritoryId,
            request.Skip,
            request.Take,
            cancellationToken);

        var dtos = entities.Select(entity => new TerritoryDto
        {
            Id = entity.Id,
            TenantId = entity.TenantId,
            Name = entity.Name,
            Code = entity.Code,
            Description = entity.Description,
            TerritoryType = entity.TerritoryType,
            IsActive = entity.IsActive,
            ParentTerritoryId = entity.ParentTerritoryId,
            HierarchyLevel = entity.HierarchyLevel,
            HierarchyPath = entity.HierarchyPath,
            Country = entity.Country,
            CountryCode = entity.CountryCode,
            Region = entity.Region,
            City = entity.City,
            District = entity.District,
            PostalCodeRange = entity.PostalCodeRange,
            GeoCoordinates = entity.GeoCoordinates,
            SalesTarget = entity.SalesTarget,
            TargetYear = entity.TargetYear,
            Currency = entity.Currency,
            PotentialValue = entity.PotentialValue,
            AssignedSalesTeamId = entity.AssignedSalesTeamId,
            PrimarySalesRepId = entity.PrimarySalesRepId,
            PrimarySalesRepName = entity.PrimarySalesRepName,
            CustomerCount = entity.CustomerCount,
            OpportunityCount = entity.OpportunityCount,
            TotalSales = entity.TotalSales,
            StatsUpdatedAt = entity.StatsUpdatedAt,
            Assignments = entity.Assignments.Select(a => new TerritoryAssignmentDto
            {
                Id = a.Id,
                TerritoryId = a.TerritoryId,
                UserId = a.UserId,
                UserName = a.UserName,
                IsPrimary = a.IsPrimary,
                IsActive = a.IsActive,
                AssignedDate = a.AssignedDate,
                EndDate = a.EndDate,
                AssignmentType = a.AssignmentType,
                ResponsibilityPercentage = a.ResponsibilityPercentage
            }).ToList()
        }).ToList();

        return Result<List<TerritoryDto>>.Success(dtos);
    }
}
