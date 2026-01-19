using Microsoft.Data.SqlClient;
using System.Data;

namespace JwtToken.database
{
    public class userdb
    {
        private readonly IConfiguration _config;
        private readonly string _connStr;

        public userdb(IConfiguration config)
        {
            _config = config;
            _connStr = _config.GetConnectionString("DefaultConnection");
        }

        public IDbConnection CreateConnection() => new SqlConnection(_connStr);
    }
}
