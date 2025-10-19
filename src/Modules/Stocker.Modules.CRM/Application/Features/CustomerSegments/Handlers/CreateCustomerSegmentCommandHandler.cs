using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

public class CreateCustomerSegmentCommandHandler : IRequestHandler<CreateCustomerSegmentCommand, Result<CustomerSegmentDto>>
{
    private readonly CRMDbContext _context;

    public CreateCustomerSegmentCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(CreateCustomerSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = new CustomerSegment(
            tenantId: request.TenantId,
            name: request.Name,
            type: request.Type,
            color: request.Color,
            createdBy: request.CreatedBy,
            description: request.Description,
            criteria: request.Criteria
        );

        _context.CustomerSegments.Add(segment);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = new CustomerSegmentDto
        {
            Id = segment.Id,
            TenantId = segment.TenantId,
            Name = segment.Name,
            Description = segment.Description,
            Type = segment.Type,
            Criteria = segment.Criteria,
            Color = segment.Color,
            IsActive = segment.IsActive,
            MemberCount = segment.MemberCount,
            CreatedBy = segment.CreatedBy,
            LastModifiedBy = segment.LastModifiedBy,
            CreatedAt = DateTime.UtcNow
        };

        return Result<CustomerSegmentDto>.Success(dto);
    }
}
