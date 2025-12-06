using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.Positions.Queries;

/// <summary>
/// Query to get a position by ID
/// </summary>
public class GetPositionByIdQuery : IRequest<Result<PositionDto>>
{
    public Guid TenantId { get; set; }
    public int PositionId { get; set; }
}

/// <summary>
/// Handler for GetPositionByIdQuery
/// </summary>
public class GetPositionByIdQueryHandler : IRequestHandler<GetPositionByIdQuery, Result<PositionDto>>
{
    private readonly IPositionRepository _positionRepository;
    private readonly IDepartmentRepository _departmentRepository;

    public GetPositionByIdQueryHandler(
        IPositionRepository positionRepository,
        IDepartmentRepository departmentRepository)
    {
        _positionRepository = positionRepository;
        _departmentRepository = departmentRepository;
    }

    public async Task<Result<PositionDto>> Handle(GetPositionByIdQuery request, CancellationToken cancellationToken)
    {
        var position = await _positionRepository.GetByIdAsync(request.PositionId, cancellationToken);
        if (position == null)
        {
            return Result<PositionDto>.Failure(
                Error.NotFound("Position", $"Position with ID {request.PositionId} not found"));
        }

        var department = await _departmentRepository.GetByIdAsync(position.DepartmentId, cancellationToken);
        var employeeCount = await _positionRepository.GetEmployeeCountAsync(position.Id, cancellationToken);

        var positionDto = new PositionDto
        {
            Id = position.Id,
            Code = position.Code,
            Title = position.Title,
            Description = position.Description,
            DepartmentId = position.DepartmentId,
            DepartmentName = department?.Name,
            Level = position.Level,
            MinSalary = position.MinSalary,
            MaxSalary = position.MaxSalary,
            Currency = position.Currency,
            HeadCount = position.HeadCount,
            FilledPositions = employeeCount,
            Vacancies = position.HeadCount.HasValue ? position.HeadCount.Value - employeeCount : 0,
            Requirements = position.Requirements,
            Responsibilities = position.Responsibilities,
            IsActive = position.IsActive,
            CreatedAt = position.CreatedDate,
            UpdatedAt = position.UpdatedDate
        };

        return Result<PositionDto>.Success(positionDto);
    }
}
