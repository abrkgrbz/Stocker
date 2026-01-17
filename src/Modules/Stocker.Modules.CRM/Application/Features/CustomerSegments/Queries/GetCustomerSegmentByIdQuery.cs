using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Queries;

public class GetCustomerSegmentByIdQuery : IRequest<Result<CustomerSegmentDto>>
{
    public Guid Id { get; set; }
}

public class GetCustomerSegmentByIdQueryValidator : AbstractValidator<GetCustomerSegmentByIdQuery>
{
    public GetCustomerSegmentByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Segment ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCustomerSegmentByIdQueryHandler : IRequestHandler<GetCustomerSegmentByIdQuery, Result<CustomerSegmentDto>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCustomerSegmentByIdQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerSegmentDto>> Handle(GetCustomerSegmentByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var segment = await _unitOfWork.ReadRepository<Domain.Entities.CustomerSegment>().AsQueryable()
            .Where(s => s.Id == request.Id && s.TenantId == tenantId)
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
                CreatedAt = s.CreatedAt,
                UpdatedAt = s.UpdatedAt
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
