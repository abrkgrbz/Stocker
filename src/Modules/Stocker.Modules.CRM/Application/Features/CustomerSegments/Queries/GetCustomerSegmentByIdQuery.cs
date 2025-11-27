using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;

public class GetCustomerSegmentByIdQuery : IRequest<Result<CustomerSegmentDto>>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class GetCustomerSegmentByIdQueryValidator : AbstractValidator<GetCustomerSegmentByIdQuery>
{
    public GetCustomerSegmentByIdQueryValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

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
                LastModifiedBy = s.LastModifiedBy
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (segment == null)
        {
            return Result<CustomerSegmentDto>.Failure(
                Error.NotFound("CustomerSegment.NotFound", $"Segment with ID {request.Id} not found"));
        }

        return Result<CustomerSegmentDto>.Success(segment);
    }
}
