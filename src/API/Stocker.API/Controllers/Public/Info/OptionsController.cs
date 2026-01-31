using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace Stocker.API.Controllers.Public
{
    [Route("api/[controller]")]
    [AllowAnonymous]
    public class OptionsController : ControllerBase
    {
        [HttpOptions]
        [Route("{**path}")]
        public IActionResult HandleOptions()
        {
            // Add CORS headers for OPTIONS requests
            var origin = Request.Headers["Origin"].ToString();
            
            if (!string.IsNullOrEmpty(origin))
            {
                Response.Headers.Append("Access-Control-Allow-Origin", origin);
                Response.Headers.Append("Access-Control-Allow-Credentials", "true");
                Response.Headers.Append("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
                Response.Headers.Append("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, X-Requested-With, X-Tenant-Code, X-Tenant-Id, X-Tenant-Subdomain");
                Response.Headers.Append("Access-Control-Max-Age", "3600");
                Response.Headers.Append("Access-Control-Expose-Headers", "*");
            }
            
            return Ok();
        }
    }
}