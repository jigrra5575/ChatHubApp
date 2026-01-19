using JwtToken.Models;

namespace JwtToken.repository
{
    public interface IRepository
    {
        Task<LoginRequest> CheckUserLogin(string email, string password, string? userimage, string? username);
    }
}
