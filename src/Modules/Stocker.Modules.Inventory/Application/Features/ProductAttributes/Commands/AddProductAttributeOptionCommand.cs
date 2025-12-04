using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to add an option to a product attribute
/// </summary>
public class AddProductAttributeOptionCommand : IRequest<Result<ProductAttributeOptionDto>>
{
    public int TenantId { get; set; }
    public int AttributeId { get; set; }
    public CreateProductAttributeOptionDto OptionData { get; set; } = null!;
}

/// <summary>
/// Validator for AddProductAttributeOptionCommand
/// </summary>
public class AddProductAttributeOptionCommandValidator : AbstractValidator<AddProductAttributeOptionCommand>
{
    public AddProductAttributeOptionCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.AttributeId).GreaterThan(0);
        RuleFor(x => x.OptionData).NotNull();
        RuleFor(x => x.OptionData.Value).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OptionData.Label).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OptionData.ColorCode).MaximumLength(20);
        RuleFor(x => x.OptionData.ImageUrl).MaximumLength(500);
    }
}

/// <summary>
/// Handler for AddProductAttributeOptionCommand
/// </summary>
public class AddProductAttributeOptionCommandHandler : IRequestHandler<AddProductAttributeOptionCommand, Result<ProductAttributeOptionDto>>
{
    private readonly IProductAttributeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public AddProductAttributeOptionCommandHandler(IProductAttributeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductAttributeOptionDto>> Handle(AddProductAttributeOptionCommand request, CancellationToken cancellationToken)
    {
        var attribute = await _repository.GetWithOptionsAsync(request.AttributeId, cancellationToken);

        if (attribute == null)
        {
            return Result<ProductAttributeOptionDto>.Failure(
                new Error("ProductAttribute.NotFound", $"Product attribute with ID {request.AttributeId} not found", ErrorType.NotFound));
        }

        // Only Select and MultiSelect types can have options
        if (attribute.AttributeType != AttributeType.Select && attribute.AttributeType != AttributeType.MultiSelect)
        {
            return Result<ProductAttributeOptionDto>.Failure(
                new Error("ProductAttribute.InvalidType", "Options can only be added to Select or MultiSelect attributes", ErrorType.Validation));
        }

        var data = request.OptionData;

        // Check if option with same value already exists
        if (attribute.Options.Any(o => o.Value == data.Value))
        {
            return Result<ProductAttributeOptionDto>.Failure(
                new Error("ProductAttributeOption.DuplicateValue", $"Option with value '{data.Value}' already exists", ErrorType.Conflict));
        }

        var option = attribute.AddOption(data.Value, data.Label);
        option.SetColorCode(data.ColorCode);
        option.SetImageUrl(data.ImageUrl);
        option.SetDisplayOrder(data.DisplayOrder);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new ProductAttributeOptionDto
        {
            Id = option.Id,
            ProductAttributeId = option.ProductAttributeId,
            Value = option.Value,
            Label = option.Label,
            ColorCode = option.ColorCode,
            ImageUrl = option.ImageUrl,
            DisplayOrder = option.DisplayOrder,
            IsActive = option.IsActive
        };

        return Result<ProductAttributeOptionDto>.Success(dto);
    }
}
