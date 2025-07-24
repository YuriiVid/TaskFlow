using System.Security.Cryptography;
using Microsoft.AspNetCore.StaticFiles;

namespace API.Services;

public class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadDirectory;

    public LocalFileStorageService(IConfiguration configuration)
    {
        _uploadDirectory = configuration.GetValue<string>("UploadDirectory") ?? "Uploads";
        Directory.CreateDirectory(_uploadDirectory);
    }

    public async Task<string> StoreFileAsync(IFormFile file, string subDirectory = "")
    {
        var fileExtension = Path.GetExtension(file.FileName);
        var fileName = $"{GenerateRandomFileName()}{fileExtension}";
        var filePath = Path.Combine(_uploadDirectory, fileName);

        if (subDirectory != "")
        {
            var subDirPath = Path.Combine(_uploadDirectory, subDirectory);
            Directory.CreateDirectory(subDirPath);
            filePath = Path.Combine(subDirPath, fileName);
        }

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

    public Task<(Stream? stream, string? contentType)> GetFileStreamAsync(string fileUrl)
    {
        var fullPath = Path.Combine(_uploadDirectory, fileUrl);
        if (!File.Exists(fullPath))
        {
            return Task.FromResult<(Stream?, string?)>((null, null));
        }

        // Open for read
        var stream = new FileStream(fullPath, FileMode.Open, FileAccess.Read, FileShare.Read);

        // Resolve MIME type by file extension
        var provider = new FileExtensionContentTypeProvider();
        if (!provider.TryGetContentType(fullPath, out var contentType))
        {
            contentType = "application/octet-stream";
        }

        return Task.FromResult<(Stream?, string?)>((stream, contentType));
    }

    private static string GenerateRandomFileName()
    {
        var bytes = RandomNumberGenerator.GetBytes(16);
        return Convert.ToHexString(bytes);
    }
}
