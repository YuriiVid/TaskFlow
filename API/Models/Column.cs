namespace API.Models;

public class Column
{
    public long Id { get; set; }
    public required string Title { get; set; }
    public long BoardId { get; set; }
    public Board Board { get; set; } = null!;
    public int Position { get; set; }
    public ICollection<Card> Cards { get; } = new List<Card>();
}
