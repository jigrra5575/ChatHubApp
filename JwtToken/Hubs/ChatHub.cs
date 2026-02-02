using JwtToken.database;
using JwtToken.Models;
using JwtToken.ModelsUpload;
using JwtToken.repository;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System;

namespace JwtToken.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        public ChatHub(IRepository repo, userdb db)
        {
            this.repo = repo;
            this.db = db;
        }

        // 🔹 Group join
        private readonly IRepository repo;
        private readonly userdb db;

        //private static Dictionary<string, List<string>> membercount = new();
        public async Task JoinGroup(string groupName, string user, string id)
        {
            var parseID = Convert.ToInt32(id);
            try
            {
                // 1. ચેક કરો કે ગ્રુપ ડેટાબેઝમાં છે કે નહીં
                var group = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == groupName);

                if (group == null)
                {
                    // જો ગ્રુપ નથી, તો નવું બનાવો
                    await repo.CreateGroup(new CreateGroup { GroupName = groupName });
                    // નવું બનેલું ગ્રુપ ફરીથી મેળવો જેથી તેની નવી ID મળે
                    group = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == groupName);
                }

                if (group == null) return;

                // મહત્વનું: જો બહારથી મળેલી id 0 હોય, તો ડેટાબેઝની નવી ID વાપરો
                int finalGroupId = (parseID == 0) ? group.GroupId : parseID;

                // 2. યુઝરને ચેક કરો (શું તે આ ગ્રુપમાં પહેલેથી છે?)
                var existingMember = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user && (x.GroupId == null || x.GroupId == finalGroupId));

                if (existingMember != null)
                {
                    // જો યુઝર પહેલેથી છે, તો ફક્ત તેની GroupId અપડેટ કરો
                    existingMember.GroupId = finalGroupId;
                    db.ChatMembers.Update(existingMember);
                }
                else
                {
                    // જો નવો યુઝર હોય, તો નવો રેકોર્ડ ઉમેરો
                    var newMember = new ChatMembers
                    {
                        UserName = user,
                        UserEmail = existingMember.UserEmail,
                        UserPassword = existingMember.UserPassword,
                        UserImage = existingMember.UserImage,
                        GroupId = finalGroupId
                    };
                    db.ChatMembers.Add(newMember);
                }

                await db.SaveChangesAsync();

                // 3. લિસ્ટ મેળવો (નવી અપડેટ થયેલી ID મુજબ)
                var allMembers = await db.ChatMembers
                                         .Where(x => x.GroupId == finalGroupId)
                                         .Select(x => x.UserName)
                                         .ToListAsync();
                // ગ્રુપના છેલ્લા 50 મેસેજ મેળવો (તમારા ટેબલમાં GroupId હોવું જરૂરી છે)
                var history = await db.ChatMessageTable
                    .Where(m => m.GroupId == finalGroupId)
                    .OrderBy(m => m.Timestamp)
                    .Select(m => new
                    {
                        user = m.SenderName,
                        message = m.ChatMessage,
                        image = m.ChatImage,
                        pdf = m.ChatPDF,
                        audio = m.ChatAudio,
                        timestamp = m.Timestamp,
                        isOld = true,
                        messageid = m.ChatId,
                        reaction = m.Reaction
                    })
                    .Take(100)
                    .ToListAsync();


                // 4. SignalR Actions
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                await Clients.Group(groupName).SendAsync("GroupMembers", allMembers);
                await Clients.Group(groupName).SendAsync("UserJoined", user, groupName);
                // માત્ર જે યુઝર જોઈન થયો છે તેને જ હિસ્ટ્રી મોકલો
                await Clients.Group(groupName).SendAsync("ReceiveChatHistory", history);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in JoinGroup: {ex.Message}");
            }
        }

        // 🔹 Group leave
        public async Task LeaveGroup(string groupName, string user)
        {
            try
            {
                // 1. પેલા ગ્રુપની વિગત મેળવો
                var group = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == groupName);

                if (group != null)
                {
                    // 2. આ યુઝરને શોધો
                    var member = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user && x.GroupId == group.GroupId);

                    if (member != null)
                    {
                        // ડેટાબેઝમાંથી ડીલીટ નથી કરવું, ફક્ત ગ્રુપમાંથી બહાર કાઢવો છે
                        member.GroupId = null; // અથવા 0, જો તમારી કોલમ int (non-nullable) હોય

                        db.ChatMembers.Update(member);
                        await db.SaveChangesAsync();

                        Console.WriteLine($"Database: User {user} updated (GroupId set to null).");
                    }

                    // 3. હવે આ ગ્રુપમાં ખરેખર કેટલા લોકો બાકી છે તેનું નવું લિસ્ટ બનાવો
                    var updatedMembers = await db.ChatMembers
                                                 .Where(x => x.GroupId == group.GroupId) // જેની ID હજુ પણ આ ગ્રુપની છે
                                                 .Select(x => x.UserName)
                                                 .ToListAsync();

                    // 4. બાકીના મેમ્બર્સને નવું લિસ્ટ મોકલો (આનાથી UI અપડેટ થશે)
                    await Clients.Group(groupName).SendAsync("GroupMembers", updatedMembers);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }

            // 5. SignalR કનેક્શન તોડો
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("UserLeft", user, groupName);
        }

        public async Task SignOutGroup(string groupName, string user)
        {
            // 1. પેલા ગ્રુપની વિગત મેળવો
            var group = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == groupName);

            if (group != null)
            {
                // 2. આ યુઝરને ChatMembers ટેબલમાંથી શોધીને ડીલીટ કરો
                var member = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user && x.GroupId == group.GroupId);

                if (member != null)
                {
                    db.ChatMembers.Remove(member);  // jo specialy buttonn click kre to
                    await db.SaveChangesAsync();
                }

                // 3. હવે ચેક કરો કે આ ગ્રુપમાં કેટલા મેમ્બર બાકી રહ્યા?
                var remainingCount = await db.ChatMembers.CountAsync(x => x.GroupId == group.GroupId);

                if (remainingCount == 0)
                {
                    // જો છેલ્લો યુઝર પણ નીકળી ગયો હોય, તો ગ્રુપ જ ડિલીટ કરી નાખો
                    db.GroupNameTable.Remove(group);
                    await db.SaveChangesAsync();

                    // તમારી SP વાળી સર્વિસ પણ કોલ કરી શકાય
                    // await _repo.RemoveGroup(new CreateGroup { GroupName = groupName });
                }
                else
                {
                    // જો મેમ્બર્સ બાકી હોય, તો નવું લિસ્ટ બધાને મોકલો
                    var updatedMembers = await db.ChatMembers
                                                 .Where(x => x.GroupId == group.GroupId)
                                                 .Select(x => x.UserName)
                                                 .ToListAsync();

                    await Clients.Group(groupName).SendAsync("GroupMembers", updatedMembers);
                }
            }

            // 4. SignalR માંથી રીમૂવ કરો
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("UserLeft", user, groupName);
        }

        // 🔹 Send message to group
        public async Task SendGroupMessage(string groupName, string user, string message)
        {
            try
            {
                // ૧. યુઝરની વિગત મેળવો (UserId માટે)
                var userDetail = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user);

                // ૨. મેસેજ ઓબ્જેક્ટ તૈયાર કરો
                var newmessage = new ChatMessageTable
                {
                    ChatMessage = message,
                    SenderName = user,
                    UserId = userDetail?.UserId ?? 0,
                    Timestamp = DateTime.Now,
                    GroupId = userDetail?.GroupId ?? 0
                };

                // ૩. Repository દ્વારા સેવ કરો
                await repo.SaveMessage(newmessage);
                var messageId = newmessage.ChatId;

                // ૪. હવે ગ્રુપના બધા મેમ્બર્સને મેસેજ મોકલો (સાથે સમય પણ મોકલી શકાય)
                //await Clients.Group(groupName).SendAsync("ReceiveGroupMessage", user, message, chatMsg.Timestamp);
                await Clients.Group(groupName).SendAsync("ReceiveGroupMessage", user, message, messageId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving message: {ex.Message}");
            }

        }

        //typing indicator
        public async Task Typing(string group, string user)
        {
            await Clients.OthersInGroup(group).SendAsync("UserTyping", user);
        }

        public async Task SendFileMessage(string group, string user, string fileName, byte[] fileUrl, string filesize)
        {
            try
            {
                var groupdetail = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == group);

                var userdetail = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user && (x.GroupId == null || x.GroupId == x.GroupId));

                var chatMsg = new ChatMessageTable
                {
                    ChatImage = fileUrl, // અંહી પ્યોર બાઈનરી ડેટા સેવ થશે
                    ChatMessage = $"ImageFile_" + fileName,
                    SenderName = user,
                    Timestamp = DateTime.Now,
                    UserId = userdetail?.UserId ?? 0,
                    GroupId = groupdetail.GroupId,
                    Filesize = filesize
                };

                db.ChatMessageTable.Add(chatMsg);
                await db.SaveChangesAsync();
                var messageId = chatMsg.ChatId;

                // પાછું મોકલતી વખતે Base64 માં મોકલો જેથી UI બતાવી શકે
                string base64 = Convert.ToBase64String(fileUrl);
                await Clients.Group(group).SendAsync("ReceiveFile", user, fileName, base64, filesize, messageId);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
            //await Clients.Group(group).SendAsync("ReceiveFile", user, fileName, fileUrl, filesize);
        }

        public async Task SendPDFFile(string group, string user, string fileName, byte[] fileUrl, string filesize)
        {
            string convertedFile = "";
            try
            {
                var groupdetail = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == group);

                var userdetail = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user && (x.GroupId == null || x.GroupId == groupdetail.GroupId));

                var extension = Path.GetExtension(fileName).ToLower();
                var chatMsg = new ChatMessageTable
                {
                    SenderName = user,
                    ChatMessage = $"PDFFile_" + fileName,
                    Timestamp = DateTime.Now,
                    ChatPDF = fileUrl,
                    UserId = userdetail?.UserId ?? 0,
                    GroupId = groupdetail.GroupId,
                    Filesize = filesize
                };


                // Extension મુજબ સાચી કોલમમાં ડેટા નાખો
                if (extension == ".pdf")
                {
                    convertedFile = Convert.ToBase64String(fileUrl);
                }

                db.ChatMessageTable.Add(chatMsg);
                var messageId = chatMsg.ChatId;
                await db.SaveChangesAsync();

                // UI ને પાછો ડેટા મોકલો
                await Clients.Group(group).SendAsync("ReceivePDF", user, fileName, convertedFile, filesize, messageId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            //await Clients.Group(group).SendAsync("ReceivePDF", user, fileName, fileUrl, filesize);
        }

        public async Task SendAudioFile(string group, string user, string filename, byte[] fileUrl, string filesize)
        {

            string convertedFile = "";
            try
            {
                var groupdetail = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == group);

                var userdetail = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user && (x.GroupId == null || x.GroupId == groupdetail.GroupId));

                var extension = Path.GetExtension(filename).ToLower();

                // ૧. લિસ્ટ પ્રોપરલી ડિફાઈન કરો
                var audioExtensions = new List<string> { ".wav", ".ogg", ".m4a", ".mp3", ".webm" };

                // ૨. ચેક કરો કે એક્સ્ટેંશન આ લિસ્ટમાં છે કે નહીં
                if (audioExtensions.Contains(extension.ToLower()))
                {
                    // ૩. જો ઓડિયો હોય તો ChatAudio કોલમમાં સેવ કરો
                    convertedFile = Convert.ToBase64String(fileUrl);
                }

                var chatMsg = new ChatMessageTable
                {
                    SenderName = user,
                    ChatMessage = $"AudioFile_" + filename,
                    Timestamp = DateTime.Now,
                    ChatAudio = fileUrl,
                    UserId = userdetail?.UserId ?? 0,
                    GroupId = groupdetail.GroupId,
                    Filesize = filesize
                };

                db.ChatMessageTable.Add(chatMsg);
                var messageId = chatMsg.ChatId;
                await db.SaveChangesAsync();

                // UI ને પાછો ડેટા મોકલો
                await Clients.Group(group).SendAsync("RecieveAudio", user, filename, convertedFile, filesize, messageId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            //await Clients.Group(group).SendAsync("RecieveAudio", user, filename, fileUrl, filesize);
        }

        public async Task SendRecordingMessage(string group, string user, string filename, byte[] RecordingUrl, string filesize, int duration)
        {
            string convertedFile = "";
            try
            {
                var groupdetail = await db.GroupNameTable.FirstOrDefaultAsync(x => x.GroupName == group);

                var userdetail = await db.ChatMembers.FirstOrDefaultAsync(x => x.UserName == user && (x.GroupId == null || x.GroupId == groupdetail.GroupId));

                var extension = Path.GetExtension(filename).ToLower();

                // ૧. લિસ્ટ પ્રોપરલી ડિફાઈન કરો
                var audioExtensions = new List<string> { ".webm" };

                // ૨. ચેક કરો કે એક્સ્ટેંશન આ લિસ્ટમાં છે કે નહીં
                if (audioExtensions.Contains(extension.ToLower()))
                {
                    // ૩. જો ઓડિયો હોય તો ChatAudio કોલમમાં સેવ કરો
                    convertedFile = Convert.ToBase64String(RecordingUrl);
                }

                var chatMsg = new ChatMessageTable
                {
                    SenderName = user,
                    ChatMessage = $"Recording _File_" + filename,
                    Timestamp = DateTime.Now,
                    ChatAudio = RecordingUrl,
                    UserId = userdetail?.UserId ?? 0,
                    GroupId = groupdetail.GroupId,
                    Filesize = filesize
                };

                db.ChatMessageTable.Add(chatMsg);
                var messageId = chatMsg.ChatId;
                await db.SaveChangesAsync();

                // UI ને પાછો ડેટા મોકલો
                await Clients.Group(group).SendAsync("RecieveRecording", user, filename, convertedFile, filesize, messageId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
            }
            //await Clients.Group(group).SendAsync("RecieveRecording", user, fileName, RecordingUrl, filesize, duration);
        }

        public async Task SendReaction(string groupName, int msgId, string emoji, string reactuser)
        {
            var message = await db.ChatMessageTable.FindAsync(msgId);
            if (message != null)
            {
                if (message.Reaction != null)
                {
                    message.Reaction = message.Reaction + "|" + emoji + "-" + reactuser; // મેસેજ પર ઈમોજી અપડેટ કરો
                }
                else
                {
                    message.Reaction = emoji + "-" + reactuser; // મેસેજ પર ઈમોજી અપડેટ કરો

                }


                await db.SaveChangesAsync();

                // બધાને જાણ કરો કે આ મેસેજ પર આ ઈમોજી આવ્યું
                await Clients.Group(groupName).SendAsync("UpdateReaction", msgId, emoji, reactuser);
            }
        }
        public async Task DeleteReaction(string groupName, int msgId, string emoji, string reactuser)
        {
            var message = await db.ChatMessageTable.FindAsync(msgId);
            //var filterReaction  = db.ChatMessageTable.FirstOrDefaultAsync(x => x.Reaction != )
            if (message != null)
            {
                message.Reaction = null;
                await db.SaveChangesAsync();
                // બધાને જાણ કરો કે આ મેસેજ પર આ ઈમોજી આવ્યું
                await Clients.Group(groupName).SendAsync("UpdateReaction", msgId, emoji, reactuser);
            }
        }

    }
}
