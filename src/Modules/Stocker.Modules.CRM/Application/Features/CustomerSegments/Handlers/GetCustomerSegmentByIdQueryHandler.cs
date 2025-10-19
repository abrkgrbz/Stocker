using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

public class GetCustomerSegmentByIdQueryHandler : IRequestHandler<GetCustomerSegmentByIdQuery, Result<CustomerSegmentDto>>
{
    private readonly CRMDbContext _context;

    public GetCustomerSegmentByIdQueryHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(GetCustomerSegmentByIdQuery request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .Where(s => s.Id == request.Id && s.TenantId == request.TenantId)
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
                LastModifiedBy = s.LastModifiedBy,
                CreatedAt = DateTime.UtcNow
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (segment == null)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.NotFound("CustomerSegment.NotFound", "Customer segment not found"));
        }

        return Result<CustomerSegmentDto>.Success(segment);
    }
}
