using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CMS.Application.DTOs;
using Stocker.Modules.CMS.Domain.Entities;
using Stocker.Modules.CMS.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CMS.Application.Features.CompanyPage.Commands;

// ==================== Create TeamMember ====================
public class CreateTeamMemberCommand : IRequest<Result<TeamMemberDto>>
{
    public CreateTeamMemberDto Data { get; set; } = null!;
}

public class CreateTeamMemberCommandValidator : AbstractValidator<CreateTeamMemberCommand>
{
    public CreateTeamMemberCommandValidator()
    {
        RuleFor(x => x.Data).NotNull().WithMessage("Team member data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
            RuleFor(x => x.Data.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Data.Email)).WithMessage("Invalid email format");
        });
    }
}

public class CreateTeamMemberCommandHandler : IRequestHandler<CreateTeamMemberCommand, Result<TeamMemberDto>>
{
    private readonly CMSDbContext _context;

    public CreateTeamMemberCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<TeamMemberDto>> Handle(CreateTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var entity = new TeamMember
        {
            Name = request.Data.Name,
            Role = request.Data.Role,
            Department = request.Data.Department,
            Bio = request.Data.Bio,
            Avatar = request.Data.Avatar,
            Email = request.Data.Email,
            LinkedIn = request.Data.LinkedIn,
            Twitter = request.Data.Twitter,
            SortOrder = request.Data.SortOrder,
            IsActive = request.Data.IsActive,
            IsLeadership = request.Data.IsLeadership
        };

        _context.TeamMembers.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<TeamMemberDto>.Success(MapToDto(entity));
    }

    private static TeamMemberDto MapToDto(TeamMember e) => new(
        e.Id, e.Name, e.Role, e.Department, e.Bio, e.Avatar, e.Email, e.LinkedIn, e.Twitter,
        e.SortOrder, e.IsActive, e.IsLeadership, e.CreatedAt);
}

// ==================== Update TeamMember ====================
public class UpdateTeamMemberCommand : IRequest<Result<TeamMemberDto>>
{
    public Guid Id { get; set; }
    public UpdateTeamMemberDto Data { get; set; } = null!;
}

public class UpdateTeamMemberCommandValidator : AbstractValidator<UpdateTeamMemberCommand>
{
    public UpdateTeamMemberCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
        RuleFor(x => x.Data).NotNull().WithMessage("Team member data is required");
        When(x => x.Data != null, () =>
        {
            RuleFor(x => x.Data.Name).NotEmpty().WithMessage("Name is required").MaximumLength(100);
            RuleFor(x => x.Data.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Data.Email)).WithMessage("Invalid email format");
        });
    }
}

public class UpdateTeamMemberCommandHandler : IRequestHandler<UpdateTeamMemberCommand, Result<TeamMemberDto>>
{
    private readonly CMSDbContext _context;

    public UpdateTeamMemberCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<TeamMemberDto>> Handle(UpdateTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TeamMembers.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<TeamMemberDto>.Failure(Error.NotFound("TeamMember.NotFound", $"Team member with ID {request.Id} not found"));

        entity.Name = request.Data.Name;
        entity.Role = request.Data.Role;
        entity.Department = request.Data.Department;
        entity.Bio = request.Data.Bio;
        entity.Avatar = request.Data.Avatar;
        entity.Email = request.Data.Email;
        entity.LinkedIn = request.Data.LinkedIn;
        entity.Twitter = request.Data.Twitter;
        entity.SortOrder = request.Data.SortOrder;
        entity.IsActive = request.Data.IsActive;
        entity.IsLeadership = request.Data.IsLeadership;
        entity.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<TeamMemberDto>.Success(new TeamMemberDto(
            entity.Id, entity.Name, entity.Role, entity.Department, entity.Bio, entity.Avatar, entity.Email, entity.LinkedIn, entity.Twitter,
            entity.SortOrder, entity.IsActive, entity.IsLeadership, entity.CreatedAt));
    }
}

// ==================== Delete TeamMember ====================
public class DeleteTeamMemberCommand : IRequest<Result<Unit>>
{
    public Guid Id { get; set; }
}

public class DeleteTeamMemberCommandValidator : AbstractValidator<DeleteTeamMemberCommand>
{
    public DeleteTeamMemberCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("ID is required");
    }
}

public class DeleteTeamMemberCommandHandler : IRequestHandler<DeleteTeamMemberCommand, Result<Unit>>
{
    private readonly CMSDbContext _context;

    public DeleteTeamMemberCommandHandler(CMSDbContext context) => _context = context;

    public async Task<Result<Unit>> Handle(DeleteTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.TeamMembers.FindAsync(new object[] { request.Id }, cancellationToken);
        if (entity == null)
            return Result<Unit>.Failure(Error.NotFound("TeamMember.NotFound", $"Team member with ID {request.Id} not found"));

        _context.TeamMembers.Remove(entity);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Unit>.Success(Unit.Value);
    }
}
