using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Domain.Repositories;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Queries;

/// <summary>
/// Query to get a job posting by ID
/// </summary>
public class GetJobPostingByIdQuery : IRequest<Result<JobPostingDto>>
{
    public Guid TenantId { get; set; }
    public int Id { get; set; }
}

/// <summary>
/// Handler for GetJobPostingByIdQuery
/// </summary>
public class GetJobPostingByIdQueryHandler : IRequestHandler<GetJobPostingByIdQuery, Result<JobPostingDto>>
{
    private readonly IJobPostingRepository _repository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IPositionRepository _positionRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IWorkLocationRepository _workLocationRepository;

    public GetJobPostingByIdQueryHandler(
        IJobPostingRepository repository,
        IDepartmentRepository departmentRepository,
        IPositionRepository positionRepository,
        IEmployeeRepository employeeRepository,
        IWorkLocationRepository workLocationRepository)
    {
        _repository = repository;
        _departmentRepository = departmentRepository;
        _positionRepository = positionRepository;
        _employeeRepository = employeeRepository;
        _workLocationRepository = workLocationRepository;
    }

    public async Task<Result<JobPostingDto>> Handle(GetJobPostingByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<JobPostingDto>.Failure(
                Error.NotFound("JobPosting", $"Job posting with ID {request.Id} not found"));
        }

        // Get related names
        var department = await _departmentRepository.GetByIdAsync(entity.DepartmentId, cancellationToken);
        var departmentName = department?.Name ?? string.Empty;

        string? positionTitle = null;
        if (entity.PositionId.HasValue)
        {
            var position = await _positionRepository.GetByIdAsync(entity.PositionId.Value, cancellationToken);
            positionTitle = position?.Title;
        }

        string? hiringManagerName = null;
        if (entity.HiringManagerId.HasValue)
        {
            var manager = await _employeeRepository.GetByIdAsync(entity.HiringManagerId.Value, cancellationToken);
            hiringManagerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : null;
        }

        string? workLocationName = null;
        if (entity.WorkLocationId.HasValue)
        {
            var workLocation = await _workLocationRepository.GetByIdAsync(entity.WorkLocationId.Value, cancellationToken);
            workLocationName = workLocation?.Name;
        }

        var dto = new JobPostingDto
        {
            Id = entity.Id,
            Title = entity.Title,
            PostingCode = entity.PostingCode,
            Status = entity.Status.ToString(),
            EmploymentType = entity.EmploymentType.ToString(),
            ExperienceLevel = entity.ExperienceLevel.ToString(),
            DepartmentId = entity.DepartmentId,
            DepartmentName = departmentName,
            PositionId = entity.PositionId,
            PositionTitle = positionTitle,
            HiringManagerId = entity.HiringManagerId,
            HiringManagerName = hiringManagerName,
            NumberOfOpenings = entity.NumberOfOpenings,
            WorkLocationId = entity.WorkLocationId,
            WorkLocationName = workLocationName,
            RemoteWorkType = entity.RemoteWorkType.ToString(),
            City = entity.City,
            Country = entity.Country,
            Description = entity.Description,
            Requirements = entity.Requirements,
            Responsibilities = entity.Responsibilities,
            Qualifications = entity.Qualifications,
            PreferredQualifications = entity.PreferredQualifications,
            Benefits = entity.Benefits,
            SalaryMin = entity.SalaryMin,
            SalaryMax = entity.SalaryMax,
            Currency = entity.Currency,
            ShowSalary = entity.ShowSalary,
            SalaryPeriod = entity.SalaryPeriod.ToString(),
            PostedDate = entity.PostedDate,
            ApplicationDeadline = entity.ApplicationDeadline,
            ExpectedStartDate = entity.ExpectedStartDate,
            ClosedDate = entity.ClosedDate,
            TotalApplications = entity.TotalApplications,
            ViewsCount = entity.ViewsCount,
            HiredCount = entity.HiredCount,
            IsInternal = entity.IsInternal,
            IsFeatured = entity.IsFeatured,
            IsUrgent = entity.IsUrgent,
            PostedByUserId = entity.PostedByUserId,
            Tags = entity.Tags,
            Keywords = entity.Keywords,
            InternalNotes = entity.InternalNotes,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        };

        return Result<JobPostingDto>.Success(dto);
    }
}
