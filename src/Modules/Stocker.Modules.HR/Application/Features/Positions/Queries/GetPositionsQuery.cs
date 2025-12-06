using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Queries;

/// <summary>
/// Query to get positions with optional filtering
/// </summary>
public class GetPositionsQuery : IRequest<Result<List<PositionSummaryDto>>>
{
    public Guid TenantId { get; set; }
    public int? DepartmentId { get; set; }
    public bool IncludeInactive { get; set; } = false;
}

/// <summary>
/// Handler for GetPositionsQuery
/// </summary>
public class GetPositionsQueryHandler : IRequestHandler<GetPositionsQuery, Result<List<PositionSummaryDto>>>
{
    private readonly IPositionRepository _positionRepository;
    private readonly IDepartmentRepository _departmentRepository;

    public GetPositionsQueryHandler(
        IPositionRepository positionRepository,
        IDepartmentRepository departmentRepository)
    {
        _positionRepository = positionRepository;
        _departmentRepository = departmentRepository;
    }

    public async Task<Result<List<PositionSummaryDto>>> Handle(GetPositionsQuery request, CancellationToken cancellationToken)
    {
        IReadOnlyList<Domain.Entities.Position> positions;

        if (request.DepartmentId.HasValue)
        {
            positions = await _positionRepository.GetByDepartmentAsync(request.DepartmentId.Value, cancellationToken);
        }
        else
        {
            positions = await _positionRepository.GetAllAsync(cancellationToken);
        }

        if (!request.IncludeInactive)
        {
            positions = positions.Where(p => p.IsActive).ToList();
        }

        var positionDtos = new List<PositionSummaryDto>();
        foreach (var position in positions)
        {
            var department = await _departmentRepository.GetByIdAsync(position.DepartmentId, cancellationToken);
            var employeeCount = await _positionRepository.GetEmployeeCountAsync(position.Id, cancellationToken);

            positionDtos.Add(new PositionSummaryDto
            {
                Id = position.Id,
                Code = position.Code,
                Title = position.Title,
                DepartmentName = department?.Name,
                Level = position.Level,
                HeadCount = position.HeadCount,
                FilledPositions = employeeCount,
                IsActive = position.IsActive
            });
        }

        return Result<List<PositionSummaryDto>>.Success(positionDtos.OrderBy(p => p.Title).ToList());
    }
}
