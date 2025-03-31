namespace API.Services;

public interface IFileStorageService
{
    Task<string> StoreFileAsync(IFormFile file);
    Task DeleteFileAsync(string fileUrl);
}
