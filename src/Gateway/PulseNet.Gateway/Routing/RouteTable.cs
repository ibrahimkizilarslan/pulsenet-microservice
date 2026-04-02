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
    public string[] AllowedMethods { get; init; } = []; // Empty means any method
}

public sealed class RouteTable
{
    private List<RouteConfig> _routes = [];

    public void UpdateRoutes(IEnumerable<RouteConfig> routes)
    {
        _routes = routes.ToList();
    }

    public IReadOnlyList<RouteConfig> Routes => _routes.AsReadOnly();
}
