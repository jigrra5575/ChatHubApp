using Microsoft.EntityFrameworkCore.Query.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JwtToken.Models
{
    [Table("ChatMessageTable")]
    public class ChatMessageTable
    {
        [Key]
        public int ChatId { get; set; }
        public string? ChatMessage { get; set; }
        public string? Reaction { get; set; }
        public byte[]? ChatImage{ get; set; }
        public byte[]? ChatAudio{ get; set; }
        public byte[]? ChatPDF{ get; set; }
        public int? UserId{ get; set; }
        public int GroupId{ get; set; }
        public string? SenderName { get; set; }
        public string? Filesize{ get; set; }
        public DateTime? Timestamp{ get; set; }
    }
}
