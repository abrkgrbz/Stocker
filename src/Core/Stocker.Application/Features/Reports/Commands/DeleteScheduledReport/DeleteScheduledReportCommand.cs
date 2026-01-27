using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.DeleteScheduledReport;

public record DeleteScheduledReportCommand(Guid Id) : IRequest<Result<bool>>;
