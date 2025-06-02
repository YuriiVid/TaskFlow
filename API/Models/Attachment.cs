using NodaTime;

namespace API.Models;

public class Attachment
{
    public long Id { get; set; }
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
    public Instant CreatedAt { get; private set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public double SizeInBytes { get; set; }
    public long CardId { get; set; }
    public Card Card { get; set; } = null!;
}
