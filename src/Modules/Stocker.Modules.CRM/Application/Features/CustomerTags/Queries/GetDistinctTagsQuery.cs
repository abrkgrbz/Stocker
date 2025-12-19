using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Queries;

public class GetDistinctTagsQuery : IRequest<Result<List<string>>>
{
}

public class GetDistinctTagsQueryValidator : AbstractValidator<GetDistinctTagsQuery>
{
    public GetDistinctTagsQueryValidator()
    {
    }
}

/// <summary>
/// Uses ICRMUnitOfWork for consistent data access
/// </summary>
public class GetDistinctTagsQueryHandler : IRequestHandler<GetDistinctTagsQuery, Result<List<string>>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public GetDistinctTagsQueryHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<string>>> Handle(GetDistinctTagsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var distinctTags = await _unitOfWork.ReadRepository<CustomerTag>().AsQueryable()
            .Where(t => t.TenantId == tenantId)
            .Select(t => t.Tag)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync(cancellationToken);

        return Result<List<string>>.Success(distinctTags);
    }
}
