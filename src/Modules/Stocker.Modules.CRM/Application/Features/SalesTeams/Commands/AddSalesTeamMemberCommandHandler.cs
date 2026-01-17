using MediatR;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SalesTeams.Commands;

public class AddSalesTeamMemberCommandHandler : IRequestHandler<AddSalesTeamMemberCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public AddSalesTeamMemberCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(AddSalesTeamMemberCommand request, CancellationToken cancellationToken)
    {
        var salesTeam = await _unitOfWork.SalesTeams.GetByIdAsync(request.SalesTeamId, cancellationToken);

        if (salesTeam == null)
        {
            return Result<Guid>.Failure(Error.NotFound("SalesTeam.NotFound", $"Sales team with ID {request.SalesTeamId} not found"));
        }

        if (salesTeam.TenantId != _unitOfWork.TenantId)
        {
            return Result<Guid>.Failure(Error.Forbidden("SalesTeam.Forbidden", "You don't have permission to modify this sales team"));
        }

        try
        {
            var member = salesTeam.AddMember(request.UserId, request.UserName, request.Role);

            await _unitOfWork.SalesTeams.UpdateAsync(salesTeam, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return Result<Guid>.Success(member.Id);
        }
        catch (InvalidOperationException ex)
        {
            return Result<Guid>.Failure(Error.Conflict("SalesTeam.MemberExists", ex.Message));
        }
    }
}
