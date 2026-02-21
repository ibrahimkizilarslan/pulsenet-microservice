using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;

namespace PulseNet.BuildingBlocks.Persistence;

public static class MongoExtensions
{
    public static IServiceCollection AddMongoDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetSection("Mongo")["ConnectionString"]
            ?? throw new InvalidOperationException("MongoDB ConnectionString is not configured.");

        var databaseName = configuration.GetSection("Mongo")["DatabaseName"]
            ?? throw new InvalidOperationException("MongoDB DatabaseName is not configured.");

        services.AddSingleton<IMongoClient>(_ => new MongoClient(connectionString));
        services.AddSingleton(sp => sp.GetRequiredService<IMongoClient>().GetDatabase(databaseName));

        return services;
    }
}
