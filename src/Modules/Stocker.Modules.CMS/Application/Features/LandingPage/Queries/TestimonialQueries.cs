using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Infrastructure.Persistence;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Queries;

// ==================== Get All Testimonials ====================
public class GetTestimonialsQuery : IRequest<List<TestimonialDto>>
{
}

public class GetTestimonialsQueryHandler : IRequestHandler<GetTestimonialsQuery, List<TestimonialDto>>
{
    private readonly CMSDbContext _context;

    public GetTestimonialsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<TestimonialDto>> Handle(GetTestimonialsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Testimonials
            .OrderBy(x => x.SortOrder)
            .Select(e => new TestimonialDto(
                e.Id, e.Name, e.Role, e.Company, e.Content, e.Rating,
                e.Avatar, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Active Testimonials ====================
public class GetActiveTestimonialsQuery : IRequest<List<TestimonialDto>>
{
}

public class GetActiveTestimonialsQueryHandler : IRequestHandler<GetActiveTestimonialsQuery, List<TestimonialDto>>
{
    private readonly CMSDbContext _context;

    public GetActiveTestimonialsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<TestimonialDto>> Handle(GetActiveTestimonialsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Testimonials
            .Where(x => x.IsActive)
            .OrderBy(x => x.SortOrder)
            .Select(e => new TestimonialDto(
                e.Id, e.Name, e.Role, e.Company, e.Content, e.Rating,
                e.Avatar, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Featured Testimonials ====================
public class GetFeaturedTestimonialsQuery : IRequest<List<TestimonialDto>>
{
}

public class GetFeaturedTestimonialsQueryHandler : IRequestHandler<GetFeaturedTestimonialsQuery, List<TestimonialDto>>
{
    private readonly CMSDbContext _context;

    public GetFeaturedTestimonialsQueryHandler(CMSDbContext context) => _context = context;

    public async Task<List<TestimonialDto>> Handle(GetFeaturedTestimonialsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Testimonials
            .Where(x => x.IsActive && x.IsFeatured)
            .OrderBy(x => x.SortOrder)
            .Select(e => new TestimonialDto(
                e.Id, e.Name, e.Role, e.Company, e.Content, e.Rating,
                e.Avatar, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

// ==================== Get Testimonial By ID ====================
public class GetTestimonialByIdQuery : IRequest<TestimonialDto?>
{
    public Guid Id { get; set; }
}

public class GetTestimonialByIdQueryHandler : IRequestHandler<GetTestimonialByIdQuery, TestimonialDto?>
{
    private readonly CMSDbContext _context;

    public GetTestimonialByIdQueryHandler(CMSDbContext context) => _context = context;

    public async Task<TestimonialDto?> Handle(GetTestimonialByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _context.Testimonials.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null) return null;

        return new TestimonialDto(
            entity.Id, entity.Name, entity.Role, entity.Company, entity.Content, entity.Rating,
            entity.Avatar, entity.SortOrder, entity.IsActive, entity.IsFeatured, entity.CreatedAt);
    }
}
