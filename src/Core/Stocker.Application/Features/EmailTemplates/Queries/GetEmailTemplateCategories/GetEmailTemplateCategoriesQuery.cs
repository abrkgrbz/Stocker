using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplateCategories;

public class GetEmailTemplateCategoriesQuery : IRequest<Result<List<string>>>
{
}
