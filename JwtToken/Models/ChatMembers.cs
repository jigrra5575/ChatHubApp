
using System.ComponentModel.DataAnnotations;

namespace JwtToken.Models
{
    public class ChatMembers
    {
        [Key]
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? UserPassword { get; set; }
        public int? GroupId { get; set; }
        public string? UserImage { get; set; }
    }
}
