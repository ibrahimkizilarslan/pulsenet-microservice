using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;
using PulseNet.Gateway.Routing;

namespace PulseNet.Gateway.Persistence;

public sealed class RouteConfigRepository
{
    private readonly IMongoCollection<RouteConfig> _collection;

    public RouteConfigRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<RouteConfig>("routes");
    }

    public async Task<List<RouteConfig>> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public async Task SeedIfEmptyAsync(IEnumerable<RouteConfig> defaultRoutes)
    {
        throw new NotImplementedException();
    }
}
