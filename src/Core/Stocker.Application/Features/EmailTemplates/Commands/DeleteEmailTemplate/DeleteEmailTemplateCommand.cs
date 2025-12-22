using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Commands.DeleteEmailTemplate;

public class DeleteEmailTemplateCommand : IRequest<Result<bool>>
{
    public Guid Id { get; set; }
}
