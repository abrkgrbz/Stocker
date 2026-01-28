using FluentValidation;
using MediatR;
using Stocker.Application.Common.Validators;
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
/// Validator for CreateSupplierCommand - Türkçe doğrulama kuralları
/// </summary>
public class CreateSupplierCommandValidator : AbstractValidator<CreateSupplierCommand>
{
    public CreateSupplierCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmptyGuid();

        RuleFor(x => x.SupplierData)
            .NotNull().WithMessage("Tedarikçi bilgileri zorunludur.");

        When(x => x.SupplierData != null, () =>
        {
            RuleFor(x => x.SupplierData.Code)
                .NotEmpty().WithMessage("Tedarikçi kodu zorunludur.")
                .ValidCode(2, 50);

            RuleFor(x => x.SupplierData.Name)
                .NotEmpty().WithMessage("Tedarikçi adı zorunludur.")
                .MaximumLength(200).WithMessage("Tedarikçi adı en fazla 200 karakter olabilir.");

            // Vergi numarası doğrulaması (Türkiye formatı - 10 haneli)
            RuleFor(x => x.SupplierData.TaxNumber)
                .TurkishTaxNumber()
                .When(x => !string.IsNullOrEmpty(x.SupplierData.TaxNumber));

            RuleFor(x => x.SupplierData.Email)
                .EmailAddress().WithMessage("Geçersiz e-posta formatı.")
                .MaximumLength(256).WithMessage("E-posta adresi en fazla 256 karakter olabilir.")
                .When(x => !string.IsNullOrEmpty(x.SupplierData.Email));

            // Telefon numarası doğrulaması (Türkiye formatı)
            RuleFor(x => x.SupplierData.Phone)
                .TurkishPhoneNumber()
                .When(x => !string.IsNullOrEmpty(x.SupplierData.Phone));

            // Kredi limiti doğrulaması
            RuleFor(x => x.SupplierData.CreditLimit)
                .ValidMoney();

            // Ödeme vadesi doğrulaması
            RuleFor(x => x.SupplierData.PaymentTermDays)
                .InclusiveBetween(0, 365).WithMessage("Ödeme vadesi 0 ile 365 gün arasında olmalıdır.")
                .When(x => x.SupplierData.PaymentTermDays.HasValue);
        });
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
        supplier.RaiseCreatedEvent();
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
