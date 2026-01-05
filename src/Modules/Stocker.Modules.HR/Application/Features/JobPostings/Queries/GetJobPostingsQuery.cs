using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.JobPostings.Queries;

/// <summary>
/// Query to get all job postings
/// </summary>
public record GetJobPostingsQuery(int? DepartmentId = null, bool OpenOnly = true) : IRequest<Result<List<JobPostingDto>>>;

/// <summary>
/// Handler for GetJobPostingsQuery
/// </summary>
public class GetJobPostingsQueryHandler : IRequestHandler<GetJobPostingsQuery, Result<List<JobPostingDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetJobPostingsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<JobPostingDto>>> Handle(GetJobPostingsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.JobPostings.GetAllAsync(cancellationToken);

        var filteredEntities = entities.AsEnumerable();

        if (request.DepartmentId.HasValue)
        {
            filteredEntities = filteredEntities.Where(e => e.DepartmentId == request.DepartmentId.Value);
        }

        if (request.OpenOnly)
        {
            filteredEntities = filteredEntities.Where(e => e.Status == Domain.Entities.JobPostingStatus.Open);
        }

        var dtos = new List<JobPostingDto>();
        foreach (var entity in filteredEntities)
        {
            var department = await _unitOfWork.Departments.GetByIdAsync(entity.DepartmentId, cancellationToken);
            var departmentName = department?.Name ?? string.Empty;

            string? positionTitle = null;
            if (entity.PositionId.HasValue)
            {
                var position = await _unitOfWork.Positions.GetByIdAsync(entity.PositionId.Value, cancellationToken);
                positionTitle = position?.Title;
            }

            string? hiringManagerName = null;
            if (entity.HiringManagerId.HasValue)
            {
                var manager = await _unitOfWork.Employees.GetByIdAsync(entity.HiringManagerId.Value, cancellationToken);
                hiringManagerName = manager != null ? $"{manager.FirstName} {manager.LastName}" : null;
            }

            string? workLocationName = null;
            if (entity.WorkLocationId.HasValue)
            {
                var workLocation = await _unitOfWork.WorkLocations.GetByIdAsync(entity.WorkLocationId.Value, cancellationToken);
                workLocationName = workLocation?.Name;
            }

            dtos.Add(new JobPostingDto
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
            });
        }

        return Result<List<JobPostingDto>>.Success(dtos.OrderByDescending(j => j.PostedDate).ToList());
    }
}
