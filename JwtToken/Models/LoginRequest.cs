namespace JwtToken.Models
{
    public class LoginRequest
    {
        public int UserId { get; set; }
        public string? UserName { get; set; } 
        public string? Password { get; set; }
        public string? Userimage { get; set; }
    }
}
