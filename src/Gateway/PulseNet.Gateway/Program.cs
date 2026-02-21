using System.Text.Json;
using PulseNet.BuildingBlocks.Auth;
using PulseNet.BuildingBlocks.Middleware;
using PulseNet.Gateway.Auth;
using PulseNet.Gateway.Forwarding;
using PulseNet.Gateway.Routing;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithProperty("Application", "PulseNet.Gateway")
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] [Gateway] {Message:lj} {Properties:j}{NewLine}{Exception}");
});

builder.Services.AddPulseNetJwt(builder.Configuration);

builder.Services.AddSingleton<RouteTable>();
builder.Services.AddSingleton<RouteMatcher>();
builder.Services.AddSingleton<GatewayAuthZ>();
builder.Services.AddScoped<Forwarder>();

builder.Services.AddHttpClient("gateway", client =>
{
    client.Timeout = TimeSpan.FromSeconds(30);
});

var app = builder.Build();

app.UseMiddleware<CorrelationIdMiddleware>();
app.UseSerilogRequestLogging();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", async (HttpContext context) =>
{
    context.Response.ContentType = "application/json";
    await context.Response.WriteAsync(JsonSerializer.Serialize(new { status = "healthy", service = "gateway" }));
});

app.Map("/api/{**catch-all}", async (HttpContext context) =>
{
    var routeMatcher = context.RequestServices.GetRequiredService<RouteMatcher>();
    var authZ = context.RequestServices.GetRequiredService<GatewayAuthZ>();
    var forwarder = context.RequestServices.GetRequiredService<Forwarder>();

    var route = routeMatcher.Match(context.Request.Path);
    if (route is null)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "No route matched." }));
        return;
    }

    if (route.RequiresAuth)
    {
        if (!authZ.IsAuthenticated(context))
        {
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Unauthorized" }));
            return;
        }

        if (!authZ.HasRequiredRole(context, route.AllowedRoles))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "Forbidden" }));
            return;
        }
    }

    await forwarder.ForwardAsync(context, route);
});

app.Run();

public partial class Program { }
