using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.WebUtilities;

namespace API.Filters;

public class GlobalJsonResponseFilter : IAsyncResultFilter
{
    public async Task OnResultExecutionAsync(ResultExecutingContext context, ResultExecutionDelegate next)
    {
        var result = context.Result;

        ObjectResult? newResult = null;

        // 1) Any ObjectResult whose .Value is a string
        if (result is ObjectResult obj && obj.Value is string str)
        {
            newResult = new ObjectResult(new { message = str })
            {
                StatusCode = obj.StatusCode ?? context.HttpContext.Response.StatusCode,
            };
        }
        // 2) Any plain ContentResult
        else if (result is ContentResult content)
        {
            newResult = new ObjectResult(new { message = content.Content })
            {
                StatusCode = content.StatusCode ?? context.HttpContext.Response.StatusCode,
            };
        }
        // 3) Any bare StatusCodeResult (e.g. BadRequest(), NotFound(), NoContent(), etc.)
        else if (result is StatusCodeResult statusOnly)
        {
            // Skip wrapping 204 No Content responses
            if (statusOnly.StatusCode != StatusCodes.Status204NoContent)
            {
                // Map 400 → "Bad Request", 302 → "Found", etc.
                var reason = ReasonPhrases.GetReasonPhrase(statusOnly.StatusCode);
                newResult = new ObjectResult(new { message = reason }) { StatusCode = statusOnly.StatusCode };
            }
        }

        if (newResult != null)
        {
            context.Result = newResult;
        }

        await next();
    }
}
