using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Common.Models;

public abstract record BaseCommand : IRequest<Result>;

public abstract record BaseCommand<TResponse> : IRequest<Result<TResponse>>;

public abstract record BaseQuery<TResponse> : IRequest<Result<TResponse>>;

public abstract record BasePaginatedQuery<TResponse> : BaseQuery<TResponse>
{
    public int PageNumber { get; init; } = 1;
    public int PageSize { get; init; } = 10;
}