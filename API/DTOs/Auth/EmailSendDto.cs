namespace API.DTOs;

public class EmailSendDto
{
    public EmailSendDto(string toEmail, string subject, string body)
    {
        ToEmail = toEmail;
        Subject = subject;
        Body = body;
    }

    public string ToEmail { get; set; }
    public string Subject { get; set; }
    public string Body { get; set; }
}
