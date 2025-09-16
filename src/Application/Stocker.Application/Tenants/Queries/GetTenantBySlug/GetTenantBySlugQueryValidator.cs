using FluentValidation;

namespace Stocker.Application.Tenants.Queries.GetTenantBySlug;

public class GetTenantBySlugQueryValidator : AbstractValidator<GetTenantBySlugQuery>
{
    public GetTenantBySlugQueryValidator()
    {
        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Slug is required")
            .MaximumLength(100).WithMessage("Slug must not exceed 100 characters")
            .Matches(@"^[a-zA-Z0-9][a-zA-Z0-9-]*$").WithMessage("Slug must contain only alphanumeric characters and hyphens, and cannot start with a hyphen");
    }
}