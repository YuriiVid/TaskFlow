using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class UpsertCollumnDto
{
    [Required(ErrorMessage = "Title is required")]
    public required string Title { get; set; }
}
