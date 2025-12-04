using FluentValidation;
using MediatR;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.ProductAttributes.Commands;

/// <summary>
/// Command to delete a product attribute option
/// </summary>
public class DeleteProductAttributeOptionCommand : IRequest<Result>
{
    public int TenantId { get; set; }
    public int AttributeId { get; set; }
    public int OptionId { get; set; }
}

/// <summary>
/// Validator for DeleteProductAttributeOptionCommand
/// </summary>
public class DeleteProductAttributeOptionCommandValidator : AbstractValidator<DeleteProductAttributeOptionCommand>
{
    public DeleteProductAttributeOptionCommandValidator()
    {
        RuleFor(x => x.TenantId).GreaterThan(0);
        RuleFor(x => x.AttributeId).GreaterThan(0);
        RuleFor(x => x.OptionId).GreaterThan(0);
    }
}

/// <summary>
/// Handler for DeleteProductAttributeOptionCommand
/// </summary>
public class DeleteProductAttributeOptionCommandHandler : IRequestHandler<DeleteProductAttributeOptionCommand, Result>
{
    private readonly IProductAttributeRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public DeleteProductAttributeOptionCommandHandler(IProductAttributeRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteProductAttributeOptionCommand request, CancellationToken cancellationToken)
    {
        var option = await _repository.GetOptionByIdAsync(request.OptionId, cancellationToken);

        if (option == null || option.ProductAttributeId != request.AttributeId)
        {
            return Result.Failure(
                new Error("ProductAttributeOption.NotFound", $"Option with ID {request.OptionId} not found for attribute {request.AttributeId}", ErrorType.NotFound));
        }

        _repository.RemoveOption(option);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
