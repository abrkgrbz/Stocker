using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;

public record CreateSurveyResponseCommand(
    Guid TenantId,
    string SurveyName,
    SurveyType SurveyType,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    Guid? LeadId = null,
    Guid? TicketId = null,
    Guid? OrderId = null,
    Guid? CampaignId = null,
    string? RespondentName = null,
    string? RespondentEmail = null,
    string? RespondentPhone = null,
    bool IsAnonymous = false,
    SurveySource Source = SurveySource.Email
) : IRequest<Result<Guid>>;
