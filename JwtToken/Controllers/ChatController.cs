using JwtToken.database;
using JwtToken.ModelsUpload;
using JwtToken.repository;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JwtToken.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly userdb userdb;
        private readonly IRepository repo;

        public ChatController(userdb userdb, IRepository repo)
        {
            this.userdb = userdb;
            this.repo = repo;
        }

        [HttpGet]
        [Route("GetAllUser")]
        public async Task<IActionResult> GetAllUser()
        {
            // જો હજુ પણ ડર હોય કે ડેટા નથી, તો આ રીતે ચેક કરી શકાય
            if (userdb.ChatMembers == null) return NotFound("Table not found");

            var members = await userdb.ChatMembers.ToListAsync();
            return Ok(members);
        }

        [HttpGet]
        [Route("GetAllGroup")]
        public async Task<IActionResult> GetAllGroup()
        {
            // જો હજુ પણ ડર હોય કે ડેટા નથી, તો આ રીતે ચેક કરી શકાય
            if (userdb.GroupNameTable == null) return NotFound("Table not found");

            var Groups = await userdb.GroupNameTable.ToListAsync();
            return Ok(Groups);
        }

        [HttpPost]
        [Route("ChatCreateUser")]
        //[ https://localhost:7249/api/Chat/ChatCreateUser ]
        public async Task<IActionResult> ChatCreateUser([FromForm] ChatUserCreate chatUser)
        {
            var result = await repo.AddChatUser(chatUser);

            if (result == "USER_ALREADY_EXISTS")
                return Ok(new { message = "User already exists" });

            if (result == "FILE_TOO_LARGE")
                return Ok(new { message = "File size > 2MB" });

            return Ok(new { message = result });
        }

        [HttpPost]
        [Route("CreateGroupName")]
        public async Task<IActionResult> CreateGroupName([FromForm] CreateGroup group)
        {
            var creategroup = await repo.CreateGroup(group);
            if(creategroup != "GROuP CREATE Successfully...")
            {
                return Ok(new { message = "Group Are Not Created Something Went Wromg !" });
            }

            return Ok(new { message = "Create Group Succesfully..." });
        }

        [HttpDelete]
        [Route("MessageDelete")]
        public async Task<IActionResult> MessageDelete(int id)
        {
            await repo.DeleteMessage(id);

            return Ok(new { message = "Delete Message Succesfully..." });
        }
    }
}
