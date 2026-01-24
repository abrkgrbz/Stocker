using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Opportunities.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Opportunities.Handlers;

public class GetOpportunityByIdHandler : IRequestHandler<GetOpportunityByIdQuery, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOpportunityByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(GetOpportunityByIdQuery request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByIdAsync(request.Id, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class GetOpportunityByNumberHandler : IRequestHandler<GetOpportunityByNumberQuery, Result<OpportunityDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOpportunityByNumberHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<OpportunityDto>> Handle(GetOpportunityByNumberQuery request, CancellationToken cancellationToken)
    {
        var opportunity = await _unitOfWork.Opportunities.GetByNumberAsync(request.OpportunityNumber, cancellationToken);
        if (opportunity == null)
            return Result<OpportunityDto>.Failure(Error.NotFound("Opportunity.NotFound", "Opportunity not found"));

        return Result<OpportunityDto>.Success(CreateOpportunityHandler.MapToDto(opportunity));
    }
}

public class GetOpportunitiesPagedHandler : IRequestHandler<GetOpportunitiesPagedQuery, Result<PagedResult<OpportunityListDto>>>
{
    private readonly SalesDbContext _context;

    public GetOpportunitiesPagedHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedResult<OpportunityListDto>>> Handle(GetOpportunitiesPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Opportunities
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Stage) && Enum.TryParse<OpportunityStage>(request.Stage, true, out var stage))
            query = query.Where(o => o.Stage == stage);

        if (!string.IsNullOrWhiteSpace(request.Priority) && Enum.TryParse<OpportunityPriority>(request.Priority, true, out var priority))
            query = query.Where(o => o.Priority == priority);

        if (!string.IsNullOrWhiteSpace(request.Source) && Enum.TryParse<OpportunitySource>(request.Source, true, out var source))
            query = query.Where(o => o.Source == source);

        if (request.CustomerId.HasValue)
            query = query.Where(o => o.CustomerId == request.CustomerId.Value);

        if (request.SalesPersonId.HasValue)
            query = query.Where(o => o.SalesPersonId == request.SalesPersonId.Value);

        if (request.PipelineId.HasValue)
            query = query.Where(o => o.PipelineId == request.PipelineId.Value);

        if (request.IsOpen.HasValue)
        {
            if (request.IsOpen.Value)
                query = query.Where(o => !o.IsWon && !o.IsLost);
            else
                query = query.Where(o => o.IsWon || o.IsLost);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(o => o.CreatedDate)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(CreateOpportunityHandler.MapToListDto).ToList();

        return Result<PagedResult<OpportunityListDto>>.Success(
            new PagedResult<OpportunityListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}

public class GetOpportunitiesByCustomerHandler : IRequestHandler<GetOpportunitiesByCustomerQuery, Result<IReadOnlyList<OpportunityListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOpportunitiesByCustomerHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<OpportunityListDto>>> Handle(GetOpportunitiesByCustomerQuery request, CancellationToken cancellationToken)
    {
        var opportunities = await _unitOfWork.Opportunities.GetByCustomerIdAsync(request.CustomerId, cancellationToken);
        var dtos = opportunities.Select(CreateOpportunityHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<OpportunityListDto>>.Success(dtos);
    }
}

public class GetOpportunitiesBySalesPersonHandler : IRequestHandler<GetOpportunitiesBySalesPersonQuery, Result<IReadOnlyList<OpportunityListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOpportunitiesBySalesPersonHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<OpportunityListDto>>> Handle(GetOpportunitiesBySalesPersonQuery request, CancellationToken cancellationToken)
    {
        var opportunities = await _unitOfWork.Opportunities.GetBySalesPersonIdAsync(request.SalesPersonId, cancellationToken);
        var dtos = opportunities.Select(CreateOpportunityHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<OpportunityListDto>>.Success(dtos);
    }
}

public class GetOpportunitiesByStageHandler : IRequestHandler<GetOpportunitiesByStageQuery, Result<IReadOnlyList<OpportunityListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOpportunitiesByStageHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<OpportunityListDto>>> Handle(GetOpportunitiesByStageQuery request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<OpportunityStage>(request.Stage, true, out var stage))
            return Result<IReadOnlyList<OpportunityListDto>>.Failure(Error.Validation("Opportunity.InvalidStage", "Invalid stage value"));

        var opportunities = await _unitOfWork.Opportunities.GetByStageAsync(stage, cancellationToken);
        var dtos = opportunities.Select(CreateOpportunityHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<OpportunityListDto>>.Success(dtos);
    }
}

public class GetOpportunitiesByPipelineHandler : IRequestHandler<GetOpportunitiesByPipelineQuery, Result<IReadOnlyList<OpportunityListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOpportunitiesByPipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<OpportunityListDto>>> Handle(GetOpportunitiesByPipelineQuery request, CancellationToken cancellationToken)
    {
        var opportunities = await _unitOfWork.Opportunities.GetByPipelineIdAsync(request.PipelineId, cancellationToken);
        var dtos = opportunities.Select(CreateOpportunityHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<OpportunityListDto>>.Success(dtos);
    }
}

public class GetOpenOpportunitiesHandler : IRequestHandler<GetOpenOpportunitiesQuery, Result<IReadOnlyList<OpportunityListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetOpenOpportunitiesHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<OpportunityListDto>>> Handle(GetOpenOpportunitiesQuery request, CancellationToken cancellationToken)
    {
        var opportunities = await _unitOfWork.Opportunities.GetOpenAsync(cancellationToken);
        var dtos = opportunities.Select(CreateOpportunityHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<OpportunityListDto>>.Success(dtos);
    }
}
