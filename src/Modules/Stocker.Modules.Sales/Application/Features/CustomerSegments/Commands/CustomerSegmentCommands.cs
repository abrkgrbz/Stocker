using MediatR;
using Stocker.Modules.Sales.Application.DTOs;
using Stocker.SharedKernel.Results;

namespace Stocker.Modules.Sales.Application.Features.CustomerSegments.Commands;

public record CreateCustomerSegmentCommand(CreateCustomerSegmentDto Dto) : IRequest<Result<CustomerSegmentDto>>;

public record SetSegmentPricingCommand(Guid Id, SetSegmentPricingDto Dto) : IRequest<Result>;

public record SetSegmentCreditTermsCommand(Guid Id, SetSegmentCreditTermsDto Dto) : IRequest<Result>;

public record SetSegmentServiceLevelCommand(Guid Id, SetSegmentServiceLevelDto Dto) : IRequest<Result>;

public record SetSegmentEligibilityCommand(Guid Id, SetSegmentEligibilityDto Dto) : IRequest<Result>;

public record SetSegmentBenefitsCommand(Guid Id, SetSegmentBenefitsDto Dto) : IRequest<Result>;

public record SetSegmentVisualCommand(Guid Id, SetSegmentVisualDto Dto) : IRequest<Result>;

public record UpdateSegmentDetailsCommand(Guid Id, UpdateSegmentDetailsDto Dto) : IRequest<Result>;

public record AssignCustomerCommand(Guid Id, AssignCustomerToSegmentDto Dto) : IRequest<Result>;

public record RemoveCustomerFromSegmentCommand(Guid Id, Guid CustomerId) : IRequest<Result>;

public record SetDefaultSegmentCommand(Guid Id) : IRequest<Result>;

public record ActivateSegmentCommand(Guid Id) : IRequest<Result>;

public record DeactivateSegmentCommand(Guid Id) : IRequest<Result>;
