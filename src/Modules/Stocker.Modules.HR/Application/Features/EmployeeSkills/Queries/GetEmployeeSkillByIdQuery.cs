using MediatR;
using Stocker.Modules.HR.Application.DTOs;
using Stocker.Modules.HR.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.HR.Application.Features.EmployeeSkills.Queries;

/// <summary>
/// Query to get an employee skill by ID
/// </summary>
public record GetEmployeeSkillByIdQuery(int Id) : IRequest<Result<EmployeeSkillDto>>;

/// <summary>
/// Handler for GetEmployeeSkillByIdQuery
/// </summary>
public class GetEmployeeSkillByIdQueryHandler : IRequestHandler<GetEmployeeSkillByIdQuery, Result<EmployeeSkillDto>>
{
    private readonly IHRUnitOfWork _unitOfWork;

    public GetEmployeeSkillByIdQueryHandler(IHRUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<EmployeeSkillDto>> Handle(GetEmployeeSkillByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await _unitOfWork.EmployeeSkills.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
        {
            return Result<EmployeeSkillDto>.Failure(
                Error.NotFound("EmployeeSkill", $"Employee skill with ID {request.Id} not found"));
        }

        var dto = new EmployeeSkillDto
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
        };

        return Result<EmployeeSkillDto>.Success(dto);
    }
}
