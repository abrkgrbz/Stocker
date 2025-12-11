using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Modules.CRM.Domain.Entities;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;

public record UpdateSurveyResponseCommand(
    Guid Id,
    Guid TenantId,
    int? NpsScore = null,
    int? CsatScore = null,
    int? CesScore = null,
    decimal? OverallSatisfaction = null,
    bool? WouldRecommend = null,
    bool? WouldRepurchase = null,
    string? OverallComment = null,
    string? ImprovementSuggestion = null,
    string? Praise = null,
    string? Complaint = null,
    bool? FollowUpRequired = null,
    int? AssignedToUserId = null,
    SurveyResponseStatus? Status = null
) : IRequest<Result<bool>>;
