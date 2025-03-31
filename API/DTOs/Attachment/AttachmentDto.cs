namespace API.DTOs;

public class AttachmentDto
{
    public long Id { get; set; }
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
}
