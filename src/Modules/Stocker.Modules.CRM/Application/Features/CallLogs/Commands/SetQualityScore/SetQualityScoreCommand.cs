using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CallLogs.Commands.SetQualityScore;

public record SetQualityScoreCommand(
    Guid Id,
    int Score,
    int? CustomerSatisfaction = null,
    string? QualityNotes = null) : IRequest<Result<bool>>;
