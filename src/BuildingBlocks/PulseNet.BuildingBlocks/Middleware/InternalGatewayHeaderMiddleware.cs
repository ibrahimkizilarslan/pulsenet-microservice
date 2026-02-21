using Microsoft.AspNetCore.Http;

namespace PulseNet.BuildingBlocks.Middleware;

public sealed class InternalGatewayHeaderMiddleware
{
    private const string InternalHeader = "X-Internal-Gateway";
    private const string ExpectedValue = "PulseNetSecret";
    private readonly RequestDelegate _next;

    public InternalGatewayHeaderMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (!context.Request.Headers.TryGetValue(InternalHeader, out var headerValue)
            || headerValue != ExpectedValue)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(new { error = "Forbidden: Missing or invalid internal gateway header." });
            return;
        }

        await _next(context);
    }
}
