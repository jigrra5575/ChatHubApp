using JwtToken.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;

namespace JwtToken.database
{
    public class userdb :DbContext
    {
        private readonly IConfiguration _config;
        private readonly string _connStr;

        public userdb(IConfiguration config,DbContextOptions<userdb> options) : base(options)
        {
            _config = config;
            _connStr = _config.GetConnectionString("DefaultConnection");
        }


        public IDbConnection CreateConnection() => new SqlConnection(_connStr);

        public DbSet<ChatMembers> ChatMembers { get; set; }
        public DbSet<ChatMessageTable> ChatMessageTable { get; set; }
        public DbSet<GroupNameTable> GroupNameTable{ get; set; }
    }
}
