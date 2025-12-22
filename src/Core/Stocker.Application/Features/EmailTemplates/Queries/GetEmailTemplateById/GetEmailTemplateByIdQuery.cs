using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.EmailTemplate;

namespace Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplateById;

public class GetEmailTemplateByIdQuery : IRequest<Result<EmailTemplateDto>>
{
    public Guid Id { get; set; }

    public GetEmailTemplateByIdQuery(Guid id)
    {
        Id = id;
    }
}
