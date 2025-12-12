using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.LandingPage.Commands;

// ==================== Create Testimonial ====================
public class CreateTestimonialCommand : IRequest<Result<TestimonialDto>>
{
    public CreateTestimonialDto Data { get; set; } = null!;
}

public class CreateTestimonialCommandValidator : AbstractValidator<CreateTestimonialCommand>
{
    public CreateTestimonialCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Testimonial data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
            RuleFor(x => x.Data.Content).NotEmpty().WithMessage("Content is required");
            RuleFor(x => x.Data.Rating).InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5");
        });
    }
}

public class CreateTestimonialCommandHandler : IRequestHandler<CreateTestimonialCommand, Result<TestimonialDto>>
{
    private readonly CMSDbContext _context;

    public CreateTestimonialCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<TestimonialDto>> Handle(CreateTestimonialCommand request, CancellationToken cancellationToken)
    {
        var entity = new Testimonial
        {
            Name = request.Data.Name,
            Role = request.Data.Role,
            Company = request.Data.Company,
            Content = request.Data.Content,
            Rating = request.Data.Rating,
            Avatar = request.Data.Avatar,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive,
            IsFeatured = request.Data.IsFeatured
        };

        _context.Testimonials.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<TestimonialDto>.Success(MapToDto(entity));
    }

    private static TestimonialDto MapToDto(Testimonial e) => new(
        e.Id, e.Name, e.Role, e.Company, e.Content, e.Rating,
        e.Avatar, e.SortOrder, e.IsActive, e.IsFeatured, e.CreatedAt);
}

// ==================== Update Testimonial ====================
public class UpdateTestimonialCommand : IRequest<Result<TestimonialDto>>
{
    public Guid Id { get; set; }
    public UpdateTestimonialDto Data { get; set; } = null!;
}

public class UpdateTestimonialCommandValidator : AbstractValidator<UpdateTestimonialCommand>
{
    public UpdateTestimonialCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Testimonial data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
            RuleFor(x => x.Data.Content).NotEmpty().WithMessage("Content is required");
            RuleFor(x => x.Data.Rating).InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5");
        });
    }
}

public class UpdateTestimonialCommandHandler : IRequestHandler<UpdateTestimonialCommand, Result<TestimonialDto>>
{
    private readonly CMSDbContext _context;

    public UpdateTestimonialCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<TestimonialDto>> Handle(UpdateTestimonialCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Testimonials.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<TestimonialDto>.Failure(Error.NotFound("Testimonial.NotFound", $"Testimonial with ID {request.Id} not found"));

        entity.Name = request.Data.Name;
        entity.Role = request.Data.Role;
        entity.Company = request.Data.Company;
        entity.Content = request.Data.Content;
        entity.Rating = request.Data.Rating;
        entity.Avatar = request.Data.Avatar;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.IsFeatured = request.Data.IsFeatured;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<TestimonialDto>.Success(new TestimonialDto(
            entity.Id, entity.Name, entity.Role, entity.Company, entity.Content, entity.Rating,
            entity.Avatar, entity.SortOrder, entity.IsActive, entity.IsFeatured, entity.CreatedAt));
    }
}

// ==================== Delete Testimonial ====================
public class DeleteTestimonialCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteTestimonialCommandValidator : AbstractValidator<DeleteTestimonialCommand>
{
    public DeleteTestimonialCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteTestimonialCommandHandler : IRequestHandler<DeleteTestimonialCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteTestimonialCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteTestimonialCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Testimonials.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("Testimonial.NotFound", $"Testimonial with ID {request.Id} not found"));

        _context.Testimonials.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
