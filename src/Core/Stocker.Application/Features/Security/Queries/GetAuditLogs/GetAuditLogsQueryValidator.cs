using FluentValidation;

namespace Stocker.Application.Features.Security.Queries.GetAuditLogs;

/// <summary>
/// Validator for GetAuditLogsQuery
/// </summary>
public class GetAuditLogsQueryValidator : AbstractValidator<GetAuditLogsQuery>
{
    public GetAuditLogsQueryValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThan(0)
            .WithMessage("Sayfa numarası 0'dan büyük olmalıdır");

        RuleFor(x => x.PageSize)
            .GreaterThan(0)
            .WithMessage("Sayfa boyutu 0'dan büyük olmalıdır")
            .LessThanOrEqualTo(100)
            .WithMessage("Sayfa boyutu 100'den küçük veya eşit olmalıdır");

        RuleFor(x => x.FromDate)
            .LessThanOrEqualTo(x => x.ToDate)
            .When(x => x.FromDate.HasValue && x.ToDate.HasValue)
            .WithMessage("Başlangıç tarihi bitiş tarihinden büyük olamaz");

        RuleFor(x => x.MinRiskScore)
            .GreaterThanOrEqualTo(0)
            .When(x => x.MinRiskScore.HasValue)
            .WithMessage("Minimum risk skoru 0'dan küçük olamaz");

        RuleFor(x => x.MaxRiskScore)
            .LessThanOrEqualTo(100)
            .When(x => x.MaxRiskScore.HasValue)
            .WithMessage("Maximum risk skoru 100'den büyük olamaz");

        RuleFor(x => x.MinRiskScore)
            .LessThanOrEqualTo(x => x.MaxRiskScore)
            .When(x => x.MinRiskScore.HasValue && x.MaxRiskScore.HasValue)
            .WithMessage("Minimum risk skoru maximum risk skorundan büyük olamaz");
    }
}
