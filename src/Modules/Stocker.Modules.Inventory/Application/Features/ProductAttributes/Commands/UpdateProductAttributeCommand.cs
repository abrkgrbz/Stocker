using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to update a product attribute
/// </summary>
public class UpdateProductAttributeCommand : IRequest<Result<ProductAttributeDto>>
{
    public Guid TenantId { get; set; }
    public int AttributeId { get; set; }
    public UpdateProductAttributeDto AttributeData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateProductAttributeCommand
/// </summary>
public class UpdateProductAttributeCommandValidator : AbstractValidator<UpdateProductAttributeCommand>
{
    public UpdateProductAttributeCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.AttributeId).NotEmpty();
        RuleFor(x => x.AttributeData).NotNull();
        RuleFor(x => x.AttributeData.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.AttributeData.Description).MaximumLength(500);
        RuleFor(x => x.AttributeData.DefaultValue).MaximumLength(500);
        RuleFor(x => x.AttributeData.ValidationPattern).MaximumLength(500);
    }
}

/// <summary>
/// Handler for UpdateProductAttributeCommand
/// </summary>
public class UpdateProductAttributeCommandHandler : IRequestHandler<UpdateProductAttributeCommand, Result<ProductAttributeDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateProductAttributeCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductAttributeDto>> Handle(UpdateProductAttributeCommand request, CancellationToken cancellationToken)
    {
        var attribute = await _unitOfWork.ProductAttributes.GetWithOptionsAsync(request.AttributeId, cancellationToken);

        if (attribute == null)
        {
            return Result<ProductAttributeDto>.Failure(
                new Error("ProductAttribute.NotFound", $"Product attribute with ID {request.AttributeId} not found", ErrorType.NotFound));
        }

        var data = request.AttributeData;

        attribute.UpdateAttribute(data.Name, data.Description);
        attribute.SetDisplaySettings(data.ShowInList, data.DisplayOrder);
        attribute.SetSearchSettings(data.IsFilterable, data.IsSearchable);
        attribute.SetRequired(data.IsRequired);
        attribute.SetDefaultValue(data.DefaultValue);
        attribute.SetValidationPattern(data.ValidationPattern);

        _unitOfWork.ProductAttributes.Update(attribute);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

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
            UpdatedAt = attribute.UpdatedDate,
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
            ValueCount = attribute.Values?.Count ?? 0
        };

        return Result<ProductAttributeDto>.Success(dto);
    }
}
