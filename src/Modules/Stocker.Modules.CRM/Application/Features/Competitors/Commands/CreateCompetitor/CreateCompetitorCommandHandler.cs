using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Infrastructure.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Competitors.Commands.CreateCompetitor;

public class CreateCompetitorCommandHandler : IRequestHandler<CreateCompetitorCommand, Result<Guid>>
{
    private readonly ICompetitorRepository _repository;

    public CreateCompetitorCommandHandler(ICompetitorRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<Guid>> Handle(CreateCompetitorCommand request, CancellationToken cancellationToken)
    {
        // Check if code exists
        if (!string.IsNullOrEmpty(request.Code))
        {
            var codeExists = await _repository.CodeExistsAsync(request.Code, null, cancellationToken);
            if (codeExists)
                return Result<Guid>.Failure(new Error("Competitor.CodeExists", $"Competitor code '{request.Code}' already exists", ErrorType.Conflict));
        }

        var competitor = new Competitor(request.TenantId, request.Name);

        if (!string.IsNullOrEmpty(request.Code) || !string.IsNullOrEmpty(request.Description))
            competitor.UpdateDetails(request.Name, request.Code, request.Description);

        competitor.SetThreatLevel(request.ThreatLevel);

        await _repository.CreateAsync(competitor, cancellationToken);
        return Result<Guid>.Success(competitor.Id);
    }
}
