using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JwtToken.Controllers
{
    //@[Authorize\]
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProtectedController : ControllerBase
    {
        [HttpGet("secret")]
        public IActionResult Secret()
        {
            var username = User.FindFirst(ClaimTypes.Name)?.Value;
            //var sub = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            return Ok(new
            {
                message = "Hello, Data is Secured!"
            });
        }
    }
}
