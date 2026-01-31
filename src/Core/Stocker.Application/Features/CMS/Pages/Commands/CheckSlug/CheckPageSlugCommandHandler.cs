using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Application.DTOs.CMS;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.CMS.Pages.Commands.CheckSlug;

public class CheckPageSlugCommandHandler : IRequestHandler<CheckPageSlugCommand, Result<SlugCheckResultDto>>
{
    private readonly IMasterDbContext _context;

    public CheckPageSlugCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SlugCheckResultDto>> Handle(CheckPageSlugCommand request, CancellationToken cancellationToken)
    {
        var slug = request.Slug.ToLowerInvariant();

        var query = _context.CmsPages.Where(p => p.Slug == slug);

        if (request.ExcludeId.HasValue)
        {
            query = query.Where(p => p.Id != request.ExcludeId.Value);
        }

        var exists = await query.AnyAsync(cancellationToken);

        var result = new SlugCheckResultDto
        {
            Slug = slug,
            IsAvailable = !exists
        };

        // If slug exists, suggest an alternative
        if (exists)
        {
            var baseSlug = slug;
            var counter = 1;
            string suggestedSlug;

            do
            {
                suggestedSlug = $"{baseSlug}-{counter}";
                counter++;
            }
            while (await _context.CmsPages.AnyAsync(p => p.Slug == suggestedSlug, cancellationToken));

            result.SuggestedSlug = suggestedSlug;
        }

        return Result<SlugCheckResultDto>.Success(result);
    }
}
