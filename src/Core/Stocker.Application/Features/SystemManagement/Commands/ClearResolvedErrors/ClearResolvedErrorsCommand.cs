using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Commands.ClearResolvedErrors;

public class ClearResolvedErrorsCommand : IRequest<Result<int>>
{
}
