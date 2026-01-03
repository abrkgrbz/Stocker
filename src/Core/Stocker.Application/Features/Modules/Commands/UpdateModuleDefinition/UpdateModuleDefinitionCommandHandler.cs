using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.UpdateModuleDefinition;

public class UpdateModuleDefinitionCommandHandler : IRequestHandler<UpdateModuleDefinitionCommand, Result>
{
    private readonly IMasterDbContext _context;

    public UpdateModuleDefinitionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(
        UpdateModuleDefinitionCommand request,
        CancellationToken cancellationToken)
    {
        var module = await _context.ModuleDefinitions
            .FirstOrDefaultAsync(m => m.Id == request.Id, cancellationToken);

        if (module is null)
        {
            return Result.Failure(
                Error.NotFound("Module.NotFound", $"Modül bulunamadı: {request.Id}"));
        }

        var monthlyPrice = Money.Create(request.MonthlyPrice, request.Currency);

        module.Update(
            request.Name,
            request.Description,
            request.Icon,
            monthlyPrice,
            request.IsCore,
            request.DisplayOrder,
            request.Category);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
