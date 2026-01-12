using FluentValidation;
using MediatR;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Modules.Inventory.Application.DTOs;
using Stocker.Modules.Inventory.Domain.Entities;
using Stocker.Modules.Inventory.Interfaces;
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
        RuleFor(x => x.TenantId).NotEmpty().WithMessage("Kiracı kimliği gereklidir");
        RuleFor(x => x.SupplierData).NotNull().WithMessage("Tedarikçi bilgileri gereklidir");
        RuleFor(x => x.SupplierData.Code).NotEmpty().WithMessage("Tedarikçi kodu gereklidir").MaximumLength(50).WithMessage("Tedarikçi kodu en fazla 50 karakter olabilir");
        RuleFor(x => x.SupplierData.Name).NotEmpty().WithMessage("Tedarikçi adı gereklidir").MaximumLength(200).WithMessage("Tedarikçi adı en fazla 200 karakter olabilir");
        RuleFor(x => x.SupplierData.TaxNumber).MaximumLength(50).WithMessage("Vergi numarası en fazla 50 karakter olabilir");
        RuleFor(x => x.SupplierData.Email).EmailAddress().WithMessage("Geçerli bir e-posta adresi giriniz").When(x => !string.IsNullOrEmpty(x.SupplierData.Email));
    }
}

/// <summary>
/// Handler for CreateSupplierCommand
/// </summary>
public class CreateSupplierCommandHandler : IRequestHandler<CreateSupplierCommand, Result<SupplierDto>>
{
    private readonly IInventoryUnitOfWork _unitOfWork;

    public CreateSupplierCommandHandler(IInventoryUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SupplierDto>> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        var data = request.SupplierData;

        // Check if supplier with same code exists
        var existingSupplier = await _unitOfWork.Suppliers.GetByCodeAsync(data.Code, cancellationToken);
        if (existingSupplier != null)
        {
            return Result<SupplierDto>.Failure(new Error("Supplier.DuplicateCode", $"'{data.Code}' kodlu tedarikçi zaten mevcut", ErrorType.Conflict));
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

        supplier.SetTenantId(request.TenantId);
        supplier.UpdateSupplierInfo(data.Name, data.TaxNumber, data.TaxOffice, email, phone, address);
        supplier.SetContactInfo(data.ContactPerson, data.ContactPhone, data.ContactEmail);
        supplier.SetCreditInfo(data.CreditLimit, data.PaymentTermDays ?? 30);

        await _unitOfWork.Suppliers.AddAsync(supplier, cancellationToken);
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
