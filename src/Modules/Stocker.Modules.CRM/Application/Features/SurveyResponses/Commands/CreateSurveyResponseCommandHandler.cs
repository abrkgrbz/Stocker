using MediatR;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.SurveyResponses.Commands;

public class CreateSurveyResponseCommandHandler : IRequestHandler<CreateSurveyResponseCommand, Result<Guid>>
{
    private readonly ICRMUnitOfWork _unitOfWork;

    public CreateSurveyResponseCommandHandler(ICRMUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async System.Threading.Tasks.Task<Result<Guid>> Handle(CreateSurveyResponseCommand request, CancellationToken cancellationToken)
    {
        var surveyResponse = new SurveyResponse(
            _unitOfWork.TenantId,
            request.SurveyName,
            request.SurveyType);

        if (request.CustomerId.HasValue)
            surveyResponse.RelateToCustomer(request.CustomerId.Value);

        if (request.ContactId.HasValue)
            surveyResponse.RelateToContact(request.ContactId.Value);

        if (request.LeadId.HasValue)
            surveyResponse.RelateToLead(request.LeadId.Value);

        if (request.TicketId.HasValue)
            surveyResponse.RelateToTicket(request.TicketId.Value);

        if (request.OrderId.HasValue)
            surveyResponse.RelateToOrder(request.OrderId.Value);

        if (request.CampaignId.HasValue)
            surveyResponse.RelateToCampaign(request.CampaignId.Value);

        surveyResponse.SetRespondent(
            request.RespondentName,
            request.RespondentEmail,
            request.RespondentPhone,
            request.IsAnonymous);

        surveyResponse.SetSource(request.Source);

        await _unitOfWork.SurveyResponses.CreateAsync(surveyResponse, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(surveyResponse.Id);
    }
}
