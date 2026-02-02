using System.ComponentModel.DataAnnotations;

namespace JwtToken.Models
{
    public class GroupNameTable
    {
        [Key]
        public int GroupId { get; set; }
        public string? GroupName { get; set; }

    }
}
