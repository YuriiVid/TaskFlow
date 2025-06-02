using NodaTime;

namespace API.DTOs;

public class AttachmentDto
{
    public long Id { get; set; }
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
    public double SizeInBytes { get; set; }
    public Instant CreatedAt { get; set; }
}
