using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

public class DeactivateSegmentCommandHandler : IRequestHandler<DeactivateSegmentCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeactivateSegmentCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeactivateSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(Error.NotFound("CustomerSegment.NotFound", "Customer segment not found"));
        }

        segment.Deactivate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
