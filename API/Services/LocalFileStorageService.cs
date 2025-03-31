using System.Security.Cryptography;

namespace API.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadDirectory;

    public LocalFileStorageService(IConfiguration configuration)
    {
        _uploadDirectory = configuration.GetValue<string>("UploadDirectory") ?? "uploads";
        Directory.CreateDirectory(_uploadDirectory);
    }

    public async Task<string> StoreFileAsync(IFormFile file)
    {
        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{GenerateRandomFileName()}{fileExtension}";
        var filePath = Path.Combine(_uploadDirectory, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        return fileName;
    }

    public Task DeleteFileAsync(string fileUrl)
    {
        var filePath = Path.Combine(_uploadDirectory, fileUrl);
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }
        return Task.CompletedTask;
    }

    private static string GenerateRandomFileName()
    {
        var bytes = RandomNumberGenerator.GetBytes(16);
        return Convert.ToHexString(bytes);
    }
}
