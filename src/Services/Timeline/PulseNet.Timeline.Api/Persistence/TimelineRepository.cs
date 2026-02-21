using MongoDB.Driver;
using PulseNet.Timeline.Api.Domain;

namespace PulseNet.Timeline.Api.Persistence;

public sealed class TimelineRepository
{
    private readonly IMongoCollection<TimelineEntry> _collection;

    public TimelineRepository(IMongoDatabase database)
    {
        _collection = database.GetCollection<TimelineEntry>("timeline");
    }

    public async Task<List<TimelineEntry>> GetTimelineAsync(string userId, int limit = 50) =>
        await _collection.Find(t => t.UserId == userId)
            .SortByDescending(t => t.PostCreatedAt)
            .Limit(limit)
            .ToListAsync();

    public async Task AddEntryAsync(TimelineEntry entry) =>
        await _collection.InsertOneAsync(entry);

    public async Task AddEntriesBatchAsync(IEnumerable<TimelineEntry> entries) =>
        await _collection.InsertManyAsync(entries);
}
