using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.Modules.Sales.Application.Features.SalesPipelines.Queries;
using Stocker.Modules.Sales.Infrastructure.Persistence;
using Stocker.Modules.Sales.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.SalesPipelines.Handlers;

public class GetSalesPipelineByIdHandler : IRequestHandler<GetSalesPipelineByIdQuery, Result<SalesPipelineDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesPipelineByIdHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesPipelineDto>> Handle(GetSalesPipelineByIdQuery request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetWithStagesAsync(request.Id, cancellationToken);
        if (pipeline == null)
            return Result<SalesPipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        return Result<SalesPipelineDto>.Success(CreateSalesPipelineHandler.MapToDto(pipeline));
    }
}

public class GetSalesPipelineByCodeHandler : IRequestHandler<GetSalesPipelineByCodeQuery, Result<SalesPipelineDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetSalesPipelineByCodeHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesPipelineDto>> Handle(GetSalesPipelineByCodeQuery request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetByCodeAsync(request.Code, cancellationToken);
        if (pipeline == null)
            return Result<SalesPipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", "Pipeline not found"));

        return Result<SalesPipelineDto>.Success(CreateSalesPipelineHandler.MapToDto(pipeline));
    }
}

public class GetAllSalesPipelinesHandler : IRequestHandler<GetAllSalesPipelinesQuery, Result<IReadOnlyList<SalesPipelineListDto>>>
{
    private readonly SalesDbContext _context;

    public GetAllSalesPipelinesHandler(SalesDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IReadOnlyList<SalesPipelineListDto>>> Handle(GetAllSalesPipelinesQuery request, CancellationToken cancellationToken)
    {
        var pipelines = await _context.SalesPipelines
            .Include(p => p.Stages)
            .AsNoTracking()
            .OrderBy(p => p.Name)
            .ToListAsync(cancellationToken);

        var dtos = pipelines.Select(CreateSalesPipelineHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<SalesPipelineListDto>>.Success(dtos);
    }
}

public class GetActiveSalesPipelinesHandler : IRequestHandler<GetActiveSalesPipelinesQuery, Result<IReadOnlyList<SalesPipelineListDto>>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetActiveSalesPipelinesHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<IReadOnlyList<SalesPipelineListDto>>> Handle(GetActiveSalesPipelinesQuery request, CancellationToken cancellationToken)
    {
        var pipelines = await _unitOfWork.SalesPipelines.GetActiveAsync(cancellationToken);
        var dtos = pipelines.Select(CreateSalesPipelineHandler.MapToListDto).ToList();
        return Result<IReadOnlyList<SalesPipelineListDto>>.Success(dtos);
    }
}

public class GetDefaultSalesPipelineHandler : IRequestHandler<GetDefaultSalesPipelineQuery, Result<SalesPipelineDto>>
{
    private readonly ISalesUnitOfWork _unitOfWork;

    public GetDefaultSalesPipelineHandler(ISalesUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<SalesPipelineDto>> Handle(GetDefaultSalesPipelineQuery request, CancellationToken cancellationToken)
    {
        var pipeline = await _unitOfWork.SalesPipelines.GetDefaultAsync(cancellationToken);
        if (pipeline == null)
            return Result<SalesPipelineDto>.Failure(Error.NotFound("Pipeline.NotFound", "No default pipeline found"));

        return Result<SalesPipelineDto>.Success(CreateSalesPipelineHandler.MapToDto(pipeline));
    }
}
