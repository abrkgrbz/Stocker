using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Queries.GetDocTree;

public class GetDocTreeQueryHandler : IRequestHandler<GetDocTreeQuery, Result<List<DocItemTreeDto>>>
{
    private readonly IMasterDbContext _context;

    public GetDocTreeQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<DocItemTreeDto>>> Handle(GetDocTreeQuery request, CancellationToken cancellationToken)
    {
        var query = _context.DocItems.AsQueryable();

        if (request.ActiveOnly)
        {
            query = query.Where(d => d.IsActive);
        }

        var allItems = await query
            .OrderBy(d => d.Order)
            .ThenBy(d => d.Title)
            .Select(d => new DocItemTreeDto
            {
                Id = d.Id,
                Title = d.Title,
                Slug = d.Slug,
                Type = d.Type,
                ParentId = d.ParentId,
                Order = d.Order,
                Icon = d.Icon,
                IsActive = d.IsActive,
                UpdatedAt = d.UpdatedAt,
                Children = new List<DocItemTreeDto>()
            })
            .ToListAsync(cancellationToken);

        // Build tree structure
        var lookup = allItems.ToLookup(i => i.ParentId);
        var tree = BuildTree(null, lookup);

        return Result<List<DocItemTreeDto>>.Success(tree);
    }

    private static List<DocItemTreeDto> BuildTree(Guid? parentId, ILookup<Guid?, DocItemTreeDto> lookup)
    {
        var items = lookup[parentId].ToList();

        foreach (var item in items)
        {
            item.Children = BuildTree(item.Id, lookup);
        }

        return items;
    }
}
