using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Queries;

/// <summary>
/// Query to get a product attribute by ID
/// </summary>
public class GetProductAttributeByIdQuery : IRequest<Result<ProductAttributeDto>>
{
    public Guid TenantId { get; set; }
    public int AttributeId { get; set; }
}

/// <summary>
/// Handler for GetProductAttributeByIdQuery
/// </summary>
public class GetProductAttributeByIdQueryHandler : IRequestHandler<GetProductAttributeByIdQuery, Result<ProductAttributeDto>>
{
    private readonly IProductAttributeRepository _repository;

    public GetProductAttributeByIdQueryHandler(IProductAttributeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<ProductAttributeDto>> Handle(GetProductAttributeByIdQuery request, CancellationToken cancellationToken)
    {
        var attribute = await _repository.GetWithOptionsAsync(request.AttributeId, cancellationToken);

        if (attribute == null)
        {
            return Result<ProductAttributeDto>.Failure(
                new Error("ProductAttribute.NotFound", $"Product attribute with ID {request.AttributeId} not found", ErrorType.NotFound));
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
