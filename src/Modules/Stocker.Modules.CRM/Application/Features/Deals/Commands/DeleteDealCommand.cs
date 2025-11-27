using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.MultiTenancy;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Deals.Commands;

public class DeleteDealCommand : IRequest<Result>, ITenantRequest
{
    public Guid TenantId { get; set; }
    public Guid Id { get; set; }
}

public class DeleteDealCommandValidator : AbstractValidator<DeleteDealCommand>
{
    public DeleteDealCommandValidator()
    {
        RuleFor(x => x.TenantId)
            .NotEmpty().WithMessage("Tenant ID is required");

        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Deal ID is required");
    }
}

public class DeleteDealCommandHandler : IRequestHandler<DeleteDealCommand, Result>
{
    private readonly CRMDbContext _context;

    public DeleteDealCommandHandler(CRMDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteDealCommand request, CancellationToken cancellationToken)
    {
        var deal = await _context.Deals
            .FirstOrDefaultAsync(d => d.Id == request.Id && d.TenantId == request.TenantId, cancellationToken);

        if (deal == null)
            return Result.Failure(Error.NotFound("Deal.NotFound", $"Deal with ID {request.Id} not found"));

        deal.Delete();
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}