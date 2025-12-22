using MediatR;
using Stocker.Domain.Master.Entities;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.EmailTemplates.Queries.GetEmailTemplateCategories;

public class GetEmailTemplateCategoriesQueryHandler : IRequestHandler<GetEmailTemplateCategoriesQuery, Result<List<string>>>
{
    public Task<Result<List<string>>> Handle(GetEmailTemplateCategoriesQuery request, CancellationToken cancellationToken)
    {
        var categories = Enum.GetNames<EmailTemplateCategory>().ToList();
        return Task.FromResult(Result<List<string>>.Success(categories));
    }
}
