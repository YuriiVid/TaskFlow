using API.DTOs;
using MailKit.Net.Smtp;
using MimeKit;

namespace API.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    private readonly ILogger _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task SendEmailAsync(EmailSendDto emailSend)
    {
        var emailMessage = new MimeMessage();
        emailMessage.From.Add(new MailboxAddress(_config["Email:SenderName"], _config["Email:SenderEmail"]));
        emailMessage.To.Add(new MailboxAddress("", emailSend.ToEmail));
        emailMessage.Subject = emailSend.Subject;
        emailMessage.Body = new TextPart("html") { Text = emailSend.Body };
        using var client = new SmtpClient();
        await client.ConnectAsync(
            _config["Email:Host"],
            int.Parse(_config["Email:Port"]),
            MailKit.Security.SecureSocketOptions.StartTls
        );
        await client.AuthenticateAsync(_config["Email:SenderEmail"], _config["Email:Password"]);
        await client.SendAsync(emailMessage);
        await client.DisconnectAsync(true);
    }

    public async Task<bool> SendConfirmationEmailAsync(string toEmail, string fullName, string verificationLink)
    {
        var emailBody = await LoadEmailTemplateAsync("Templates/Email/Build/SignupConfirmation.html");
        emailBody = emailBody
            .Replace("{{ ProjectName }}", _config["Email:SenderName"])
            .Replace("{{ UserName }}", fullName)
            .Replace("{{ Link }}", verificationLink)
            .Replace("{{ ValidHours }}", _config["Email:TokenExpireHours"]);
        string subject = "Verify Your Email";
        try
        {
            await SendEmailAsync(new EmailSendDto(toEmail, subject, emailBody));
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return false;
        }
    }

    public async Task<bool> SendResetPasswordEmailAsync(string toEmail, string fullName, string verificationLink)
    {
        var emailBody = await LoadEmailTemplateAsync("Templates/Email/Build/ResetPassword.html");
        emailBody = emailBody
            .Replace("{{ ProjectName }}", _config["Email:SenderName"])
            .Replace("{{ UserName }}", fullName)
            .Replace("{{ Link }}", verificationLink)
            .Replace("{{ ValidHours }}", _config["Email:TokenExpireHours"]);
        string subject = "Reset Your Password";
        try
        {
            await SendEmailAsync(new EmailSendDto(toEmail, subject, emailBody));
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.Message);
            return false;
        }
    }

    private static async Task<string> LoadEmailTemplateAsync(string filePath)
    {
        return await File.ReadAllTextAsync(filePath);
    }
}
