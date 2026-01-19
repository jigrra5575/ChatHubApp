using Dapper;
using JwtToken.database;
using JwtToken.Models;
using Microsoft.EntityFrameworkCore;

namespace JwtToken.repository
{
    public class Repository : IRepository
    {
        private readonly userdb context;

        public Repository( userdb context)
        {
            this.context = context;
        }
        public async  Task<LoginRequest> CheckUserLogin(string email, string password, string userimage, string username)
        {
            using var conn = context.CreateConnection();

            var query = @"SELECT *
                  FROM depperusers
                  WHERE Email = @Email AND Password = @Password";

            return await conn.QueryFirstOrDefaultAsync<LoginRequest>(
                query,
                 new { Email = email, Password = password , Userimage = userimage, Username = username});
        } 
    }
}
