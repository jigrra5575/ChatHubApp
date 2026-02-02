using Microsoft.AspNetCore.Mvc;

namespace JwtToken.Controllers
{
    //[Route("api/[controller]")]
    //[ApiController]

    public class UploadController : ControllerBase
    {
        [HttpPost]
        [Route("/uploadfile")]
        public async Task<IActionResult> Upload(IFormFile file, string group, string user)
        {
            if (file == null || file.Length == 0) return BadRequest();

            long bytes = file.Length;
            string filesize;

            if (bytes < 1024 * 1024)
            {
                filesize = $"{Math.Round(bytes / 1024.0, 2)} KB";
            }
            else
            {
                filesize = $"{Math.Round(bytes / (1024.0 * 1024), 2)} MB";
            }

            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                byte[] fileBytes = ms.ToArray();

                // ફાઈલને Base64 માં ફેરવીને UI ને મોકલો જેથી તે તરત બતાવી શકાય
                string base64String = Convert.ToBase64String(fileBytes);
                string fileType = file.ContentType;

                return Ok(new
                {
                    user,
                    group,
                    fileName = file.FileName,
                    binaryData = fileBytes, // Hub માટે
                    base64 = $"data:{fileType};base64,{base64String}", // UI માટે
                    filesize
                });
            }

            //// ફાઈલ null છે કે નહિ
            //if (file == null || file.Length == 0)
            //    return BadRequest("File missing");

            //// wwwroot/uploads path
            //var uploadPath = Path.Combine(
            //    Directory.GetCurrentDirectory(),
            //    "wwwroot",
            //    "uploads",
            //    "Images"
            //);

            //// folder ન હોય તો બનાવો
            //if (!Directory.Exists(uploadPath))
            //    Directory.CreateDirectory(uploadPath);


            //long bytes = file.Length;

            //string filesize;

            //if (bytes < 1024 * 1024)
            //{
            //    filesize = $"{Math.Round(bytes / 1024.0, 2)} KB";
            //}
            //else
            //{
            //    filesize = $"{Math.Round(bytes / (1024.0 * 1024), 2)} MB";
            //}

            //// unique file name
            //var savedName = Guid.NewGuid() + Path.GetExtension(file.FileName);
            //var fullPath = Path.Combine(uploadPath, savedName);

            //// file save
            //using (var stream = new FileStream(fullPath, FileMode.Create))
            //{
            //    await file.CopyToAsync(stream);
            //}

            //// ✅ FULL URL (IMPORTANT)
            //var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/Images/{savedName}";

            //return Ok(new{user,group,fileName = file.FileName,fileUrl,filesize});
        }


        [HttpPost]
        [Route("/UploadPDF")]
        public async Task<IActionResult> UploadPDF(IFormFile file, string group, string user)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File missing");

            // PDF validation
            if (file.ContentType != "application/pdf")
                return BadRequest("Only PDF allowed");

            long bytes = file.Length;

            string filesize;

            if (bytes < 1024 * 1024)
            {
                filesize = $"{Math.Round(bytes / 1024.0, 2)} KB";
            }
            else
            {
                filesize = $"{Math.Round(bytes / (1024.0 * 1024), 2)} MB";
            }

            if (file == null || file.Length == 0) return BadRequest();

            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                byte[] fileBytes = ms.ToArray();
                string contentType = file.ContentType; // "application/pdf" અથવા "image/png"

                // ડેટાબેઝમાં સેવ કરવા માટેનું લોજિક (તમારું ChatMessageTable)
                // ChatPDF કોલમમાં આ byte[] સેવ કરો

                return Ok(new { user, group, fileName = file.FileName, fileBytes, filesize });
            }
        }


        [HttpPost]
        [Route("/UploadAudio")]
        public async Task<IActionResult> UploadAudio(IFormFile file, string group, string user)
        {
            if (file == null || file.Length == 0)
                return BadRequest("File missing");

            // allow audio types
            var allowedTypes = new[] { "audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4" };

            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("Only audio allowed");

            long bytes = file.Length;

            string filesize;

            if (bytes < 1024 * 1024)
            {
                filesize = $"{Math.Round(bytes / 1024.0, 2)} KB";
            }
            else
            {
                filesize = $"{Math.Round(bytes / (1024.0 * 1024), 2)} MB";
            }
            if (file == null || file.Length == 0) return BadRequest("Audio file missing");

            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                byte[] audioBytes = ms.ToArray();

                return Ok(new
                {
                    fileName = file.FileName,
                    contentType = file.ContentType, // e.g., "audio/mpeg"
                    audioUrl = audioBytes,
                    filesize
                });
            }
        }

        [HttpPost]
        [Route("/UploadRecordingFile")]
        public async Task<IActionResult> UploadRecordingFile(IFormFile file, string group, string user, int duration)
        {

            if (file == null || file.Length == 0)
                return BadRequest("File missing");

            // allow audio types
            var allowedTypes = new[] {".webm",     // Chrome / Firefox
                                                        ".mp4",      // Safari (Audio is often wrapped in mp4/m4a)
                                                        ".mpeg",     // MP3 files
                                                        ".wav",      // Standard wave files
                                                        ".ogg"       // Ogg Vorbis
                                                        };
            var extension = Path.GetExtension(file.FileName).ToLower();

            if (!allowedTypes.Contains(extension))
                return BadRequest("Only Recording file allowed");

            long bytes = file.Length;

            string filesize;

            if (bytes < 1024 * 1024)
            {
                filesize = $"{Math.Round(bytes / 1024.0, 2)} KB";
            }
            else
            {
                filesize = $"{Math.Round(bytes / (1024.0 * 1024), 2)} MB";
            }

            if (file == null || file.Length == 0) return BadRequest("Audio file missing");

            using (var ms = new MemoryStream())
            {
                await file.CopyToAsync(ms);
                byte[] fileurl = ms.ToArray();

                return Ok(new
                {
                    user,
                    group,
                    fileName = file.FileName,
                    audioUrl = fileurl,
                    fileSize = filesize,
                    duration
                });
            }
            //if (file == null || file.Length == 0)
            //    return BadRequest("File missing");

            //var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "Recordings");

            //if (!Directory.Exists(uploadPath))
            //    Directory.CreateDirectory(uploadPath);

            //long bytes = file.Length;

            //string filesize;

            //if (bytes < 1024 * 1024)
            //{
            //    filesize = $"{Math.Round(bytes / 1024.0, 2)} KB";
            //}
            //else
            //{
            //    filesize = $"{Math.Round(bytes / (1024.0 * 1024), 2)} MB";
            //}

            //var savedName = Guid.NewGuid() + ".webm";
            //var fullPath = Path.Combine(uploadPath, savedName);

            //using (var stream = new FileStream(fullPath, FileMode.Create))
            //{
            //    await file.CopyToAsync(stream);
            //}

            //var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/Recordings/{savedName}";

            //return Ok(new { user, group, fileName = file.FileName, audioUrl = fileUrl, fileSize = filesize, duration });
        }

    }
}
