using MediatR;
using Stocker.Application.DTOs.Payment;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Payments.Queries.GetPaymentById;

public class GetPaymentByIdQuery : IRequest<Result<PaymentDetailDto>>
{
    public Guid PaymentId { get; set; }
}