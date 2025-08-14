using MediatR;
using Stocker.Application.DTOs.Payment;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Payments.Queries.GetPaymentsList;

public class GetPaymentsListQuery : IRequest<Result<List<PaymentDto>>>
{
    public Guid? TenantId { get; set; }
    public PaymentStatus? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public string? PaymentMethod { get; set; }
}