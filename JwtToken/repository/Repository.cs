using Dapper;
using JwtToken.database;
using JwtToken.Models;
using JwtToken.ModelsUpload;
using Microsoft.Data.SqlClient;
using System.Data;

namespace JwtToken.repository
{
    public class Repository : IRepository
    {
        public string connectionstring = "Server=DESKTOP-ULCQKM6\\SQLEXPRESS;Database=dapperapi;Integrated Security=True;TrustServerCertificate=True;";

        private readonly userdb context;

        public Repository(userdb context)
        {
            this.context = context;
        }
        public async Task<LoginRequest> CheckUserLogin(string email, string password, string userimage, string username)
        {
            using var conn = context.CreateConnection();

            var query = @"SELECT *FROM ChatMembers WHERE  UserEmail = @Email AND UserPassword= @Password";

            return await conn.QueryFirstOrDefaultAsync<LoginRequest>(
                query,
                 new { Email = email, Password = password, Userimage = userimage, Username = username });
        }

        public async Task<string> AddChatUser(ChatUserCreate user)
        {
            byte[]? imageData = null;

            if (user.UserImage != null && user.UserImage.Length > 0)
            {
                if (user.UserImage.Length > 2 * 1024 * 1024)
                    return "FILE_TOO_LARGE";

                using var ms = new MemoryStream();
                await user.UserImage.CopyToAsync(ms);
                imageData = ms.ToArray();
            }

            string? imageBase64 = imageData != null
                ? Convert.ToBase64String(imageData)
                : null;
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionstring))
                {
                    SqlCommand cmd = new SqlCommand("sp_ChatCreateUser", conn);
                    cmd.CommandType = CommandType.StoredProcedure;


                    cmd.Parameters.AddWithValue("@Username", user.UserName);
                    cmd.Parameters.AddWithValue("@UserEmail", user.UserEmail);
                    cmd.Parameters.AddWithValue("@UserPassword", user.UserPassword);
                    cmd.Parameters.AddWithValue("@UserImage", imageBase64);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return "Register Successfully...";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "USER_ALREADY_EXISTS";
            }
        }

        public async Task<string> RemoveChatUser(string id)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionstring))
                {
                    SqlCommand cmd = new SqlCommand("sp_RemoveUser", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    var parsIntID = Convert.ToInt32(id);
                    cmd.Parameters.AddWithValue("@userId", parsIntID);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return "Delete Successfully...";
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return "SOME THING WRONG !";
            }
        }

        public async Task<string> CreateGroup(CreateGroup model)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionstring))
                {
                    SqlCommand cmd = new SqlCommand("sp_CreateGroup", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@GroupName", model.GroupName);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return "GROuP CREATE Successfully...";
            }
            catch
            {
                return "something went wrong...!";
            }
        }
        public async Task<string> RemoveGroup(CreateGroup model)
        {
            try
            {
                using (SqlConnection conn = new SqlConnection(connectionstring))
                {
                    SqlCommand cmd = new SqlCommand("sp_RemoveGroup", conn);
                    cmd.CommandType = CommandType.StoredProcedure;

                    cmd.Parameters.AddWithValue("@GroupName", model.GroupName);

                    await conn.OpenAsync();
                    await cmd.ExecuteNonQueryAsync();
                }
                return "GROuP Remove Successfully...";
            }
            catch
            {
                return "something went wrong...!";
            }
        }

        public async Task SaveMessage(ChatMessageTable newmessage)
        {
            newmessage.Timestamp = DateTime.Now;

            context.ChatMessageTable.Add(newmessage);
            await context.SaveChangesAsync();
        }

        public async Task DeleteMessage(int id)
        {
            var message =  context.ChatMessageTable.Find(id);
             context.ChatMessageTable.Remove(message);
            await context.SaveChangesAsync();

        }
    }
}
