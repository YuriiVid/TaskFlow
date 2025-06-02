namespace API.Services;

public interface IFileStorageService
{
    Task<string> StoreFileAsync(IFormFile file);
    Task<(Stream? stream, string? contentType)> GetFileStreamAsync(string fileUrl);
    Task DeleteFileAsync(string fileUrl);
}
