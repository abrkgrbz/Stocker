using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CustomerSegments.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CustomerSegments.Handlers;

public class GetCustomerSegmentByIdHandler : IRequestHandler<GetCustomerSegmentByIdQuery, Result<CustomerSegmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetCustomerSegmentByIdHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<CustomerSegmentDto>> Handle(GetCustomerSegmentByIdQuery request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByIdAsync(request.Id, cancellationToken);
        if (segment == null)
            return Result<CustomerSegmentDto>.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        return Result<CustomerSegmentDto>.Success(CustomerSegmentMapper.MapToDto(segment));
    }
}

public class GetCustomerSegmentByCodeHandler : IRequestHandler<GetCustomerSegmentByCodeQuery, Result<CustomerSegmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetCustomerSegmentByCodeHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<CustomerSegmentDto>> Handle(GetCustomerSegmentByCodeQuery request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetByCodeAsync(request.Code, cancellationToken);
        if (segment == null)
            return Result<CustomerSegmentDto>.Failure(Error.NotFound("Segment.NotFound", "Segment bulunamadı."));

        return Result<CustomerSegmentDto>.Success(CustomerSegmentMapper.MapToDto(segment));
    }
}

public class GetCustomerSegmentsPagedHandler : IRequestHandler<GetCustomerSegmentsPagedQuery, Result<PagedResult<CustomerSegmentListDto>>>
{
    private readonly SalesDbContext _context;
    public GetCustomerSegmentsPagedHandler(SalesDbContext context) => _context = context;

    public async Task<Result<PagedResult<CustomerSegmentListDto>>> Handle(GetCustomerSegmentsPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.CustomerSegments.AsNoTracking().AsQueryable();

        if (!string.IsNullOrEmpty(request.Priority) && Enum.TryParse<SegmentPriority>(request.Priority, true, out var priority))
            query = query.Where(s => s.Priority == priority);

        if (request.IsActive.HasValue)
            query = query.Where(s => s.IsActive == request.IsActive.Value);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .OrderBy(s => s.Priority)
            .ThenBy(s => s.Name)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var dtos = items.Select(CustomerSegmentMapper.MapToListDto).ToList();
        return Result<PagedResult<CustomerSegmentListDto>>.Success(
            new PagedResult<CustomerSegmentListDto>(dtos, totalCount, request.Page, request.PageSize));
    }
}

public class GetActiveCustomerSegmentsHandler : IRequestHandler<GetActiveCustomerSegmentsQuery, Result<IReadOnlyList<CustomerSegmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetActiveCustomerSegmentsHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<IReadOnlyList<CustomerSegmentListDto>>> Handle(GetActiveCustomerSegmentsQuery request, CancellationToken cancellationToken)
    {
        var segments = await _unitOfWork.CustomerSegments.GetActiveAsync(cancellationToken);
        var dtos = segments.Select(CustomerSegmentMapper.MapToListDto).ToList() as IReadOnlyList<CustomerSegmentListDto>;
        return Result<IReadOnlyList<CustomerSegmentListDto>>.Success(dtos);
    }
}

public class GetDefaultCustomerSegmentHandler : IRequestHandler<GetDefaultCustomerSegmentQuery, Result<CustomerSegmentDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetDefaultCustomerSegmentHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<CustomerSegmentDto>> Handle(GetDefaultCustomerSegmentQuery request, CancellationToken cancellationToken)
    {
        var segment = await _unitOfWork.CustomerSegments.GetDefaultAsync(cancellationToken);
        if (segment == null)
            return Result<CustomerSegmentDto>.Failure(Error.NotFound("Segment.NotFound", "Varsayılan segment bulunamadı."));

        return Result<CustomerSegmentDto>.Success(CustomerSegmentMapper.MapToDto(segment));
    }
}

public class GetCustomerSegmentsByPriorityHandler : IRequestHandler<GetCustomerSegmentsByPriorityQuery, Result<IReadOnlyList<CustomerSegmentListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    public GetCustomerSegmentsByPriorityHandler(ISalesUnitOfWork unitOfWork) => _unitOfWork = unitOfWork;

    public async Task<Result<IReadOnlyList<CustomerSegmentListDto>>> Handle(GetCustomerSegmentsByPriorityQuery request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<SegmentPriority>(request.Priority, true, out var priority))
            return Result<IReadOnlyList<CustomerSegmentListDto>>.Failure(Error.Validation("Segment.Priority", "Geçersiz öncelik."));

        var segments = await _unitOfWork.CustomerSegments.GetByPriorityAsync(priority, cancellationToken);
        var dtos = segments.Select(CustomerSegmentMapper.MapToListDto).ToList() as IReadOnlyList<CustomerSegmentListDto>;
        return Result<IReadOnlyList<CustomerSegmentListDto>>.Success(dtos);
    }
}
