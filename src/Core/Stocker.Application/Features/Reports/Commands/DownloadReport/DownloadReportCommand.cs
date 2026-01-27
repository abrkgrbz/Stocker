using MediatR;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Reports.Commands.DownloadReport;

public record DownloadReportResult(byte[] Content, string FileName);

public record DownloadReportCommand(
    Guid ReportId,
    string Format = "csv") : IRequest<Result<DownloadReportResult>>;
