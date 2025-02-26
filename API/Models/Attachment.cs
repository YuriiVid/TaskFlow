namespace API.Models;

public class Attachment
{
    public long Id { get; set; }
    public required string FileName { get; set; }
    public required string FileUrl { get; set; }
    public long CardId { get; set; }
    public required Card Card { get; set; }
}
