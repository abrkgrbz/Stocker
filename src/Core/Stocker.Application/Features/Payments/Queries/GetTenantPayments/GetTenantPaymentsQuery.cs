using MediatR;
using Stocker.Application.DTOs.Payment;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Payments.Queries.GetTenantPayments;

public class GetTenantPaymentsQuery : IRequest<Result<List<PaymentDto>>>
{
    public Guid TenantId { get; set; }
    public string? Status { get; set; }
}