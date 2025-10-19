using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.Features.CustomerSegments.Commands;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerSegments.Handlers;

public class AddSegmentMemberCommandHandler : IRequestHandler<AddSegmentMemberCommand, Result>
{
    private readonly CRMDbContext _context;

    public AddSegmentMemberCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(AddSegmentMemberCommand request, CancellationToken cancellationToken)
    {
        var segment = await _context.CustomerSegments
            .Include(s => s.Members)
            .FirstOrDefaultAsync(s => s.Id == request.SegmentId && s.TenantId == request.TenantId, cancellationToken);

        if (segment == null)
        {
            return Result.Failure(Error.NotFound("CustomerSegment.NotFound", "Customer segment not found"));
        }

        // Verify customer exists
        var customerExists = await _context.Customers
            .AnyAsync(c => c.Id == request.CustomerId && c.TenantId == request.TenantId, cancellationToken);

        if (!customerExists)
        {
            return Result.Failure(Error.NotFound("Customer.NotFound", "Customer not found"));
        }

        var result = segment.AddMember(request.CustomerId, request.Reason);
        if (result.IsFailure)
        {
            return result;
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
