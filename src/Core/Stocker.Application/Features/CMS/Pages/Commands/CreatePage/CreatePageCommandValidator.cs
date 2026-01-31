using FluentValidation;

namespace Stocker.Application.Features.CMS.Pages.Commands.CreatePage;

public class CreatePageCommandValidator : AbstractValidator<CreatePageCommand>
{
    public CreatePageCommandValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Sayfa başlığı zorunludur")
            .MaximumLength(200).WithMessage("Sayfa başlığı en fazla 200 karakter olabilir");

        RuleFor(x => x.Slug)
            .NotEmpty().WithMessage("Sayfa slug'ı zorunludur")
            .MaximumLength(200).WithMessage("Slug en fazla 200 karakter olabilir")
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithMessage("Slug sadece küçük harf, rakam ve tire içerebilir");

        RuleFor(x => x.Content)
            .NotEmpty().WithMessage("Sayfa içeriği zorunludur");

        RuleFor(x => x.AuthorId)
            .NotEmpty().WithMessage("Yazar ID zorunludur");

        RuleFor(x => x.MetaTitle)
            .MaximumLength(200).WithMessage("Meta başlık en fazla 200 karakter olabilir")
            .When(x => !string.IsNullOrEmpty(x.MetaTitle));

        RuleFor(x => x.MetaDescription)
            .MaximumLength(500).WithMessage("Meta açıklama en fazla 500 karakter olabilir")
            .When(x => !string.IsNullOrEmpty(x.MetaDescription));
    }
}
