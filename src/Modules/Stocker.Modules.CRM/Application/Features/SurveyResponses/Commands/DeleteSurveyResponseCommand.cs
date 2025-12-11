using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;

public record DeleteSurveyResponseCommand(
    Guid Id,
    Guid TenantId
) : IRequest<Result<bool>>;
