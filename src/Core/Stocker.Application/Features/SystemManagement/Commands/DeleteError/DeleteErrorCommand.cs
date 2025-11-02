using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.SystemManagement.Commands.DeleteError;

public class DeleteErrorCommand : IRequest<Result<bool>>
{
    public string ErrorId { get; init; } = string.Empty;
}
