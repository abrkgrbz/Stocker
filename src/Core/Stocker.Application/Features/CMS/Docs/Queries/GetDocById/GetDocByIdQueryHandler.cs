using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Docs.Queries.GetDocById;

public class GetDocByIdQueryHandler : IRequestHandler<GetDocByIdQuery, Result<DocItemDto>>
{
    private readonly IMasterDbContext _context;

    public GetDocByIdQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DocItemDto>> Handle(GetDocByIdQuery request, CancellationToken cancellationToken)
    {
        var docItem = await _context.DocItems
            .Include(d => d.Author)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (docItem == null)
        {
            return Result<DocItemDto>.Failure(
                Error.NotFound("DocItem.NotFound", "Doküman bulunamadı"));
        }

        var dto = new DocItemDto
        {
            Id = docItem.Id,
            Title = docItem.Title,
            Slug = docItem.Slug,
            Type = docItem.Type,
            ParentId = docItem.ParentId,
            Content = docItem.Content,
            Order = docItem.Order,
            Icon = docItem.Icon,
            IsActive = docItem.IsActive,
            CreatedAt = docItem.CreatedAt,
            UpdatedAt = docItem.UpdatedAt,
            AuthorId = docItem.AuthorId,
            AuthorName = docItem.Author != null ? $"{docItem.Author.FirstName} {docItem.Author.LastName}" : null
        };

        return Result<DocItemDto>.Success(dto);
    }
}
