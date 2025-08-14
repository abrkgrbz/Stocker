using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.MasterUsers.Commands.UpdateMasterUser;

public class UpdateMasterUserCommand : IRequest<Result<bool>>
{
    public Guid UserId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public bool? IsSystemAdmin { get; set; }
    public string? ModifiedBy { get; set; }
}