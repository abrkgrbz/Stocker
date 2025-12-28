using MediatR;
using Stocker.Application.Common.Interfaces;
using Stocker.Domain.Migration.Enums;
using Stocker.SharedKernel.Results;

namespace Stocker.Application.Features.Tenant.DataMigration.Queries;

public class GetExcelTemplateQuery : IRequest<Result<ExcelTemplateResponse>>
{
    public string EntityType { get; set; } = string.Empty;
}

public class ExcelTemplateResponse
{
    public byte[] FileContent { get; set; } = Array.Empty<byte>();
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
}

public class GetExcelTemplateQueryHandler : IRequestHandler<GetExcelTemplateQuery, Result<ExcelTemplateResponse>>
{
    private readonly IExcelTemplateGenerator _templateGenerator;

    public GetExcelTemplateQueryHandler(IExcelTemplateGenerator templateGenerator)
    {
        _templateGenerator = templateGenerator;
    }

    public Task<Result<ExcelTemplateResponse>> Handle(GetExcelTemplateQuery request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<MigrationEntityType>(request.EntityType, true, out var entityType))
        {
            return Task.FromResult(Result<ExcelTemplateResponse>.Failure(
                Error.Validation("InvalidEntityType", $"Geçersiz veri türü: {request.EntityType}")));
        }

        var (fileContent, fileName, contentType) = _templateGenerator.GenerateTemplate(entityType);

        return Task.FromResult(Result<ExcelTemplateResponse>.Success(new ExcelTemplateResponse
        {
            FileContent = fileContent,
            FileName = fileName,
            ContentType = contentType
        }));
    }
}
