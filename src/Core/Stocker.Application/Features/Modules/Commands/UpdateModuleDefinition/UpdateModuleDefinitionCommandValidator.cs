using FluentValidation;

namespace Stocker.Application.Features.Modules.Commands.UpdateModuleDefinition;

public class UpdateModuleDefinitionCommandValidator : AbstractValidator<UpdateModuleDefinitionCommand>
{
    public UpdateModuleDefinitionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Modül ID boş olamaz");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Modül adı boş olamaz")
            .MaximumLength(200).WithMessage("Modül adı en fazla 200 karakter olabilir");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Açıklama en fazla 1000 karakter olabilir");

        RuleFor(x => x.Icon)
            .MaximumLength(100).WithMessage("İkon adı en fazla 100 karakter olabilir");

        RuleFor(x => x.MonthlyPrice)
            .GreaterThanOrEqualTo(0).WithMessage("Aylık fiyat 0 veya daha büyük olmalı");

        RuleFor(x => x.Currency)
            .NotEmpty().WithMessage("Para birimi boş olamaz")
            .Length(3).WithMessage("Para birimi 3 karakter olmalı (örn: TRY, USD)");

        RuleFor(x => x.DisplayOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Sıralama 0 veya daha büyük olmalı");

        RuleFor(x => x.Category)
            .MaximumLength(100).WithMessage("Kategori en fazla 100 karakter olabilir");
    }
}
