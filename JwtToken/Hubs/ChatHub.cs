using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace JwtToken.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        // 🔹 Group join
        private static Dictionary<string, List<string>> membercount = new();

        public async Task JoinGroup(string groupName, string user)
        {
            if (!membercount.ContainsKey(groupName))
                membercount[groupName] = new List<string>();

            membercount[groupName].Add(user);

            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            await Clients.Group(groupName).SendAsync("UserJoined", user, groupName);

            // Send full member list to newly joined user
            await Clients.Group(groupName).SendAsync("GroupMembers", membercount[groupName]);

        }

        // 🔹 Group leave
        public async Task LeaveGroup(string groupName, string user)
        {
            if (membercount.ContainsKey(groupName))
            {
                membercount[groupName].Remove(user);
            }

            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            await Clients.Group(groupName).SendAsync("GroupMembers", membercount[groupName]);

            await Clients.Group(groupName).SendAsync("UserLeft", user, groupName);
        }

        // 🔹 Send message to group
        public async Task SendGroupMessage(string groupName, string user, string message  )
        {
            await Clients.Group(groupName)
                .SendAsync("ReceiveGroupMessage", user, message);
        }

        //typing indicator
        public async Task Typing(string group, string user)
        {
            await Clients.OthersInGroup(group)
                .SendAsync("UserTyping", user);
        }
    }
}
