using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

public class ActivateSegmentCommandHandler : IRequestHandler<ActivateSegmentCommand, Result>
{
    private readonly CRMDbContext _context;

    public ActivateSegmentCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(ActivateSegmentCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .FirstOrDefaultAsync(s => s.Id == request.Id && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(Error.NotFound("CustomerSegment.NotFound", "Customer segment not found"));
        }

        segment.Activate();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
