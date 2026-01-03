using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Common.ValueObjects;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Modules.Commands.CreateModuleDefinition;

public class CreateModuleDefinitionCommandHandler : IRequestHandler<CreateModuleDefinitionCommand, Result<Guid>>
{
    private readonly IMasterDbContext _context;

    public CreateModuleDefinitionCommandHandler(IMasterDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(
        CreateModuleDefinitionCommand request,
        CancellationToken cancellationToken)
    {
        // Check if module code already exists
        var existingModule = await _context.ModuleDefinitions
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.Code == request.Code, cancellationToken);

        if (existingModule is not null)
        {
            return Result<Guid>.Failure(
                Error.Conflict("Module.CodeExists", $"Bu modül kodu zaten mevcut: {request.Code}"));
        }

        var monthlyPrice = Money.Create(request.MonthlyPrice, request.Currency);

        var module = ModuleDefinition.Create(
            request.Code,
            request.Name,
            monthlyPrice,
            request.Description,
            request.Icon,
            request.IsCore,
            request.DisplayOrder,
            request.Category);

        _context.ModuleDefinitions.Add(module);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(module.Id);
    }
}
