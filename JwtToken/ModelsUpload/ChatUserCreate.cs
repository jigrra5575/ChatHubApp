namespace JwtToken.ModelsUpload
{
    public class ChatUserCreate
    {
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? UserPassword { get; set; }
        public IFormFile? UserImage { get; set; }
        public int? GroupId { get; set; }
    }
    public class CreateGroup
    {
        public string? GroupName { get; set; }
    }
    public class RemoveGroup
    {
        public string? GroupName { get; set; }
    }
}
