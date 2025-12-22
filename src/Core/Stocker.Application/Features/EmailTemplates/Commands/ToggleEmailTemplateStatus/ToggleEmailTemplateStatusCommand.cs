using MediatR;
using Stocker.SharedKernel.Results;
using Stocker.Application.DTOs.EmailTemplate;

namespace Stocker.Application.Features.EmailTemplates.Commands.ToggleEmailTemplateStatus;

public class ToggleEmailTemplateStatusCommand : IRequest<Result<EmailTemplateDto>>
{
    public Guid Id { get; set; }
}
