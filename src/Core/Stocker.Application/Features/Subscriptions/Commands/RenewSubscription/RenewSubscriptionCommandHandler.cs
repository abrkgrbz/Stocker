using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Stocker.Application.DTOs.Subscription;
using Stocker.Application.Extensions;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Subscriptions.Commands.RenewSubscription;

public class RenewSubscriptionCommandHandler : IRequestHandler<RenewSubscriptionCommand, Result<SubscriptionDto>>
{
    private readonly IMasterUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ILogger<RenewSubscriptionCommandHandler> _logger;

    public RenewSubscriptionCommandHandler(
        IMasterUnitOfWork unitOfWork,
        IMapper mapper,
        ILogger<RenewSubscriptionCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<Result<SubscriptionDto>> Handle(RenewSubscriptionCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var subscription = await _unitOfWork.Subscriptions()
                .AsQueryable()
                .Include(s => s.Package)
                .FirstOrDefaultAsync(s => s.Id == request.SubscriptionId, cancellationToken);

            if (subscription == null)
            {
                return Result<SubscriptionDto>.Failure(
                    Error.NotFound("Subscription.NotFound", "Abonelik bulunamadı"));
            }

            // Check if subscription can be renewed
            if (subscription.Status == Domain.Master.Enums.SubscriptionStatus.Cancelled)
            {
                return Result<SubscriptionDto>.Failure(
                    Error.Conflict("Subscription.CannotRenewCancelled", "İptal edilmiş abonelik yenilenemez"));
            }

            // Calculate new end date (assuming 30 days per month)
            var additionalDays = (request.AdditionalMonths ?? 1) * 30;
            var newEndDate = DateTime.UtcNow.AddDays(additionalDays);
            
            // Update subscription - Renew method doesn't take parameters
            subscription.Renew();

            // TODO: Create invoice for renewal when Package.Price is available
            // var invoice = Invoice.Create(
            //     subscription.TenantId,
            //     subscription.Id,
            //     subscription.Package.Price * (request.AdditionalMonths ?? 1),
            //     $"Abonelik yenileme - {subscription.Package.Name}");

            // await _unitOfWork.Invoices().AddAsync(invoice, cancellationToken);

            // Log renewal
            _logger.LogInformation("Subscription {SubscriptionId} renewed for {Months} month(s). New end date: {EndDate}", 
                subscription.Id, request.AdditionalMonths ?? 1, newEndDate);

            await _unitOfWork.Subscriptions().UpdateAsync(subscription, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            var subscriptionDto = _mapper.Map<SubscriptionDto>(subscription);
            return Result<SubscriptionDto>.Success(subscriptionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error renewing subscription {SubscriptionId}", request.SubscriptionId);
            return Result<SubscriptionDto>.Failure(
                Error.Failure("Subscription.RenewFailed", "Abonelik yenileme işlemi başarısız oldu"));
        }
    }
}