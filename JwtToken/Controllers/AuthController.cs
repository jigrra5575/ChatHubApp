using JwtToken.Models;
using JwtToken.repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JwtToken.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IRepository repository;

        public AuthController(IConfiguration config , IRepository repository)
        {
             _config = config;
            this.repository = repository;
        }


        //private bool IsValidUserCredentials(string username, string password, out string userId)
        //{
        //    // demo: accept user: "jigrra", pass: "password"
        //    if (username == "jigrra" && password == "jigar@123")
        //    {
        //        userId = "101";
        //        return true;
        //    }
        //    userId = "";
        //    return false;
        //}

        //private string GenerateJwtToken(string username, string userId)
        //{
        //    var jwtSection = _config.GetSection("JwtSettings");
        //    var key = jwtSection["Key"]!;
        //    var issuer = jwtSection["Issuer"];
        //    var audience = jwtSection["Audience"];
        //    var expiryMinutes = int.Parse(jwtSection["ExpiryMinutes"] ?? "60");

        //     //🔑 DEBUGGING: Print the Key used for Generation
        //    Console.WriteLine($"\n================ JWT GENERATION KEY CHECK ================");
        //    Console.WriteLine($"GENERATION KEY STRING: {key}");
        //    Console.WriteLine($"GENERATION KEY LENGTH: {Encoding.UTF8.GetBytes(key).Length} bytes");
        //    Console.WriteLine("==========================================================\n");


        //    var claims = new[]
        //    {
        //    new Claim(JwtRegisteredClaimNames.Sub, userId),
        //    new Claim(JwtRegisteredClaimNames.UniqueName, username),
        //    new Claim("role", "User")
        //};

        //    var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        //    var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        //    var token = new JwtSecurityToken(
        //        issuer: issuer,
        //        audience: audience,
        //        claims: claims,
        //        notBefore: DateTime.UtcNow,
        //        expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
        //        signingCredentials: creds
        //    );

        //    return new JwtSecurityTokenHandler().WriteToken(token);
        //}
        
        private object GenerateJwtToken(string userName)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JwtSettings:key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            // ક્લેમ્સ (Payload) ઉમેરો
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userName),
                new Claim(ClaimTypes.Name, userName),
                //new Claim(ClaimTypes.Role, "User") // રોલ ઉમેર્યો
            };

            // ટોકન ડિસ્ક્રિપ્ટર બનાવો
            var token = new JwtSecurityToken(
                issuer: null,
                audience: null,
                claims: null,
                expires: DateTime.Now.AddHours(1), // 1 કલાકમાં સમાપ્ત
                signingCredentials: credentials);


            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        [HttpPost("login")]
        public async  Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            //if(IsValidUserCredentials(req.Username,req.Password,out var userId))
            //{
            //    var token = GenerateJwtToken(req.Username, userId);
            //    return Ok(new { token });
            //}

            //    if(req.UserName == "jigrra" && req.Password == "jigar@123")
            //    {
            //        var tockenString = GenerateJwtToken(req.UserName);
            //        return Ok(new { token = tockenString });
            //    }
            //    return Unauthorized(new { message = "Invalid credentials" });

            var user = await repository.CheckUserLogin(req.UserName, req.Password , req.Userimage , req.UserName);

            if (user == null)
                return Unauthorized(new { message = "Invalid credentials" });

            var token = GenerateJwtToken(user.UserName);
            var img = user.Userimage;
            var username = user.UserName;

            return Ok(new { token , img, username});

        }
    }
}
