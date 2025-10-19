using MediatR;
using Stocker.Modules.CRM.Application.DTOs;
using Stocker.Modules.CRM.Application.Features.CustomerTags.Commands;
using Stocker.Modules.CRM.Domain.Entities;
using Stocker.Modules.CRM.Domain.Repositories;
using Stocker.SharedKernel.Interfaces;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.CRM.Application.Features.CustomerTags.Handlers;

public class AddCustomerTagCommandHandler : IRequestHandler<AddCustomerTagCommand, Result<CustomerTagDto>>
{
    private readonly ICustomerTagRepository _tagRepository;
    private readonly IUnitOfWork _unitOfWork;

    public AddCustomerTagCommandHandler(
        ICustomerTagRepository tagRepository,
        IUnitOfWork unitOfWork)
    {
        _tagRepository = tagRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<CustomerTagDto>> Handle(AddCustomerTagCommand request, CancellationToken cancellationToken)
    {
        // Check if tag already exists for this customer
        var existingTag = await _tagRepository.GetByCustomerAndTagAsync(
            request.CustomerId,
            request.Tag,
            cancellationToken);

        if (existingTag != null)
        {
            return Result<CustomerTagDto>.Failure(
                Error.Conflict("CustomerTag.AlreadyExists", "This tag already exists for the customer"));
        }

        // Create new tag
        var tag = new CustomerTag(
            tenantId: request.TenantId,
            customerId: request.CustomerId,
            tag: request.Tag,
            createdBy: request.CreatedBy,
            color: request.Color);

        await _tagRepository.AddAsync(tag, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new CustomerTagDto
        {
            Id = tag.Id,
            TenantId = tag.TenantId,
            CustomerId = tag.CustomerId,
            Tag = tag.Tag,
            Color = tag.Color,
            CreatedBy = tag.CreatedBy,
            CreatedAt = DateTime.UtcNow
        };

        return Result<CustomerTagDto>.Success(dto);
    }
}
