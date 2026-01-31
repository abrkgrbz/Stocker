using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.Domain.Master.Entities.CMS;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Commands.CreatePage;

public class CreatePageCommandHandler : IRequestHandler<CreatePageCommand, Result<CmsPageDto>>
{
    private readonly IMasterDbContext _context;
    private readonly IMapper _mapper;
    private readonly ILogger<CreatePageCommandHandler> _logger;

    public CreatePageCommandHandler(
        IMasterDbContext context,
        IMapper mapper,
        ILogger<CreatePageCommandHandler> logger)
    {
        _context = context;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<CmsPageDto>> Handle(CreatePageCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Check if slug already exists
            var slugExists = await _context.CmsPages
                .AnyAsync(p => p.Slug == request.Slug.ToLowerInvariant(), cancellationToken);

            if (slugExists)
            {
                return Result<CmsPageDto>.Failure(
                    Error.Conflict("CmsPage.SlugExists", "Bu slug zaten kullanımda"));
            }

            // Verify author exists
            var authorExists = await _context.MasterUsers
                .AnyAsync(u => u.Id == request.AuthorId, cancellationToken);

            if (!authorExists)
            {
                return Result<CmsPageDto>.Failure(
                    Error.NotFound("CmsPage.AuthorNotFound", "Yazar bulunamadı"));
            }

            // Create page
            var page = CmsPage.Create(
                title: request.Title,
                slug: request.Slug,
                content: request.Content,
                status: request.Status,
                authorId: request.AuthorId,
                metaTitle: request.MetaTitle,
                metaDescription: request.MetaDescription,
                featuredImage: request.FeaturedImage);

            _context.CmsPages.Add(page);
            await _context.SaveChangesAsync(cancellationToken);

            // Load author for DTO mapping
            var author = await _context.MasterUsers
                .FirstOrDefaultAsync(u => u.Id == request.AuthorId, cancellationToken);

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
                    Id = author!.Id,
                    Name = $"{author.FirstName} {author.LastName}",
                    Avatar = null
                }
            };

            _logger.LogInformation("CMS Page created: {PageId} - {Title}", page.Id, page.Title);

            return Result<CmsPageDto>.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating CMS page: {Title}", request.Title);
            return Result<CmsPageDto>.Failure(
                Error.Failure("CmsPage.CreateFailed", "Sayfa oluşturma işlemi başarısız oldu"));
        }
    }
}
