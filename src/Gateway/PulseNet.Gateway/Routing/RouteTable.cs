using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace PulseNet.Gateway.Routing;

public sealed class RouteConfig
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
    
    public required string PathPrefix { get; init; }
    public required string DownstreamHost { get; init; }
    public bool RequiresAuth { get; init; } = true;
    public string[] AllowedRoles { get; init; } = [];
}

public sealed class RouteTable
{
    private readonly List<RouteConfig> _routes = [];

    public RouteTable()
    {
        _routes.AddRange(
        [
            new RouteConfig
            {
                PathPrefix = "/api/auth",
                DownstreamHost = "http://auth:5001",
                RequiresAuth = false
            },
            new RouteConfig
            {
                PathPrefix = "/api/users",
                DownstreamHost = "http://users:5002",
                RequiresAuth = true
            },
            new RouteConfig
            {
                PathPrefix = "/api/posts",
                DownstreamHost = "http://posts:5003",
                RequiresAuth = true
            },
            new RouteConfig
            {
                PathPrefix = "/api/follows",
                DownstreamHost = "http://follows:5004",
                RequiresAuth = true
            },
            new RouteConfig
            {
                PathPrefix = "/api/timeline",
                DownstreamHost = "http://timeline:5005",
                RequiresAuth = true
            }
        ]);
    }

    public IReadOnlyList<RouteConfig> Routes => _routes.AsReadOnly();
}
