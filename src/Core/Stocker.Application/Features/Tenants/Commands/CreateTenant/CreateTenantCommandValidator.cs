using FluentValidation;

namespace Stocker.Application.Features.Tenants.Commands.CreateTenant;

public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tenant name is required")
            .MaximumLength(100).WithMessage("Tenant name must not exceed 100 characters");

        RuleFor(x => x.Code)
            .NotEmpty().WithMessage("Tenant code is required")
            .MaximumLength(50).WithMessage("Tenant code must not exceed 50 characters")
            .Matches("^[a-z0-9-]+$").WithMessage("Tenant code can only contain lowercase letters, numbers and hyphens");

        RuleFor(x => x.Domain)
            .NotEmpty().WithMessage("Domain is required")
            .MaximumLength(100).WithMessage("Domain must not exceed 100 characters")
            .Must(BeValidDomain).WithMessage("Invalid domain format");

        RuleFor(x => x.PackageId)
            .NotEmpty().WithMessage("Package selection is required");

        RuleFor(x => x.ContactEmail)
            .EmailAddress().When(x => !string.IsNullOrEmpty(x.ContactEmail))
            .WithMessage("Invalid email format");
    }

    private bool BeValidDomain(string domain)
    {
        if (string.IsNullOrWhiteSpace(domain))
            return false;

        // Basic domain validation
        var domainPattern = @"^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$";
        return System.Text.RegularExpressions.Regex.IsMatch(domain.ToLower(), domainPattern);
    }
}