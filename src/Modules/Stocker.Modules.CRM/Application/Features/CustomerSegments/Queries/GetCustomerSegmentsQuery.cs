using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;

public class GetCustomerSegmentsQuery : IRequest<Result<List<CustomerSegmentDto>>>
{
    public bool? IsActive { get; set; }
}

public class GetCustomerSegmentsQueryValidator : AbstractValidator<GetCustomerSegmentsQuery>
{
    public GetCustomerSegmentsQueryValidator()
    {
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCustomerSegmentsQueryHandler : IRequestHandler<GetCustomerSegmentsQuery, Result<List<CustomerSegmentDto>>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCustomerSegmentsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CustomerSegmentDto>>> Handle(GetCustomerSegmentsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .Where(s => s.TenantId == tenantId);

        if (request.IsActive.HasValue)
        {
            query = query.Where(s => s.IsActive == request.IsActive.Value);
        }

        var segments = await query
            .Select(s => new CustomerSegmentDto
            {
                Id = s.Id,
                TenantId = s.TenantId,
                Name = s.Name,
                Description = s.Description,
                Type = s.Type,
                Criteria = s.Criteria,
                Color = s.Color,
                IsActive = s.IsActive,
                MemberCount = s.MemberCount,
                CreatedBy = s.CreatedBy,
                LastModifiedBy = s.LastModifiedBy
            })
            .ToListAsync(cancellationToken);

        return Result<List<CustomerSegmentDto>>.Success(segments);
    }
}
