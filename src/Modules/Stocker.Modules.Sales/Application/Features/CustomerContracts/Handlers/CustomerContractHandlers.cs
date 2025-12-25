using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.CustomerContracts.Commands;
using Stocker.Modules.Sales.Application.Features.CustomerContracts.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;
using Stocker.Domain.Common.ValueObjects;

namespace Stocker.Modules.Sales.Application.Features.CustomerContracts.Handlers;

#region Query Handlers

public class GetCustomerContractsHandler : IRequestHandler<GetCustomerContractsQuery, Result<PagedResult<CustomerContractListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetCustomerContractsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<CustomerContractListDto>>> Handle(GetCustomerContractsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<CustomerContract>().AsQueryable()
            .Where(c => c.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(c =>
                c.ContractNumber.ToLower().Contains(searchTerm) ||
                c.Title.ToLower().Contains(searchTerm) ||
                c.CustomerName.ToLower().Contains(searchTerm));
        }

        if (request.Status.HasValue)
            query = query.Where(c => c.Status == request.Status.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(c => c.CustomerId == request.CustomerId.Value);

        if (request.ContractType.HasValue)
            query = query.Where(c => c.ContractType == request.ContractType.Value);

        if (request.FromDate.HasValue)
            query = query.Where(c => c.StartDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(c => c.EndDate <= request.ToDate.Value);

        if (request.ExpiringOnly == true && request.ExpiringWithinDays.HasValue)
        {
            var expirationThreshold = DateTime.UtcNow.AddDays(request.ExpiringWithinDays.Value);
            query = query.Where(c => c.EndDate <= expirationThreshold && c.Status == ContractStatus.Active);
        }

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "contractnumber" => request.SortDescending ? query.OrderByDescending(c => c.ContractNumber) : query.OrderBy(c => c.ContractNumber),
            "customername" => request.SortDescending ? query.OrderByDescending(c => c.CustomerName) : query.OrderBy(c => c.CustomerName),
            "startdate" => request.SortDescending ? query.OrderByDescending(c => c.StartDate) : query.OrderBy(c => c.StartDate),
            "status" => request.SortDescending ? query.OrderByDescending(c => c.Status) : query.OrderBy(c => c.Status),
            _ => request.SortDescending ? query.OrderByDescending(c => c.EndDate) : query.OrderBy(c => c.EndDate)
        };

        var contracts = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var items = contracts.Select(CustomerContractListDto.FromEntity).ToList();

        return Result<PagedResult<CustomerContractListDto>>.Success(
            new PagedResult<CustomerContractListDto>(items, request.Page, request.PageSize, totalCount));
    }
}

public class GetCustomerContractByIdHandler : IRequestHandler<GetCustomerContractByIdQuery, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetCustomerContractByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(GetCustomerContractByIdQuery request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class GetCustomerContractByNumberHandler : IRequestHandler<GetCustomerContractByNumberQuery, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetCustomerContractByNumberHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(GetCustomerContractByNumberQuery request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByContractNumberAsync(request.ContractNumber, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class GetActiveContractByCustomerHandler : IRequestHandler<GetActiveContractByCustomerQuery, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetActiveContractByCustomerHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(GetActiveContractByCustomerQuery request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetActiveContractByCustomerIdAsync(request.CustomerId, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Aktif sözleşme bulunamadı."));

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class GetExpiringContractsHandler : IRequestHandler<GetExpiringContractsQuery, Result<IReadOnlyList<CustomerContractListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetExpiringContractsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<CustomerContractListDto>>> Handle(GetExpiringContractsQuery request, CancellationToken cancellationToken)
    {
        var contracts = await _unitOfWork.CustomerContracts.GetExpiringContractsAsync(request.DaysUntilExpiration, cancellationToken);
        var items = contracts.Select(CustomerContractListDto.FromEntity).ToList();

        return Result<IReadOnlyList<CustomerContractListDto>>.Success(items);
    }
}

public class GetContractsRequiringRenewalHandler : IRequestHandler<GetContractsRequiringRenewalQuery, Result<IReadOnlyList<CustomerContractListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetContractsRequiringRenewalHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<CustomerContractListDto>>> Handle(GetContractsRequiringRenewalQuery request, CancellationToken cancellationToken)
    {
        var contracts = await _unitOfWork.CustomerContracts.GetContractsRequiringRenewalNotificationAsync(cancellationToken);
        var items = contracts.Select(CustomerContractListDto.FromEntity).ToList();

        return Result<IReadOnlyList<CustomerContractListDto>>.Success(items);
    }
}

public class ValidateContractForOrderHandler : IRequestHandler<ValidateContractForOrderQuery, Result<ContractValidationResult>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ValidateContractForOrderHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<ContractValidationResult>> Handle(ValidateContractForOrderQuery request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.ContractId, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<ContractValidationResult>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.ValidateForNewOrder(request.OrderAmount, request.CurrentOutstandingBalance, request.AllowGracePeriod);

        return Result<ContractValidationResult>.Success(new ContractValidationResult
        {
            IsValid = result.IsSuccess,
            ErrorMessage = result.IsSuccess ? null : result.Error.Description,
            AvailableCredit = contract.AvailableCredit,
            CreditLimit = contract.CreditLimit?.Amount,
            DaysUntilExpiration = contract.DaysUntilExpiration(),
            IsInGracePeriod = contract.IsInGracePeriod()
        });
    }
}

#endregion

#region Command Handlers

public class CreateCustomerContractHandler : IRequestHandler<CreateCustomerContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public CreateCustomerContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(CreateCustomerContractCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var contractNumber = await _unitOfWork.CustomerContracts.GenerateContractNumberAsync(cancellationToken);

        var contractResult = CustomerContract.Create(
            tenantId,
            contractNumber,
            request.Title,
            request.ContractType,
            request.CustomerId,
            request.CustomerName,
            request.StartDate,
            request.EndDate,
            request.SignedDate,
            request.DefaultPaymentDueDays,
            request.Description);

        if (!contractResult.IsSuccess)
            return Result<CustomerContractDto>.Failure(contractResult.Error);

        var contract = contractResult.Value!;

        if (request.GeneralDiscountPercentage.HasValue)
            contract.UpdateGeneralDiscount(request.GeneralDiscountPercentage.Value);

        if (request.CreditLimitAmount.HasValue)
            contract.UpdateCreditLimit(Money.Create(request.CreditLimitAmount.Value, request.CreditLimitCurrency));

        if (request.SalesRepresentativeId.HasValue && !string.IsNullOrWhiteSpace(request.SalesRepresentativeName))
            contract.AssignSalesRepresentative(request.SalesRepresentativeId.Value, request.SalesRepresentativeName);

        if (request.AutoRenewal)
            contract.SetAutoRenewal(true, request.RenewalPeriodMonths, request.RenewalNoticeBeforeDays);

        if (!string.IsNullOrWhiteSpace(request.CustomerSignatory))
            contract.SetSignatories(
                request.CustomerSignatory,
                request.CustomerSignatoryTitle ?? string.Empty,
                request.CompanySignatory ?? string.Empty,
                request.CompanySignatoryTitle ?? string.Empty);

        if (request.ServiceLevel != ServiceLevelAgreement.None)
            contract.ConfigureSLA(
                request.ServiceLevel,
                request.ResponseTimeHours,
                request.ResolutionTimeHours,
                request.SupportHours,
                request.SupportPriority);

        await _unitOfWork.Repository<CustomerContract>().AddAsync(contract, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class UpdateCustomerContractHandler : IRequestHandler<UpdateCustomerContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdateCustomerContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(UpdateCustomerContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        // Note: Title and Description are set at creation in the entity
        // Only certain properties can be updated after creation

        if (request.GeneralDiscountPercentage.HasValue)
            contract.UpdateGeneralDiscount(request.GeneralDiscountPercentage.Value);

        if (request.SalesRepresentativeId.HasValue && !string.IsNullOrWhiteSpace(request.SalesRepresentativeName))
            contract.AssignSalesRepresentative(request.SalesRepresentativeId.Value, request.SalesRepresentativeName);

        contract.SetAutoRenewal(request.AutoRenewal, request.RenewalPeriodMonths, request.RenewalNoticeBeforeDays);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class ActivateContractHandler : IRequestHandler<ActivateContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ActivateContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(ActivateContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.Activate();
        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class SuspendContractHandler : IRequestHandler<SuspendContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public SuspendContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(SuspendContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.Suspend(request.Reason);
        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class TerminateContractHandler : IRequestHandler<TerminateContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public TerminateContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(TerminateContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.Terminate(request.TerminationType, request.Reason);
        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class RenewContractHandler : IRequestHandler<RenewContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public RenewContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(RenewContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.Renew(request.ExtensionMonths);
        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class UpdateCreditLimitHandler : IRequestHandler<UpdateCreditLimitCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UpdateCreditLimitHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(UpdateCreditLimitCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.ReviewCreditLimit(Money.Create(request.Amount, request.Currency), request.Notes);
        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class BlockContractHandler : IRequestHandler<BlockContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public BlockContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(BlockContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.Block(request.Reason);
        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class UnblockContractHandler : IRequestHandler<UnblockContractCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public UnblockContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(UnblockContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.Unblock(request.Notes);
        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class ConfigureSLAHandler : IRequestHandler<ConfigureSLACommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public ConfigureSLAHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(ConfigureSLACommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.ConfigureSLA(
            request.ServiceLevel,
            request.ResponseTimeHours,
            request.ResolutionTimeHours,
            request.SupportHours,
            request.SupportPriority);

        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class AddPriceAgreementHandler : IRequestHandler<AddPriceAgreementCommand, Result<CustomerContractDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public AddPriceAgreementHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerContractDto>> Handle(AddPriceAgreementCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.ContractId, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result<CustomerContractDto>.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        var result = contract.AddPriceAgreement(
            request.ProductId,
            request.ProductCode,
            request.ProductName,
            Money.Create(request.SpecialPrice, request.Currency),
            request.DiscountPercentage,
            request.MinimumQuantity);

        if (!result.IsSuccess)
            return Result<CustomerContractDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<CustomerContractDto>.Success(CustomerContractDto.FromEntity(contract));
    }
}

public class DeleteCustomerContractHandler : IRequestHandler<DeleteCustomerContractCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeleteCustomerContractHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteCustomerContractCommand request, CancellationToken cancellationToken)
    {
        var contract = await _unitOfWork.CustomerContracts.GetByIdAsync(request.Id, cancellationToken);

        if (contract == null || contract.TenantId != _unitOfWork.TenantId)
            return Result.Failure(Error.NotFound("CustomerContract", "Sözleşme bulunamadı."));

        if (contract.Status == ContractStatus.Active)
            return Result.Failure(Error.Conflict("CustomerContract", "Aktif sözleşme silinemez."));

        _unitOfWork.Repository<CustomerContract>().Remove(contract);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

#endregion
