using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.Quotations.Commands;
using Stocker.Modules.Sales.Application.Features.Quotations.Queries;
using Stocker.Modules.Sales.Domain.Entities;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Pagination;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.Quotations.Handlers;

/// <summary>
/// Handler for CreateQuotationCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class CreateQuotationHandler : IRequestHandler<CreateQuotationCommand, Result<QuotationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CreateQuotationHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<QuotationDto>> Handle(CreateQuotationCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotationNumber = Quotation.GenerateQuotationNumber();
        var quotationDate = request.Dto.QuotationDate ?? DateTime.UtcNow;

        var quotationResult = Quotation.Create(
            tenantId,
            quotationNumber,
            quotationDate,
            request.Dto.CustomerId,
            request.Dto.CustomerName,
            request.Dto.CustomerEmail,
            request.Dto.ValidityDays,
            request.Dto.Currency
        );

        if (!quotationResult.IsSuccess)
            return Result<QuotationDto>.Failure(quotationResult.Error);

        var quotation = quotationResult.Value;

        quotation.SetName(request.Dto.Name);
        quotation.UpdateCustomer(
            request.Dto.CustomerId,
            request.Dto.CustomerName,
            request.Dto.CustomerEmail,
            request.Dto.CustomerPhone,
            request.Dto.CustomerTaxNumber
        );
        quotation.SetContact(request.Dto.ContactId, request.Dto.ContactName);
        quotation.SetSalesPerson(request.Dto.SalesPersonId, request.Dto.SalesPersonName);
        quotation.SetOpportunity(request.Dto.OpportunityId);
        quotation.SetAddresses(request.Dto.ShippingAddress, request.Dto.BillingAddress);
        quotation.SetTerms(request.Dto.PaymentTerms, request.Dto.DeliveryTerms, request.Dto.TermsAndConditions);
        quotation.SetNotes(request.Dto.Notes, null);

        foreach (var itemDto in request.Dto.Items)
        {
            var itemResult = QuotationItem.Create(
                tenantId,
                itemDto.ProductId,
                itemDto.ProductName,
                itemDto.ProductCode,
                itemDto.Quantity,
                itemDto.UnitPrice,
                itemDto.VatRate,
                itemDto.DiscountRate,
                itemDto.DiscountAmount,
                itemDto.Description,
                itemDto.Unit
            );

            if (!itemResult.IsSuccess)
                return Result<QuotationDto>.Failure(itemResult.Error);

            var item = itemResult.Value;
            item.SetQuotationId(quotation.Id);
            quotation.AddItem(item);
        }

        await _unitOfWork.Repository<Quotation>().AddAsync(quotation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<QuotationDto>.Success(_mapper.Map<QuotationDto>(quotation));
    }
}

/// <summary>
/// Handler for GetQuotationByIdQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetQuotationByIdHandler : IRequestHandler<GetQuotationByIdQuery, Result<QuotationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public GetQuotationByIdHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<QuotationDto>> Handle(GetQuotationByIdQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotation = await _unitOfWork.ReadRepository<Quotation>().AsQueryable()
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.TenantId == tenantId, cancellationToken);

        if (quotation == null)
            return Result<QuotationDto>.Failure(Error.NotFound("Quotation", "Quotation not found"));

        return Result<QuotationDto>.Success(_mapper.Map<QuotationDto>(quotation));
    }
}

/// <summary>
/// Handler for GetQuotationsQuery
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class GetQuotationsHandler : IRequestHandler<GetQuotationsQuery, Result<PagedResult<QuotationListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetQuotationsHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PagedResult<QuotationListDto>>> Handle(GetQuotationsQuery request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var query = _unitOfWork.ReadRepository<Quotation>().AsQueryable()
            .Include(q => q.Items)
            .Where(q => q.TenantId == tenantId)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(q =>
                q.QuotationNumber.ToLower().Contains(searchTerm) ||
                (q.Name != null && q.Name.ToLower().Contains(searchTerm)) ||
                (q.CustomerName != null && q.CustomerName.ToLower().Contains(searchTerm)));
        }

        if (request.Status.HasValue)
            query = query.Where(q => q.Status == request.Status.Value);

        if (request.CustomerId.HasValue)
            query = query.Where(q => q.CustomerId == request.CustomerId.Value);

        if (request.SalesPersonId.HasValue)
            query = query.Where(q => q.SalesPersonId == request.SalesPersonId.Value);

        if (request.FromDate.HasValue)
            query = query.Where(q => q.QuotationDate >= request.FromDate.Value);

        if (request.ToDate.HasValue)
            query = query.Where(q => q.QuotationDate <= request.ToDate.Value);

        var totalCount = await query.CountAsync(cancellationToken);

        query = request.SortBy?.ToLower() switch
        {
            "quotationnumber" => request.SortDescending ? query.OrderByDescending(q => q.QuotationNumber) : query.OrderBy(q => q.QuotationNumber),
            "customername" => request.SortDescending ? query.OrderByDescending(q => q.CustomerName) : query.OrderBy(q => q.CustomerName),
            "totalamount" => request.SortDescending ? query.OrderByDescending(q => q.TotalAmount) : query.OrderBy(q => q.TotalAmount),
            "status" => request.SortDescending ? query.OrderByDescending(q => q.Status) : query.OrderBy(q => q.Status),
            _ => request.SortDescending ? query.OrderByDescending(q => q.CreatedAt) : query.OrderBy(q => q.CreatedAt)
        };

        var items = await query
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(q => new QuotationListDto
            {
                Id = q.Id,
                QuotationNumber = q.QuotationNumber,
                Name = q.Name,
                QuotationDate = q.QuotationDate,
                ExpirationDate = q.ExpirationDate,
                CustomerName = q.CustomerName,
                SalesPersonName = q.SalesPersonName,
                TotalAmount = q.TotalAmount,
                Currency = q.Currency,
                Status = q.Status.ToString(),
                ItemCount = q.Items.Count,
                RevisionNumber = q.RevisionNumber,
                CreatedAt = q.CreatedAt
            })
            .ToListAsync(cancellationToken);

        return Result<PagedResult<QuotationListDto>>.Success(new PagedResult<QuotationListDto>(
            items,
            request.Page,
            request.PageSize,
            totalCount));
    }
}

/// <summary>
/// Handler for UpdateQuotationCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class UpdateQuotationHandler : IRequestHandler<UpdateQuotationCommand, Result<QuotationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UpdateQuotationHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<QuotationDto>> Handle(UpdateQuotationCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotation = await _unitOfWork.ReadRepository<Quotation>().AsQueryable()
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.TenantId == tenantId, cancellationToken);

        if (quotation == null)
            return Result<QuotationDto>.Failure(Error.NotFound("Quotation", "Quotation not found"));

        if (quotation.Status != QuotationStatus.Draft)
            return Result<QuotationDto>.Failure(Error.Conflict("Quotation.Status", "Only draft quotations can be updated"));

        if (request.Dto.Name != null)
            quotation.SetName(request.Dto.Name);

        quotation.UpdateCustomer(
            request.Dto.CustomerId ?? quotation.CustomerId,
            request.Dto.CustomerName ?? quotation.CustomerName,
            request.Dto.CustomerEmail ?? quotation.CustomerEmail,
            request.Dto.CustomerPhone ?? quotation.CustomerPhone,
            request.Dto.CustomerTaxNumber ?? quotation.CustomerTaxNumber
        );

        if (request.Dto.ContactId.HasValue || request.Dto.ContactName != null)
            quotation.SetContact(request.Dto.ContactId, request.Dto.ContactName);

        if (request.Dto.SalesPersonId.HasValue || request.Dto.SalesPersonName != null)
            quotation.SetSalesPerson(request.Dto.SalesPersonId, request.Dto.SalesPersonName);

        if (request.Dto.ValidityDays.HasValue)
            quotation.SetValidityDays(request.Dto.ValidityDays.Value);

        if (request.Dto.ShippingAmount.HasValue)
            quotation.SetShippingAmount(request.Dto.ShippingAmount.Value);

        if (request.Dto.DiscountAmount.HasValue || request.Dto.DiscountRate.HasValue)
            quotation.ApplyDiscount(
                request.Dto.DiscountAmount ?? quotation.DiscountAmount,
                request.Dto.DiscountRate ?? quotation.DiscountRate
            );

        quotation.SetAddresses(
            request.Dto.ShippingAddress ?? quotation.ShippingAddress,
            request.Dto.BillingAddress ?? quotation.BillingAddress
        );

        quotation.SetTerms(
            request.Dto.PaymentTerms ?? quotation.PaymentTerms,
            request.Dto.DeliveryTerms ?? quotation.DeliveryTerms,
            request.Dto.TermsAndConditions ?? quotation.TermsAndConditions
        );

        if (request.Dto.Notes != null)
            quotation.SetNotes(request.Dto.Notes, null);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<QuotationDto>.Success(_mapper.Map<QuotationDto>(quotation));
    }
}

/// <summary>
/// Handler for ApproveQuotationCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class ApproveQuotationHandler : IRequestHandler<ApproveQuotationCommand, Result<QuotationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUserService;

    public ApproveQuotationHandler(ISalesUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUserService = currentUserService;
    }

    public async Task<Result<QuotationDto>> Handle(ApproveQuotationCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotation = await _unitOfWork.ReadRepository<Quotation>().AsQueryable()
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.TenantId == tenantId, cancellationToken);

        if (quotation == null)
            return Result<QuotationDto>.Failure(Error.NotFound("Quotation", "Quotation not found"));

        var userId = _currentUserService.UserId ?? Guid.Empty;
        var result = quotation.Approve(userId);

        if (!result.IsSuccess)
            return Result<QuotationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<QuotationDto>.Success(_mapper.Map<QuotationDto>(quotation));
    }
}

/// <summary>
/// Handler for SendQuotationCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class SendQuotationHandler : IRequestHandler<SendQuotationCommand, Result<QuotationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SendQuotationHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<QuotationDto>> Handle(SendQuotationCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotation = await _unitOfWork.ReadRepository<Quotation>().AsQueryable()
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.TenantId == tenantId, cancellationToken);

        if (quotation == null)
            return Result<QuotationDto>.Failure(Error.NotFound("Quotation", "Quotation not found"));

        var result = quotation.Send();

        if (!result.IsSuccess)
            return Result<QuotationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<QuotationDto>.Success(_mapper.Map<QuotationDto>(quotation));
    }
}

/// <summary>
/// Handler for AcceptQuotationCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class AcceptQuotationHandler : IRequestHandler<AcceptQuotationCommand, Result<QuotationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public AcceptQuotationHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<QuotationDto>> Handle(AcceptQuotationCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotation = await _unitOfWork.ReadRepository<Quotation>().AsQueryable()
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.TenantId == tenantId, cancellationToken);

        if (quotation == null)
            return Result<QuotationDto>.Failure(Error.NotFound("Quotation", "Quotation not found"));

        var result = quotation.Accept();

        if (!result.IsSuccess)
            return Result<QuotationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<QuotationDto>.Success(_mapper.Map<QuotationDto>(quotation));
    }
}

/// <summary>
/// Handler for RejectQuotationCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class RejectQuotationHandler : IRequestHandler<RejectQuotationCommand, Result<QuotationDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public RejectQuotationHandler(ISalesUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<Result<QuotationDto>> Handle(RejectQuotationCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotation = await _unitOfWork.ReadRepository<Quotation>().AsQueryable()
            .Include(q => q.Items)
            .FirstOrDefaultAsync(q => q.Id == request.Id && q.TenantId == tenantId, cancellationToken);

        if (quotation == null)
            return Result<QuotationDto>.Failure(Error.NotFound("Quotation", "Quotation not found"));

        var result = quotation.Reject(request.Reason);

        if (!result.IsSuccess)
            return Result<QuotationDto>.Failure(result.Error);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<QuotationDto>.Success(_mapper.Map<QuotationDto>(quotation));
    }
}

/// <summary>
/// Handler for DeleteQuotationCommand
/// Uses ISalesUnitOfWork for consistent data access
/// </summary>
public class DeleteQuotationHandler : IRequestHandler<DeleteQuotationCommand, Result>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public DeleteQuotationHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result> Handle(DeleteQuotationCommand request, CancellationToken cancellationToken)
    {
        var tenantId = _unitOfWork.TenantId;

        var quotation = await _unitOfWork.Repository<Quotation>().GetByIdAsync(request.Id, cancellationToken);

        if (quotation == null || quotation.TenantId != tenantId)
            return Result.Failure(Error.NotFound("Quotation", "Quotation not found"));

        if (quotation.Status != QuotationStatus.Draft && quotation.Status != QuotationStatus.Cancelled)
            return Result.Failure(Error.Conflict("Quotation.Status", "Only draft or cancelled quotations can be deleted"));

        _unitOfWork.Repository<Quotation>().Remove(quotation);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
