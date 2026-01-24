using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesTargets.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesTargets.Handlers;

public class GetSalesTargetByIdHandler : IRequestHandler<GetSalesTargetByIdQuery, Result<SalesTargetDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetSalesTargetByIdHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<SalesTargetDto>> Handle(GetSalesTargetByIdQuery request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByIdAsync(request.Id, cancellationToken);
        if (target == null)
            return Result<SalesTargetDto>.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        return Result<SalesTargetDto>.Success(SalesTargetMapper.MapToDto(target));
    }
}

public class GetSalesTargetByCodeHandler : IRequestHandler<GetSalesTargetByCodeQuery, Result<SalesTargetDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetSalesTargetByCodeHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<SalesTargetDto>> Handle(GetSalesTargetByCodeQuery request, CancellationToken cancellationToken)
    {
        var target = await _unitOfWork.SalesTargets.GetByCodeAsync(request.Code, cancellationToken);
        if (target == null)
            return Result<SalesTargetDto>.Failure(Error.NotFound("SalesTarget.NotFound", "Hedef bulunamadı."));

        return Result<SalesTargetDto>.Success(SalesTargetMapper.MapToDto(target));
    }
}

public class GetSalesTargetsPagedHandler : IRequestHandler<GetSalesTargetsPagedQuery, Result<PagedResult<SalesTargetListDto>>>
{
    private readonly SalesDbContext _context;
    public GetSalesTargetsPagedHandler(SalesDbContext context) => _context = context;

    public async Task<Result<PagedResult<SalesTargetListDto>>> Handle(GetSalesTargetsPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.SalesTargets.AsNoTracking().AsQueryable();

        if (request.Year.HasValue)
            query = query.Where(t => t.Year == request.Year.Value);

        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<SalesTargetStatus>(request.Status, true, out var status))
            query = query.Where(t => t.Status == status);

        if (!string.IsNullOrEmpty(request.TargetType) && Enum.TryParse<SalesTargetType>(request.TargetType, true, out var targetType))
            query = query.Where(t => t.TargetType == targetType);

        if (request.SalesRepresentativeId.HasValue)
            query = query.Where(t => t.SalesRepresentativeId == request.SalesRepresentativeId.Value);

        if (request.SalesTeamId.HasValue)
            query = query.Where(t => t.SalesTeamId == request.SalesTeamId.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderByDescending(t => t.Year)
            .ThenBy(t => t.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(SalesTargetMapper.MapToListDto).ToList();
        return Result<PagedResult<SalesTargetListDto>>.Success(
            new PagedResult<SalesTargetListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}

public class GetSalesTargetsByYearHandler : IRequestHandler<GetSalesTargetsByYearQuery, Result<IReadOnlyList<SalesTargetListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetSalesTargetsByYearHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<IReadOnlyList<SalesTargetListDto>>> Handle(GetSalesTargetsByYearQuery request, CancellationToken cancellationToken)
    {
        var targets = await _unitOfWork.SalesTargets.GetByYearAsync(request.Year, cancellationToken);
        var dtos = targets.Select(SalesTargetMapper.MapToListDto).ToList() as IReadOnlyList<SalesTargetListDto>;
        return Result<IReadOnlyList<SalesTargetListDto>>.Success(dtos);
    }
}

public class GetSalesTargetsByRepresentativeHandler : IRequestHandler<GetSalesTargetsByRepresentativeQuery, Result<IReadOnlyList<SalesTargetListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetSalesTargetsByRepresentativeHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<IReadOnlyList<SalesTargetListDto>>> Handle(GetSalesTargetsByRepresentativeQuery request, CancellationToken cancellationToken)
    {
        var targets = await _unitOfWork.SalesTargets.GetBySalesRepresentativeAsync(request.SalesRepId, cancellationToken);
        var dtos = targets.Select(SalesTargetMapper.MapToListDto).ToList() as IReadOnlyList<SalesTargetListDto>;
        return Result<IReadOnlyList<SalesTargetListDto>>.Success(dtos);
    }
}

public class GetSalesTargetsByTeamHandler : IRequestHandler<GetSalesTargetsByTeamQuery, Result<IReadOnlyList<SalesTargetListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetSalesTargetsByTeamHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<IReadOnlyList<SalesTargetListDto>>> Handle(GetSalesTargetsByTeamQuery request, CancellationToken cancellationToken)
    {
        var targets = await _unitOfWork.SalesTargets.GetByTeamAsync(request.TeamId, cancellationToken);
        var dtos = targets.Select(SalesTargetMapper.MapToListDto).ToList() as IReadOnlyList<SalesTargetListDto>;
        return Result<IReadOnlyList<SalesTargetListDto>>.Success(dtos);
    }
}

public class GetActiveSalesTargetsHandler : IRequestHandler<GetActiveSalesTargetsQuery, Result<IReadOnlyList<SalesTargetListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetActiveSalesTargetsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<IReadOnlyList<SalesTargetListDto>>> Handle(GetActiveSalesTargetsQuery request, CancellationToken cancellationToken)
    {
        var targets = await _unitOfWork.SalesTargets.GetActiveAsync(cancellationToken);
        var dtos = targets.Select(SalesTargetMapper.MapToListDto).ToList() as IReadOnlyList<SalesTargetListDto>;
        return Result<IReadOnlyList<SalesTargetListDto>>.Success(dtos);
    }
}
