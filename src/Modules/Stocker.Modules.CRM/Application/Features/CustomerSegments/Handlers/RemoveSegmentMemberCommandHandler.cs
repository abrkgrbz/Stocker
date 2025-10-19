using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

public class RemoveSegmentMemberCommandHandler : IRequestHandler<RemoveSegmentMemberCommand, Result>
{
    private readonly CRMDbContext _context;

    public RemoveSegmentMemberCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(RemoveSegmentMemberCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(Error.NotFound("CustomerSegment.NotFound", "Customer segment not found"));
        }

        var result = segment.RemoveMember(request.CustomerId);
        if (result.IsFailure)
        {
            return result;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
