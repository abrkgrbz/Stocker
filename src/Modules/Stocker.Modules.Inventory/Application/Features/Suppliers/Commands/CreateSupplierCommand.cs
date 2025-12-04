using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Inventory.Application.Features.Suppliers.Commands;

/// <summary>
/// Command to create a new supplier
/// </summary>
public class CreateSupplierCommand : IRequest<Result<SupplierDto>>
{
    public Guid TenantId { get; set; }
    public CreateSupplierDto SupplierData { get; set; } = null!;
}

/// <summary>
/// Validator for CreateSupplierCommand
/// </summary>
public class CreateSupplierCommandValidator : AbstractValidator<CreateSupplierCommand>
{
    public CreateSupplierCommandValidator()
    {
        RuleFor(x => x.TenantId).NotEmpty();
        RuleFor(x => x.SupplierData).NotNull();
        RuleFor(x => x.SupplierData.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.SupplierData.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.SupplierData.TaxNumber).MaximumLength(50);
        RuleFor(x => x.SupplierData.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.SupplierData.Email));
    }
}

/// <summary>
/// Handler for CreateSupplierCommand
/// </summary>
public class CreateSupplierCommandHandler : IRequestHandler<CreateSupplierCommand, Result<SupplierDto>>
{
    private readonly ISupplierRepository _supplierRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSupplierCommandHandler(ISupplierRepository supplierRepository, IUnitOfWork unitOfWork)
    {
        _supplierRepository = supplierRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SupplierDto>> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        var data = request.SupplierData;

        // Check if supplier with same code exists
        var existingSupplier = await _supplierRepository.GetByCodeAsync(data.Code, cancellationToken);
        if (existingSupplier != null)
        {
            return Result<SupplierDto>.Failure(new Error("Supplier.DuplicateCode", $"Supplier with code '{data.Code}' already exists", ErrorType.Conflict));
        }

        var supplier = new Supplier(data.Code, data.Name);

        // Create value objects
        Email? email = null;
        if (!string.IsNullOrEmpty(data.Email))
        {
            var emailResult = Email.Create(data.Email);
            if (emailResult.IsSuccess)
                email = emailResult.Value;
        }

        PhoneNumber? phone = null;
        if (!string.IsNullOrEmpty(data.Phone))
        {
            var phoneResult = PhoneNumber.Create(data.Phone);
            if (phoneResult.IsSuccess)
                phone = phoneResult.Value;
        }

        Address? address = null;
        if (!string.IsNullOrEmpty(data.Street) && !string.IsNullOrEmpty(data.City) && !string.IsNullOrEmpty(data.Country))
        {
            address = Address.Create(data.Street, data.City, data.Country, data.PostalCode, state: data.State);
        }

        supplier.UpdateSupplierInfo(data.Name, data.TaxNumber, data.TaxOffice, email, phone, address);
        supplier.SetContactInfo(data.ContactPerson, data.ContactPhone, data.ContactEmail);
        supplier.SetCreditInfo(data.CreditLimit, data.PaymentTermDays ?? 30);

        await _supplierRepository.AddAsync(supplier, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new SupplierDto
        {
            Id = supplier.Id,
            Code = supplier.Code,
            Name = supplier.Name,
            TaxNumber = supplier.TaxNumber,
            TaxOffice = supplier.TaxOffice,
            Email = supplier.Email?.Value,
            Phone = supplier.Phone?.Value,
            Street = supplier.Address?.Street,
            City = supplier.Address?.City,
            State = supplier.Address?.State,
            Country = supplier.Address?.Country,
            PostalCode = supplier.Address?.PostalCode,
            ContactPerson = supplier.ContactPerson,
            ContactPhone = supplier.ContactPhone,
            ContactEmail = supplier.ContactEmail,
            PaymentTermDays = supplier.PaymentTerm,
            CreditLimit = supplier.CreditLimit,
            IsActive = supplier.IsActive,
            CreatedAt = supplier.CreatedDate,
            ProductCount = 0
        };

        return Result<SupplierDto>.Success(dto);
    }
}
