using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Queries;

// ==================== Get All Company Values ====================
public class GetCompanyValuesQuery : IRequest<List<CompanyValueDto>>
{
}

public class GetCompanyValuesQueryHandler : IRequestHandler<GetCompanyValuesQuery, List<CompanyValueDto>>
{
    private readonly CMSDbContext _context;

    public GetCompanyValuesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<CompanyValueDto>> Handle(GetCompanyValuesQuery request, CancellationToken cancellationToken)
    {
        return await _context.CompanyValues
            .OrderBy(x => x.SortOrder)
            .Select(e => new CompanyValueDto(
                e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Company Values ====================
public class GetActiveCompanyValuesQuery : IRequest<List<CompanyValueDto>>
{
}

public class GetActiveCompanyValuesQueryHandler : IRequestHandler<GetActiveCompanyValuesQuery, List<CompanyValueDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveCompanyValuesQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<CompanyValueDto>> Handle(GetActiveCompanyValuesQuery request, CancellationToken cancellationToken)
    {
        return await _context.CompanyValues
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new CompanyValueDto(
                e.Id, e.Title, e.Description, e.Icon, e.IconColor, e.SortOrder, e.IsActive, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Company Value By ID ====================
public class GetCompanyValueByIdQuery : IRequest<CompanyValueDto?>
{
    public Guid Id { get; set; }
}

public class GetCompanyValueByIdQueryHandler : IRequestHandler<GetCompanyValueByIdQuery, CompanyValueDto?>
{
    private readonly CMSDbContext _context;

    public GetCompanyValueByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<CompanyValueDto?> Handle(GetCompanyValueByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.CompanyValues.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new CompanyValueDto(
            entity.Id, entity.Title, entity.Description, entity.Icon, entity.IconColor, entity.SortOrder, entity.IsActive, entity.CreatedAt);
    }
}
