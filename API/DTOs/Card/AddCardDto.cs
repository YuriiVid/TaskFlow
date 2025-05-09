namespace API.DTOs;

public class AddCardDto
{
    public required string Title { get; set; }
    public long ColumnId { get; set; }
}
