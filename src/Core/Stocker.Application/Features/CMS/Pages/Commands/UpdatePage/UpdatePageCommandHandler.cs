using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Commands.UpdatePage;

public class UpdatePageCommandHandler : IRequestHandler<UpdatePageCommand, Result<CmsPageDto>>
{
    private readonly IMasterDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<UpdatePageCommandHandler> _logger;

    public UpdatePageCommandHandler(
        IMasterDbContext context,
        IMapper mapper,
        ILogger<UpdatePageCommandHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<CmsPageDto>> Handle(UpdatePageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var page = await _context.CmsPages
                .Include(p => p.Author)
                .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

            if (page == null)
            {
                return Result<CmsPageDto>.Failure(
                    Error.NotFound("CmsPage.NotFound", "Sayfa bulunamadı"));
            }

            // Check if slug is taken by another page
            var slugExists = await _context.CmsPages
                .AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant() && p.Id != request.Id, cancellationToken);

            if (slugExists)
            {
                return Result<CmsPageDto>.Failure(
                    Error.Conflict("CmsPage.SlugExists", "Bu slug zaten kullanımda"));
            }

            // Update page
            page.Update(
                title: request.Title,
                slug: request.Slug,
                content: request.Content,
                status: request.Status,
                metaTitle: request.MetaTitle,
                metaDescription: request.MetaDescription,
                featuredImage: request.FeaturedImage);

            await _context.SaveChangesAsync(cancellationToken);

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

            _logger.LogInformation("CMS Page updated: {PageId} - {Title}", page.Id, page.Title);

            return Result<CmsPageDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating CMS page: {PageId}", request.Id);
            return Result<CmsPageDto>.Failure(
                Error.Failure("CmsPage.UpdateFailed", "Sayfa güncelleme işlemi başarısız oldu"));
        }
    }
}
