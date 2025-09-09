using MediatR;
using Stocker.Application.DTOs.TenantRegistration;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.TenantRegistration.Queries.GetTenantRegistration;

public sealed class GetTenantRegistrationQuery : IRequest<Result<TenantRegistrationDto>>
{
    public string? RegistrationCode { get; set; }
    public Guid? RegistrationId { get; set; }
    public string? Email { get; set; }
}