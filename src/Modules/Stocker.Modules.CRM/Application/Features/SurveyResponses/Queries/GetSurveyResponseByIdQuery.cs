using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Queries;

public record GetSurveyResponseByIdQuery(Guid Id) : IRequest<Result<SurveyResponseDto?>>;
