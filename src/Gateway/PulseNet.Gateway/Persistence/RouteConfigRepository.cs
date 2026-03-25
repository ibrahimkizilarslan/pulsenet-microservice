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
        return await _collection.Find(_ => true).ToListAsync();
    }

    public async Task SeedIfEmptyAsync(IEnumerable<RouteConfig> defaultRoutes)
    {
        var count = await _collection.EstimatedDocumentCountAsync();
        if (count == 0 && defaultRoutes.Any())
        {
            await _collection.InsertManyAsync(defaultRoutes);
        }
    }
}
