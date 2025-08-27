-- Production kullanıcısının detaylarını kontrol et
SELECT 
    Id,
    Username,
    Email,
    PasswordHash,
    PasswordSalt,
    CreatedAt,
    LastLoginAt,
    IsActive,
    IsEmailVerified,
    EmailVerifiedAt,
    PasswordChangedAt
FROM [master].[MasterUsers]
WHERE Email = 'anilberk1997@hotmail.com';

-- Bu kullanıcının tenant ilişkisini kontrol et
SELECT 
    ut.UserId,
    ut.TenantId,
    ut.Role,
    ut.CreatedDate,
    t.Name as TenantName,
    t.Code as TenantCode,
    t.CreatedAt as TenantCreatedAt
FROM [master].[UserTenants] ut
INNER JOIN [master].[Tenants] t ON ut.TenantId = t.Id
WHERE ut.UserId = (
    SELECT Id FROM [master].[MasterUsers] 
    WHERE Email = 'anilberk1997@hotmail.com'
);