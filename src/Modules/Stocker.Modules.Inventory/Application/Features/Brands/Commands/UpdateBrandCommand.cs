using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Commands;

/// <summary>
/// Command to update an existing brand
/// </summary>
public class UpdateBrandCommand : IRequest<Result<BrandDto>>
{
    public Guid TenantId { get; set; }
    public int BrandId { get; set; }
    public UpdateBrandDto BrandData { get; set; } = null!;
}

/// <summary>
/// Validator for UpdateBrandCommand
/// </summary>
public class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.BrandId).NotEmpty().WithMessage("Marka kimliği gereklidir");
        RuleFor(x => x.BrandData).NotNull().WithMessage("Marka bilgileri gereklidir");
        RuleFor(x => x.BrandData.Name).NotEmpty().WithMessage("Marka adı gereklidir").MaximumLength(200).WithMessage("Marka adı en fazla 200 karakter olabilir");
        RuleFor(x => x.BrandData.Description).MaximumLength(1000).WithMessage("Açıklama en fazla 1000 karakter olabilir");
        RuleFor(x => x.BrandData.LogoUrl).MaximumLength(500).WithMessage("Logo URL en fazla 500 karakter olabilir");
        RuleFor(x => x.BrandData.Website).MaximumLength(500).WithMessage("Website URL en fazla 500 karakter olabilir");
    }
}

/// <summary>
/// Handler for UpdateBrandCommand
/// Uses IInventoryUnitOfWork to ensure repository and SaveChanges use the same DbContext instance
/// </summary>
public class UpdateBrandCommandHandler : IRequestHandler<UpdateBrandCommand, Result<BrandDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public UpdateBrandCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<BrandDto>> Handle(UpdateBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _unitOfWork.Brands.GetByIdAsync(request.BrandId, cancellationToken);

        if (brand == null)
        {
            return Result<BrandDto>.Failure(new Error("Brand.NotFound", $"Marka bulunamadı (ID: {request.BrandId})", ErrorType.NotFound));
        }

        var data = request.BrandData;
        brand.UpdateBrand(data.Name, data.Description, data.Website);

        if (!string.IsNullOrEmpty(data.LogoUrl))
        {
            brand.SetLogo(data.LogoUrl);
        }

        await _unitOfWork.Brands.UpdateAsync(brand, cancellationToken);
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
            UpdatedAt = brand.UpdatedDate,
            ProductCount = brand.Products?.Count ?? 0
        };

        return Result<BrandDto>.Success(dto);
    }
}
