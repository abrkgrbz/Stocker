using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Identity.Commands.Register;

public sealed record RegisterCommand : IRequest<Result<RegisterResponse>>
{
    public string CompanyName { get; init; } = string.Empty;
    public string CompanyCode { get; init; } = string.Empty;
    public string IdentityType { get; init; } = string.Empty; // 'tc' or 'vergi'
    public string IdentityNumber { get; init; } = string.Empty; // TC Kimlik No or Vergi No
    public string Sector { get; init; } = string.Empty;
    public string EmployeeCount { get; init; } = string.Empty;
    public string ContactName { get; init; } = string.Empty;
    public string ContactEmail { get; init; } = string.Empty;
    public string ContactPhone { get; init; } = string.Empty;
    public string ContactTitle { get; init; } = string.Empty;
    public string Username { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
    public string Domain { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
}