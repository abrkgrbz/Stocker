using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Queries;

public record GetSurveyResponsesQuery(
    SurveyType? SurveyType = null,
    SurveyResponseStatus? Status = null,
    Guid? CustomerId = null,
    Guid? ContactId = null,
    NpsCategory? NpsCategory = null,
    bool? FollowUpRequired = null,
    int Skip = 0,
    int Take = 100
) : IRequest<Result<List<SurveyResponseDto>>>;
