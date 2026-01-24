using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesPipelines.Queries;

public record GetSalesPipelineByIdQuery(Guid Id) : IRequest<Result<SalesPipelineDto>>;

public record GetSalesPipelineByCodeQuery(string Code) : IRequest<Result<SalesPipelineDto>>;

public record GetAllSalesPipelinesQuery() : IRequest<Result<IReadOnlyList<SalesPipelineListDto>>>;

public record GetActiveSalesPipelinesQuery() : IRequest<Result<IReadOnlyList<SalesPipelineListDto>>>;

public record GetDefaultSalesPipelineQuery() : IRequest<Result<SalesPipelineDto>>;
