using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to update a product attribute option
/// </summary>
public class UpdateProductAttributeOptionCommand : IRequest<Result<ProductAttributeOptionDto>>
{
    public int TenantId { get; set; }
    public int AttributeId { get; set; }
    public int OptionId { get; set; }
    public UpdateProductAttributeOptionDto OptionData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateProductAttributeOptionCommand
/// </summary>
public class UpdateProductAttributeOptionCommandValidator : AbstractValidator<UpdateProductAttributeOptionCommand>
{
    public UpdateProductAttributeOptionCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.AttributeId).GreaterThan(0);
        RuleFor(x => x.OptionId).GreaterThan(0);
        RuleFor(x => x.OptionData).NotNull();
        RuleFor(x => x.OptionData.Value).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OptionData.Label).NotEmpty().MaximumLength(200);
        RuleFor(x => x.OptionData.ColorCode).MaximumLength(20);
        RuleFor(x => x.OptionData.ImageUrl).MaximumLength(500);
    }
}

/// <summary>
/// Handler for UpdateProductAttributeOptionCommand
/// </summary>
public class UpdateProductAttributeOptionCommandHandler : IRequestHandler<UpdateProductAttributeOptionCommand, Result<ProductAttributeOptionDto>>
{
    private readonly IProductAttributeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateProductAttributeOptionCommandHandler(IProductAttributeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ProductAttributeOptionDto>> Handle(UpdateProductAttributeOptionCommand request, CancellationToken cancellationToken)
    {
        var option = await _repository.GetOptionByIdAsync(request.OptionId, cancellationToken);

        if (option == null || option.ProductAttributeId != request.AttributeId)
        {
            return Result<ProductAttributeOptionDto>.Failure(
                new Error("ProductAttributeOption.NotFound", $"Option with ID {request.OptionId} not found for attribute {request.AttributeId}", ErrorType.NotFound));
        }

        var data = request.OptionData;

        option.UpdateOption(data.Value, data.Label);
        option.SetColorCode(data.ColorCode);
        option.SetImageUrl(data.ImageUrl);
        option.SetDisplayOrder(data.DisplayOrder);

        _repository.UpdateOption(option);
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
