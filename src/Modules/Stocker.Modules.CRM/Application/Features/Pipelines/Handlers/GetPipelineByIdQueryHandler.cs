using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.Pipelines.Queries;
using Stocker.Modules.CRM.Infrastructure.Persistence;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.Pipelines.Handlers;

public class GetPipelineByIdQueryHandler : IRequestHandler<GetPipelineByIdQuery, PipelineDto?>
{
    private readonly CRMDbContext _context;
    private readonly IMapper _mapper;

    public GetPipelineByIdQueryHandler(CRMDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<PipelineDto?> Handle(GetPipelineByIdQuery request, CancellationToken cancellationToken)
    {
        var pipeline = await _context.Pipelines
            .Include(p => p.Stages.OrderBy(s => s.DisplayOrder))
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.TenantId == request.TenantId, cancellationToken);

        if (pipeline == null)
        {
            return null;
        }

        var dto = _mapper.Map<PipelineDto>(pipeline);
        return dto;
    }
}