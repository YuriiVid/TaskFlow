using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpsertCommentDto
{
    [Required(ErrorMessage = "Content is required")]
    public required string Content { get; set; }
}
