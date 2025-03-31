namespace API.DTOs;

public class LabelDto
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public required string Color { get; set; }
}
