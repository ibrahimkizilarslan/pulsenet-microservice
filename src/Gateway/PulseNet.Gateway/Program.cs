using System.Text.Json;
using PulseNet.BuildingBlocks;
using PulseNet.BuildingBlocks.Auth;
using PulseNet.BuildingBlocks.Middleware;
using PulseNet.Gateway.Auth;
using PulseNet.Gateway.Forwarding;
using PulseNet.Gateway.Routing;
using Serilog;
using Prometheus;

using MongoDB.Driver;
using PulseNet.Gateway.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// CORS: allow WebUI (dev / Docker) to call the gateway from a browser (cross-origin).
builder.Services.AddCors(options =>
{
    options.AddPolicy("webui", policy =>
    {
        policy
            .SetIsOriginAllowed(static origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                try
                {
                    var uri = new Uri(origin);
                    return uri.Scheme is "http" or "https"
                           && (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase)
                               || uri.Host.Equals("127.0.0.1", StringComparison.OrdinalIgnoreCase));
                }
                catch (UriFormatException)
                {
                    return false;
                }
            })
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

var mongoConnString = builder.Configuration["Mongo:ConnectionString"] ?? "mongodb://localhost:27017";
var mongoDatabase = new MongoClient(mongoConnString)
    .GetDatabase(builder.Configuration["Mongo:DatabaseName"] ?? "pulsenet_gateway");

builder.Services.AddSingleton(mongoDatabase);
builder.Services.AddScoped<RouteConfigRepository>();

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

using (var scope = app.Services.CreateScope())
{
    var repo = scope.ServiceProvider.GetRequiredService<RouteConfigRepository>();
    var routeTable = scope.ServiceProvider.GetRequiredService<RouteTable>();

    var defaultRoutes = new List<RouteConfig>
    {
        new RouteConfig { PathPrefix = "/api/auth", DownstreamHost = "http://auth:5001", RequiresAuth = false },
        
        // POST /api/posts -> Allow everyone (Admin + User)
        new RouteConfig { PathPrefix = "/api/posts", DownstreamHost = "http://posts:5003", AllowedMethods = ["POST"], AllowedRoles = ["User", "Admin"] },
        
        // Specific Post routes (Recent/Author) -> Allow everyone
        new RouteConfig { PathPrefix = "/api/posts/by-author", DownstreamHost = "http://posts:5003", AllowedRoles = ["User", "Admin"] },
        new RouteConfig { PathPrefix = "/api/posts/recent", DownstreamHost = "http://posts:5003", AllowedRoles = ["User", "Admin"] },
        
        // GET /api/posts (List ALL) -> Admin only
        new RouteConfig { PathPrefix = "/api/posts", DownstreamHost = "http://posts:5003", AllowedMethods = ["GET"], AllowedRoles = ["Admin"] },
        
        // Catch-all generic /api/posts (e.g. for subpaths not covered) -> Admin only
        new RouteConfig { PathPrefix = "/api/posts", DownstreamHost = "http://posts:5003", AllowedRoles = ["Admin"] },

        new RouteConfig { PathPrefix = "/api/users", DownstreamHost = "http://users:5002", AllowedRoles = ["User", "Admin"] },
        new RouteConfig { PathPrefix = "/api/follows", DownstreamHost = "http://follows:5004", AllowedRoles = ["User", "Admin"] },
        new RouteConfig { PathPrefix = "/api/timeline", DownstreamHost = "http://timeline:5005", AllowedRoles = ["User", "Admin"] }
    };
    
    // We run it synchronously to guarantee routes are loaded before app serves requests.
    // FORCE seed to apply new RBAC routes.
    repo.SeedIfEmptyAsync(defaultRoutes, force: true).GetAwaiter().GetResult();
    var routes = repo.GetAllAsync().GetAwaiter().GetResult();
    routeTable.UpdateRoutes(routes);
}

// Gateway skips InternalGatewayHeaderMiddleware (see UseServiceDefaults). CORS must run after
// UseRouting so preflight OPTIONS is answered here with Access-Control-* headers instead of
// being forwarded to a downstream service that does not add them.
app.UseServiceDefaults(isGateway: true);

app.UseRouting();

app.UseCors("webui");

app.UseAuthentication();
app.UseAuthorization();

// Metrics and Swagger are mapped in UseServiceDefaults
// app.MapMetrics();

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

    var route = routeMatcher.Match(context.Request.Path, context.Request.Method);
    if (route is null)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(JsonSerializer.Serialize(new { error = "No route matched." }));
        return;
    }

    if (route.RequiresAuth && !context.Request.Path.Value?.Contains("/swagger/", StringComparison.OrdinalIgnoreCase) == true)
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
