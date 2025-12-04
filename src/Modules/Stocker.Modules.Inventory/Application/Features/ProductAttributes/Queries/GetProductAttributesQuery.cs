using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Queries;

/// <summary>
/// Query to get all product attributes
/// </summary>
public class GetProductAttributesQuery : IRequest<Result<List<ProductAttributeDto>>>
{
    public Guid TenantId { get; set; }
    public bool IncludeInactive { get; set; }
    public bool FilterableOnly { get; set; }
}

/// <summary>
/// Handler for GetProductAttributesQuery
/// </summary>
public class GetProductAttributesQueryHandler : IRequestHandler<GetProductAttributesQuery, Result<List<ProductAttributeDto>>>
{
    private readonly IProductAttributeRepository _repository;

    public GetProductAttributesQueryHandler(IProductAttributeRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<ProductAttributeDto>>> Handle(GetProductAttributesQuery request, CancellationToken cancellationToken)
    {
        var attributes = request.FilterableOnly
            ? await _repository.GetFilterableAttributesAsync(cancellationToken)
            : request.IncludeInactive
                ? await _repository.GetAllAsync(cancellationToken)
                : await _repository.GetActiveAttributesAsync(cancellationToken);

        var dtos = attributes.Select(a => new ProductAttributeDto
        {
            Id = a.Id,
            Code = a.Code,
            Name = a.Name,
            Description = a.Description,
            AttributeType = a.AttributeType,
            IsRequired = a.IsRequired,
            IsFilterable = a.IsFilterable,
            IsSearchable = a.IsSearchable,
            ShowInList = a.ShowInList,
            DisplayOrder = a.DisplayOrder,
            DefaultValue = a.DefaultValue,
            ValidationPattern = a.ValidationPattern,
            IsActive = a.IsActive,
            CreatedAt = a.CreatedDate,
            UpdatedAt = a.UpdatedDate,
            Options = a.Options?.Select(o => new ProductAttributeOptionDto
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
            ValueCount = a.Values?.Count ?? 0
        }).ToList();

        return Result<List<ProductAttributeDto>>.Success(dtos);
    }
}
