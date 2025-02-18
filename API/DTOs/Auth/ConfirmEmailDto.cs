using System.ComponentModel.DataAnnotations;

namespace API.DTOs;

public class ConfirmEmailDto
{
    [EmailAddress]
    public required string Email { get; set; }
    public required string Token { get; set; }
}
