using API.Models;
using AutoMapper;
using NodaTime;

namespace API.DTOs;

[AutoMap(typeof(Card), ReverseMap = true)]
public class UpdateCardDto
{
    public required string Title { get; set; }
    public string Description { get; set; } = string.Empty;
    public long ColumnId { get; set; }
    public Instant? DueDate { get; set; }
    public int? Position { get; set; }
}
