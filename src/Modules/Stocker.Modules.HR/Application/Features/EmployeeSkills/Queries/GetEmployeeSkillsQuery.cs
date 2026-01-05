using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Queries;

/// <summary>
/// Query to get all employee skills
/// </summary>
public record GetEmployeeSkillsQuery : IRequest<Result<List<EmployeeSkillDto>>>
{
    public int? EmployeeId { get; init; }
    public bool ActiveOnly { get; init; } = true;
}

/// <summary>
/// Handler for GetEmployeeSkillsQuery
/// </summary>
public class GetEmployeeSkillsQueryHandler : IRequestHandler<GetEmployeeSkillsQuery, Result<List<EmployeeSkillDto>>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeSkillsQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<List<EmployeeSkillDto>>> Handle(GetEmployeeSkillsQuery request, CancellationToken cancellationToken)
    {
        var entities = await _unitOfWork.EmployeeSkills.GetAllAsync(cancellationToken);

        var filteredEntities = entities.AsEnumerable();

        if (request.EmployeeId.HasValue)
        {
            filteredEntities = filteredEntities.Where(e => e.EmployeeId == request.EmployeeId.Value);
        }

        if (request.ActiveOnly)
        {
            filteredEntities = filteredEntities.Where(e => e.IsActivelyUsed);
        }

        var dtos = filteredEntities.Select(entity => new EmployeeSkillDto
        {
            Id = entity.Id,
            EmployeeId = entity.EmployeeId,
            SkillId = entity.SkillId,
            SkillName = entity.SkillName,
            Category = entity.Category.ToString(),
            SkillType = entity.SkillType.ToString(),
            ProficiencyLevel = entity.ProficiencyLevel.ToString(),
            YearsOfExperience = entity.YearsOfExperience,
            SelfAssessment = entity.SelfAssessment,
            ManagerAssessment = entity.ManagerAssessment,
            LastAssessmentDate = entity.LastAssessmentDate,
            IsVerified = entity.IsVerified,
            VerificationMethod = entity.VerificationMethod?.ToString(),
            VerificationDate = entity.VerificationDate,
            VerifiedByUserId = entity.VerifiedByUserId,
            IsCertified = entity.IsCertified,
            CertificationName = entity.CertificationName,
            CertifyingAuthority = entity.CertifyingAuthority,
            CertificationNumber = entity.CertificationNumber,
            CertificationDate = entity.CertificationDate,
            CertificationExpiryDate = entity.CertificationExpiryDate,
            CertificationUrl = entity.CertificationUrl,
            IsPrimary = entity.IsPrimary,
            IsActivelyUsed = entity.IsActivelyUsed,
            LastUsedDate = entity.LastUsedDate,
            UsageFrequency = entity.UsageFrequency?.ToString(),
            Notes = entity.Notes,
            LearningSource = entity.LearningSource,
            RelatedProjects = entity.RelatedProjects,
            CanMentor = entity.CanMentor,
            CanTrain = entity.CanTrain,
            CreatedAt = entity.CreatedDate,
            UpdatedAt = entity.UpdatedDate
        }).OrderBy(s => s.SkillName).ToList();

        return Result<List<EmployeeSkillDto>>.Success(dtos);
    }
}
