using MediatR;

namespace Stocker.Application.Tenants.Queries.GetTenantBySlug;

public class GetTenantBySlugQuery : IRequest<GetTenantBySlugResponse>
{
    public string Slug { get; set; } = string.Empty;
}

public class GetTenantBySlugResponse
{
    public bool Exists { get; set; }
    public bool IsActive { get; set; }
    public Guid? Id { get; set; }
    public string? Name { get; set; }
    public string? Slug { get; set; }
    public string? PrimaryColor { get; set; }
    public string? SecondaryColor { get; set; }
    public string? Logo { get; set; }
    public string? Message { get; set; }
}