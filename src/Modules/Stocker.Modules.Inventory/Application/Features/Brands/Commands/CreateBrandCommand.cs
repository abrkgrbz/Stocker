using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Commands;

/// <summary>
/// Command to create a new brand
/// </summary>
public class CreateBrandCommand : IRequest<Result<BrandDto>>
{
    public Guid TenantId { get; set; }
    public CreateBrandDto BrandData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateBrandCommand
/// </summary>
public class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BrandData).NotNull();
        RuleFor(x => x.BrandData.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.BrandData.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BrandData.Description).MaximumLength(1000);
        RuleFor(x => x.BrandData.LogoUrl).MaximumLength(500);
        RuleFor(x => x.BrandData.Website).MaximumLength(500);
    }
}

/// <summary>
/// Handler for CreateBrandCommand
/// Uses IInventoryUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// </summary>
public class CreateBrandCommandHandler : IRequestHandler<CreateBrandCommand, Result<BrandDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateBrandCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BrandDto>> Handle(CreateBrandCommand request, CancellationToken cancellationToken)
    {
        var data = request.BrandData;

        // Check if brand with same code already exists
        var existingBrand = await _unitOfWork.Brands.GetByCodeAsync(data.Code, cancellationToken);
        if (existingBrand != null)
        {
            return Result<BrandDto>.Failure(new Error("Brand.DuplicateCode", $"Brand with code '{data.Code}' already exists", ErrorType.Conflict));
        }

        var brand = new Brand(data.Code, data.Name);
        brand.UpdateBrand(data.Name, data.Description, data.Website);

        if (!string.IsNullOrEmpty(data.LogoUrl))
        {
            brand.SetLogo(data.LogoUrl);
        }

        // Set tenant ID for multi-tenancy
        brand.SetTenantId(request.TenantId);

        await _unitOfWork.Brands.AddAsync(brand, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new BrandDto
        {
            Id = brand.Id,
            Code = brand.Code,
            Name = brand.Name,
            Description = brand.Description,
            LogoUrl = brand.LogoUrl,
            Website = brand.Website,
            IsActive = brand.IsActive,
            CreatedAt = brand.CreatedDate,
            ProductCount = 0
        };

        return Result<BrandDto>.Success(dto);
    }
}
