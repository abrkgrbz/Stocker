using MediatR;
using Microsoft.AspNetCore.Mvc;
using Stocker.Application.Interfaces.Repositories;
using Swashbuckle.AspNetCore.Annotations;

namespace Stocker.API.Controllers.Master;

[SwaggerTag("Master Admin Panel - Tenant Users")]
public class UsersController : MasterControllerBase
{
    private readonly IUserRepository _userRepository;

    public UsersController(
        IUserRepository userRepository,
        IMediator mediator,
        ILogger<UsersController> logger)
        : base(mediator, logger)
    {
        _userRepository = userRepository;
    }

    /// <summary>
    /// Get all users with pagination and search
    /// </summary>
    [HttpGet]
    [SwaggerOperation(Summary = "Kullanıcı listesi", Description = "Tüm kullanıcıları sayfalama ve arama ile getirir")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    public async Task<IActionResult> GetUsers(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? searchTerm = null)
    {
        try
        {
            _logger.LogInformation("Kullanıcılar getiriliyor. Sayfa: {Page}, Boyut: {PageSize}, Arama: {Search}",
                page, pageSize, searchTerm ?? "yok");

            var users = await _userRepository.GetMasterUsersAsync(page, pageSize, searchTerm);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = users,
                Message = "Kullanıcılar başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kullanıcılar getirilirken hata oluştu");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcılar getirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get user by ID
    /// </summary>
    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "Kullanıcı detayı", Description = "ID ile kullanıcı detaylarını getirir")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetUser(string id)
    {
        try
        {
            _logger.LogInformation("Kullanıcı detayı getiriliyor. ID: {UserId}", id);

            var user = await _userRepository.GetMasterUserByIdAsync(id);

            if (user == null)
            {
                _logger.LogWarning("Kullanıcı bulunamadı. ID: {UserId}", id);
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = user,
                Message = "Kullanıcı başarıyla getirildi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kullanıcı detayı getirilirken hata oluştu. ID: {UserId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı detayı getirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Toggle user active status
    /// </summary>
    [HttpPost("{id}/toggle-status")]
    [SwaggerOperation(Summary = "Kullanıcı durumu değiştir", Description = "Kullanıcının aktif/pasif durumunu değiştirir")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ToggleUserStatus(string id)
    {
        try
        {
            _logger.LogInformation("Kullanıcı durumu değiştiriliyor. ID: {UserId}", id);

            var result = await _userRepository.ToggleMasterUserStatusAsync(id);

            if (!result)
            {
                _logger.LogWarning("Kullanıcı bulunamadı. ID: {UserId}", id);
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı bulunamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Kullanıcı durumu başarıyla değiştirildi. ID: {UserId}", id);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { userId = id },
                Message = "Kullanıcı durumu başarıyla güncellendi",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Kullanıcı durumu değiştirilirken hata oluştu. ID: {UserId}", id);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Kullanıcı durumu değiştirilirken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Assign tenant to user
    /// </summary>
    [HttpPost("{userId}/assign-tenant/{tenantId}")]
    [SwaggerOperation(Summary = "Tenant ata", Description = "Kullanıcıya tenant atar")]
    [ProducesResponseType(typeof(ApiResponse<object>), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AssignTenantToUser(string userId, Guid tenantId)
    {
        try
        {
            _logger.LogInformation("Kullanıcıya tenant atanıyor. UserId: {UserId}, TenantId: {TenantId}", userId, tenantId);

            var result = await _userRepository.AssignTenantToUserAsync(userId, tenantId);

            if (!result)
            {
                _logger.LogWarning("Kullanıcı veya tenant bulunamadı. UserId: {UserId}, TenantId: {TenantId}", userId, tenantId);
                return NotFound(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kullanıcı veya tenant bulunamadı",
                    Timestamp = DateTime.UtcNow
                });
            }

            _logger.LogInformation("Tenant başarıyla atandı. UserId: {UserId}, TenantId: {TenantId}", userId, tenantId);

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Data = new { userId, tenantId },
                Message = "Tenant kullanıcıya başarıyla atandı",
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Tenant atanırken hata oluştu. UserId: {UserId}, TenantId: {TenantId}", userId, tenantId);
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "Tenant atanırken hata oluştu",
                Timestamp = DateTime.UtcNow
            });
        }
    }
}
