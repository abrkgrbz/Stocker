using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Brands.Commands;

/// <summary>
/// Command to delete a brand
/// </summary>
public class DeleteBrandCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public int BrandId { get; set; }
}

/// <summary>
/// Validator for DeleteBrandCommand
/// </summary>
public class DeleteBrandCommandValidator : AbstractValidator<DeleteBrandCommand>
{
    public DeleteBrandCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.BrandId).NotEmpty();
    }
}

/// <summary>
/// Handler for DeleteBrandCommand
/// </summary>
public class DeleteBrandCommandHandler : IRequestHandler<DeleteBrandCommand, Result<bool>>
{
    private readonly IBrandRepository _brandRepository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteBrandCommandHandler(IBrandRepository brandRepository, IUnitOfWork unitOfWork)
    {
        _brandRepository = brandRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<bool>> Handle(DeleteBrandCommand request, CancellationToken cancellationToken)
    {
        var brand = await _brandRepository.GetWithProductsAsync(request.BrandId, cancellationToken);

        if (brand == null)
        {
            return Result<bool>.Failure(new Error("Brand.NotFound", $"Brand with ID {request.BrandId} not found", ErrorType.NotFound));
        }

        // Check if brand has products
        if (brand.Products != null && brand.Products.Count > 0)
        {
            return Result<bool>.Failure(new Error("Brand.HasProducts", "Cannot delete brand with associated products", ErrorType.Validation));
        }

        // Soft delete
        brand.Delete("system");
        await _brandRepository.UpdateAsync(brand, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
