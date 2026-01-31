using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Queries.GetPageById;

public class GetPageByIdQueryHandler : IRequestHandler<GetPageByIdQuery, Result<CmsPageDto>>
{
    private readonly IMasterDbContext _context;

    public GetPageByIdQueryHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CmsPageDto>> Handle(GetPageByIdQuery request, CancellationToken cancellationToken)
    {
        var page = await _context.CmsPages
            .Include(p => p.Author)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (page == null)
        {
            return Result<CmsPageDto>.Failure(
                Error.NotFound("CmsPage.NotFound", "Sayfa bulunamadı"));
        }

        var dto = new CmsPageDto
        {
            Id = page.Id,
            Title = page.Title,
            Slug = page.Slug,
            Content = page.Content,
            Status = page.Status,
            MetaTitle = page.MetaTitle,
            MetaDescription = page.MetaDescription,
            FeaturedImage = page.FeaturedImage,
            Views = page.Views,
            CreatedAt = page.CreatedAt,
            UpdatedAt = page.UpdatedAt,
            PublishedAt = page.PublishedAt,
            Author = new AuthorDto
            {
                Id = page.Author!.Id,
                Name = $"{page.Author.FirstName} {page.Author.LastName}",
                Avatar = null
            }
        };

        return Result<CmsPageDto>.Success(dto);
    }
}
