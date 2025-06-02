using NodaTime;

namespace API.DTOs;

public class UpdateCardDto
{
    public required string Title { get; set; }
    public string? Description { get; set; }
    public long ColumnId { get; set; }
    public Instant? DueDate { get; set; }
    public int? Position { get; set; }
    public bool IsCompleted { get; set; }
}
