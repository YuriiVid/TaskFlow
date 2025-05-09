using API.Exceptions;

namespace API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    private async Task WriteErrorResponse(HttpContext context, int statusCode, string message)
    {
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "text/json";
        var response = new { message };
        await context.Response.WriteAsJsonAsync(response);
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            switch (ex)
            {
                case BoardNotFoundException notFoundEx:
                    await WriteErrorResponse(context, StatusCodes.Status404NotFound, notFoundEx.Message);
                    break;
                case BoardAccessDeniedException accessDeniedEx:
                    await WriteErrorResponse(context, StatusCodes.Status403Forbidden, accessDeniedEx.Message);
                    break;
                default:
                    await WriteErrorResponse(
                        context,
                        StatusCodes.Status500InternalServerError,
                        "An unexpected error occurred."
                    );
                    Console.WriteLine(ex.Message);
                    break;
            }
        }
    }
}
