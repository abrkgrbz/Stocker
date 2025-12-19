using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;

public class GetCustomerTagsQuery : IRequest<Result<List<CustomerTagDto>>>
{
    public Guid CustomerId { get; set; }
}

public class GetCustomerTagsQueryValidator : AbstractValidator<GetCustomerTagsQuery>
{
    public GetCustomerTagsQueryValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty().WithMessage("Customer ID is required");
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetCustomerTagsQueryHandler : IRequestHandler<GetCustomerTagsQuery, Result<List<CustomerTagDto>>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetCustomerTagsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<CustomerTagDto>>> Handle(GetCustomerTagsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var tags = await _unitOfWork.ReadRepository<CustomerTag>().AsQueryable()
            .Where(t => t.CustomerId == request.CustomerId && t.TenantId == tenantId)
            .Select(t => new CustomerTagDto
            {
                Id = t.Id,
                TenantId = t.TenantId,
                CustomerId = t.CustomerId,
                Tag = t.Tag,
                Color = t.Color,
                CreatedBy = t.CreatedBy
            })
            .ToListAsync(cancellationToken);

        return Result<List<CustomerTagDto>>.Success(tags);
    }
}
