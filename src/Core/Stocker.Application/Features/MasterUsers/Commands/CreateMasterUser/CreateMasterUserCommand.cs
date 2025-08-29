using MediatR;
using Stocker.Application.DTOs.MasterUser;
using Stocker.Domain.Master.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.CreateMasterUser;

public class CreateMasterUserCommand : IRequest<Result<MasterUserDto>>
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public UserType UserType { get; set; } = UserType.FirmaSahibi;
    public bool IsSystemAdmin { get; set; } = false;
    public Guid? TenantId { get; set; }
    public UserType? TenantUserType { get; set; }
}