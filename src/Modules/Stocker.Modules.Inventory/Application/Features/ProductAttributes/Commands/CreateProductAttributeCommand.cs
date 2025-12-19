using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Enums;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to create a new product attribute
/// </summary>
public class CreateProductAttributeCommand : IRequest<Result<ProductAttributeDto>>
{
    public Guid TenantId { get; set; }
    public CreateProductAttributeDto AttributeData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateProductAttributeCommand
/// </summary>
public class CreateProductAttributeCommandValidator : AbstractValidator<CreateProductAttributeCommand>
{
    public CreateProductAttributeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.AttributeData).NotNull();
        RuleFor(x => x.AttributeData.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.AttributeData.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AttributeData.Description).MaximumLength(500);
        RuleFor(x => x.AttributeData.DefaultValue).MaximumLength(500);
        RuleFor(x => x.AttributeData.ValidationPattern).MaximumLength(500);
        RuleFor(x => x.AttributeData.AttributeType).IsInEnum();
    }
}

/// <summary>
/// Handler for CreateProductAttributeCommand
/// </summary>
public class CreateProductAttributeCommandHandler : IRequestHandler<CreateProductAttributeCommand, Result<ProductAttributeDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateProductAttributeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductAttributeDto>> Handle(CreateProductAttributeCommand request, CancellationToken cancellationToken)
    {
        var data = request.AttributeData;

        // Check if attribute with same code already exists
        var existingAttribute = await _unitOfWork.ProductAttributes.GetByCodeAsync(data.Code, cancellationToken);
        if (existingAttribute != null)
        {
            return Result<ProductAttributeDto>.Failure(
                new Error("ProductAttribute.DuplicateCode", $"Product attribute with code '{data.Code}' already exists", ErrorType.Conflict));
        }

        // Create the attribute
        var attribute = new ProductAttribute(data.Code, data.Name, data.AttributeType);
        attribute.UpdateAttribute(data.Name, data.Description);
        attribute.SetDisplaySettings(data.ShowInList, data.DisplayOrder);
        attribute.SetSearchSettings(data.IsFilterable, data.IsSearchable);
        attribute.SetRequired(data.IsRequired);
        attribute.SetDefaultValue(data.DefaultValue);
        attribute.SetValidationPattern(data.ValidationPattern);

        attribute.SetTenantId(request.TenantId);
        await _unitOfWork.ProductAttributes.AddAsync(attribute, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // Add options if provided (for Select/MultiSelect types)
        if (data.Options != null && data.Options.Any() &&
            (data.AttributeType == AttributeType.Select || data.AttributeType == AttributeType.MultiSelect))
        {
            foreach (var optionData in data.Options.OrderBy(o => o.DisplayOrder))
            {
                var option = attribute.AddOption(optionData.Value, optionData.Label);
                option.SetColorCode(optionData.ColorCode);
                option.SetImageUrl(optionData.ImageUrl);
                option.SetDisplayOrder(optionData.DisplayOrder);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var dto = new ProductAttributeDto
        {
            Id = attribute.Id,
            Code = attribute.Code,
            Name = attribute.Name,
            Description = attribute.Description,
            AttributeType = attribute.AttributeType,
            IsRequired = attribute.IsRequired,
            IsFilterable = attribute.IsFilterable,
            IsSearchable = attribute.IsSearchable,
            ShowInList = attribute.ShowInList,
            DisplayOrder = attribute.DisplayOrder,
            DefaultValue = attribute.DefaultValue,
            ValidationPattern = attribute.ValidationPattern,
            IsActive = attribute.IsActive,
            CreatedAt = attribute.CreatedDate,
            Options = attribute.Options?.Select(o => new ProductAttributeOptionDto
            {
                Id = o.Id,
                ProductAttributeId = o.ProductAttributeId,
                Value = o.Value,
                Label = o.Label,
                ColorCode = o.ColorCode,
                ImageUrl = o.ImageUrl,
                DisplayOrder = o.DisplayOrder,
                IsActive = o.IsActive
            }).ToList() ?? new List<ProductAttributeOptionDto>(),
            ValueCount = 0
        };

        return Result<ProductAttributeDto>.Success(dto);
    }
}
