using JwtToken.Models;
using JwtToken.ModelsUpload;

namespace JwtToken.repository
{
    public interface IRepository
    {
        Task<LoginRequest> CheckUserLogin(string email, string password, string? userimage, string? username);
        public  Task<string> AddChatUser(ChatUserCreate user);
        //public Task<string> GetByIdChatUser(ChatUserCreate usercreate);
        public Task<string> RemoveChatUser(string id);


        //group 
        public Task<string> CreateGroup(CreateGroup model);
        public Task<string> RemoveGroup(CreateGroup model);

        //send message
        public  Task SaveMessage(ChatMessageTable newmessage);

        //Delete message

        public Task DeleteMessage(int id);
    }
}
